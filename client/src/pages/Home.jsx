import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { generateRoomId } from '../utils/generateRoomId';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const joinRoom = (e) => {
        if (e) e.preventDefault();
        
        if (!roomId.trim()) {
            toast.error('Room ID is required to join', { style: { background: '#1e293b', color: '#fff', borderRadius: '8px' } });
            return;
        }
        
        navigate(`/editor/${roomId}`);
    };

    const handleInputEnter = (e) => {
        if (e.key === 'Enter') {
            joinRoom(e);
        }
    };

    const handleCreateRoom = () => {
        const id = generateRoomId();
        toast.success('Generated new room', { style: { background: '#1e293b', color: '#fff', borderRadius: '8px' } });
        navigate(`/editor/${id}`);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                className="bg-[#1e293b] p-10 rounded-2xl shadow-2xl w-full max-w-md border border-[#334155] relative overflow-hidden"
            >
                {/* Decorative background glow */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col items-center justify-center mb-10 relative z-10">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner mb-4 transition-base hover:scale-105 hover:bg-slate-800/50">
                        <Code2 size={42} className="text-accent" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">LiveCodeX</h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Professional Collaborative Environment</p>
                </div>
                
                <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">
                            Join a Workspace
                        </label>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            onKeyDown={handleInputEnter}
                            className="w-full px-4 py-3.5 bg-slate-900/80 border border-slate-600 rounded-xl focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 text-white placeholder-slate-500 transition-base font-mono text-sm shadow-inner"
                            placeholder="Enter Room ID (e.g. xyz-123)"
                        />
                    </div>
                    
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={joinRoom}
                        className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-4 rounded-xl transition-base shadow-lg shadow-accent/25 flex items-center justify-center gap-2 group"
                    >
                        Join Room
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </motion.button>
                    
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-700"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">or</span>
                        <div className="flex-grow border-t border-slate-700"></div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateRoom}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-base flex items-center justify-center gap-2"
                    >
                        Create New Room
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
