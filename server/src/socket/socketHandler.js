const Session = require('../models/Session');
const ChatMessage = require('../models/ChatMessage');
const History = require('../models/History');
const mongoose = require('mongoose');

const rooms = {};
const roomData = {}; 
const saveDebounceTimeout = {}; 

const initiateSocketEvents = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        socket.on('joinRoom', async ({ roomId, username }) => {
            if (!roomId) return;
            socket.join(roomId);
            
            if (!rooms[roomId]) rooms[roomId] = [];
            
            const existingUser = rooms[roomId].find(u => u.socketId === socket.id);
            let role = 'candidate';
            
            if (!existingUser) {
                role = rooms[roomId].length === 0 ? 'interviewer' : 'candidate';
                const user = {
                    socketId: socket.id,
                    username: username || `User-${socket.id.substring(0, 4)}`,
                    role
                };
                rooms[roomId].push(user);
            } else {
                role = existingUser.role;
            }

            if (!roomData[roomId]) {
                roomData[roomId] = {
                    question: 'Welcome to your interview! The interviewer will post a question here.',
                    endTime: null
                };
            }

            socket.emit('assignRole', role);
            socket.emit('updateQuestion', roomData[roomId].question);
            if (roomData[roomId].endTime && roomData[roomId].endTime > Date.now()) {
                socket.emit('timerStarted', { endTime: roomData[roomId].endTime });
            }
            
            socket.to(roomId).emit('userJoined', username || socket.id);
            io.to(roomId).emit('roomUsers', rooms[roomId]);
            console.log(`[Socket] User joined room: ${roomId}`);

            try {
                if (mongoose.connection.readyState === 1) {
                    let session = await Session.findOne({ roomId });
                    if (session) {
                        socket.emit('loadCode', { code: session.code, language: session.language });
                    }

                    const chatHistory = await ChatMessage.find({ roomId }).sort({ timestamp: 1 }).limit(50);
                    if (chatHistory.length > 0) {
                        socket.emit('loadChatHistory', chatHistory);
                    }
                }
            } catch (error) {
                console.error('[DB Error] Failed to load room state', error.message);
            }
        });

        const handleLeave = () => {
            for (const roomId in rooms) {
                const index = rooms[roomId].findIndex(u => u.socketId === socket.id);
                if (index !== -1) {
                    const user = rooms[roomId][index];
                    rooms[roomId].splice(index, 1);
                    
                    socket.to(roomId).emit('userLeft', user.username);
                    io.to(roomId).emit('roomUsers', rooms[roomId]);
                    
                    if (rooms[roomId].length === 0) {
                        delete rooms[roomId];
                        if (roomData[roomId]) delete roomData[roomId];
                    }
                    console.log(`[Socket] User ${user.username} left room: ${roomId}`);
                    break;
                }
            }
        };

        socket.on('leaveRoom', ({ roomId }) => {
            handleLeave();
            socket.leave(roomId);
        });

        socket.on('codeChange', ({ roomId, code, language }) => {
            if (!roomId) return;
            socket.to(roomId).emit('codeUpdate', code);

            if (saveDebounceTimeout[roomId]) clearTimeout(saveDebounceTimeout[roomId]);
            
            saveDebounceTimeout[roomId] = setTimeout(async () => {
                try {
                    if (mongoose.connection.readyState === 1) {
                        await Session.findOneAndUpdate(
                            { roomId },
                            { code, language: language || 'javascript', updatedAt: new Date() },
                            { upsert: true, new: true }
                        );

                        await History.create({ roomId, code, timestamp: Date.now() });
                    }
                } catch (error) {
                    console.error('[DB Error] Failed to auto-save code', error.message);
                }
            }, 500);
        });

        socket.on('sendMessage', async ({ roomId, message, user }) => {
            if (!roomId || !message) return;
            
            const chatPayload = { user: user || 'Anonymous', message, timestamp: new Date() };
            io.to(roomId).emit('receiveMessage', chatPayload);

            try {
                if (mongoose.connection.readyState === 1) {
                    await ChatMessage.create({ roomId, ...chatPayload });
                }
            } catch (err) {
                console.error('[DB Error] Failed to save chat message', err.message);
            }
        });

        socket.on('cursorMove', ({ roomId, cursorPosition, username }) => {
            if (!roomId) return;
            socket.to(roomId).emit('cursorUpdate', { socketId: socket.id, cursorPosition, username });
        });

        socket.on('updateQuestion', ({ roomId, question }) => {
            if (roomData[roomId]) {
                roomData[roomId].question = question;
                socket.to(roomId).emit('updateQuestion', question);
            }
        });

        socket.on('startTimer', ({ roomId, duration }) => {
            if (roomData[roomId]) {
                const endTime = Date.now() + duration;
                roomData[roomId].endTime = endTime;
                io.to(roomId).emit('timerStarted', { endTime });
            }
        });

        socket.on('disconnect', () => {
            handleLeave();
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });
};

module.exports = initiateSocketEvents;
