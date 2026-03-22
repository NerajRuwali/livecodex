const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const { PORT, ENV } = require('./config/serverConfig');
const initiateSocketEvents = require('./socket/socketHandler');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/index');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // restrict to frontend domain in production
        methods: ['GET', 'POST']
    }
});

initiateSocketEvents(io);

app.use('/', apiRoutes);

app.post('/ai', async (req, res) => {
    try {
        const { code, action } = req.body;
        if (!code) return res.status(400).json({ error: 'Code is required' });

        let promptText = '';
        if (action === 'explain') {
            promptText = `Explain this code clearly:\n\n${code}`;
        } else if (action === 'optimize') {
            promptText = `Optimize this code:\n\n${code}`;
        } else if (action === 'debug') {
            promptText = `Find bugs and fix this code:\n\n${code}`;
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: promptText }] }]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const data = response.data;
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!resultText) {
            return res.status(500).json({ error: "Failed to generate AI response" });
        }

        res.json({ result: resultText });

    } catch (error) {
        console.error('AI API Error:', error?.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate AI response' });
    }
});

app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

server.on('error', (error) => {
    if (error.syscall !== 'listen') throw error;

    switch (error.code) {
        case 'EACCES':
            console.error(`[Server Error] Port ${PORT} requires elevated privileges.`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`\n[Server Error] ⚠️  Port ${PORT} is already in use.`);
            console.error(`[Server Error] Please free up the port or use a different one in your .env file.`);
            console.error(`\n💡 To kill the process using port ${PORT} (Mac/Linux), run:\n   lsof -i :${PORT}\n   kill -9 <PID>\n`);
            process.exit(1);
            break;
        default:
            console.error(`[Server Error] Unexpected error occurred: ${error.message}`);
            process.exit(1);
    }
});

server.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 [Server] LiveCodeX backend is actively running!`);
    console.log(`🌍 [Server] Environment : ${ENV}`);
    console.log(`🔌 [Server] Port        : ${PORT}`);
    console.log(`=========================================\n`);
});
