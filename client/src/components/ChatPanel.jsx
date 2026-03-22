import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { socket } from '../socket/socket';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPanel = ({ roomId, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
        };

        const handleLoadChatHistory = (history) => {
            setMessages(history);
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('loadChatHistory', handleLoadChatHistory);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('loadChatHistory', handleLoadChatHistory);
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        
        if (!input.trim()) return;

        socket.emit('sendMessage', { roomId, message: input, user: currentUser });
        
        setInput('');
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="w-full bg-[#1e293b] flex flex-col h-full text-slate-300">
            <div className="h-10 border-b border-slate-700/50 flex items-center px-4 shrink-0 bg-slate-800/50">
                <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    <h3 className="font-semibold text-xs tracking-wider text-slate-300 uppercase">Room Chat</h3>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-3">
                        <MessageSquare size={32} className="text-slate-500" />
                        <span className="text-xs text-slate-400">No messages yet.<br/>Say hello!</span>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.user === currentUser;
                        return (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className="text-[10px] text-slate-500 mb-1 px-1 font-medium tracking-wide">
                                    {isMe ? 'You' : msg.user} <span className="text-slate-600 ml-1">{formatTime(msg.timestamp)}</span>
                                </div>
                                <div 
                                    className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm break-words shadow-sm
                                        ${isMe 
                                        ? 'bg-accent text-white rounded-br-sm' 
                                        : 'bg-slate-700 text-slate-200 rounded-bl-sm border border-slate-600/50'
                                    }`}
                                >
                                    {msg.message}
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-slate-700/50 shrink-0 bg-[#1e293b]">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-800/80 border border-slate-600 hover:border-slate-500 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-slate-200 placeholder-slate-500 transition-base shadow-inner"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!input.trim()}
                        className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-accent/20"
                    >
                        <Send size={16} className="-ml-0.5" />
                    </motion.button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
