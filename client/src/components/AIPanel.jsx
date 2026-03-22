import { useState } from 'react';
import { Loader2, Copy, Sparkles, Bug, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL } from '../config';

const AIPanel = ({ code }) => {
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState('');

    const handleAIAction = async (selectedAction) => {
        if (!code || !code.trim()) {
            toast.error("Please write some code first", { style: { background: '#1e293b', color: '#cbd5e1' } });
            return;
        }

        setIsLoading(true);
        setAction(selectedAction);
        setResponse('');

        try {
            const res = await fetch(`${BACKEND_URL}/ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code, action: selectedAction })
            });
            const data = await res.json();

            if (res.ok) {
                setResponse(data.result);
            } else {
                setResponse(`Error: ${data.error || 'Something went wrong'}`);
                toast.error(data.error || "AI request failed");
            }
        } catch (error) {
            setResponse('Connection error. Is the backend running?');
            toast.error('Connection error');
        } finally {
            setIsLoading(false);
            setAction('');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(response);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="flex flex-col h-full bg-[#1e293b] text-slate-300 w-full shrink-0">
            <div className="h-10 border-b border-slate-700/50 flex items-center px-4 bg-slate-800/50 shrink-0 gap-2">
                <Sparkles size={14} className="text-purple-400" />
                <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">AI Assistant</h3>
            </div>

            <div className="p-3 flex flex-col gap-2 shrink-0 border-b border-slate-700/50 bg-[#1e293b]">
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAIAction('explain')}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 shadow-sm text-slate-200 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-xs font-semibold tracking-wide"
                >
                    <Sparkles size={14} className="text-blue-400" /> Explain Code
                </motion.button>
                <div className="grid grid-cols-2 gap-2">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAIAction('optimize')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 shadow-sm text-slate-200 py-2 rounded-lg transition-colors disabled:opacity-50 text-[11px] font-semibold tracking-wide"
                    >
                        <Zap size={14} className="text-yellow-400" /> Optimize
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAIAction('debug')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 shadow-sm text-slate-200 py-2 rounded-lg transition-colors disabled:opacity-50 text-[11px] font-semibold tracking-wide"
                    >
                        <Bug size={14} className="text-red-400" /> Find Bugs
                    </motion.button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-slate-900/30">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                        <Loader2 size={28} className="animate-spin text-purple-500" />
                        <span className="text-xs font-semibold animate-pulse text-purple-400/80 tracking-wide">
                            {action === 'explain' ? 'Analyzing logic...' : action === 'optimize' ? 'Benchmarking algorithms...' : 'Hunting for bugs...'}
                        </span>
                    </div>
                ) : response ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-3 h-full relative"
                    >
                        <div className="flex justify-between items-center shrink-0 border-b border-slate-700/50 pb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={10} className="text-purple-500"/> Generative Output</span>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={copyToClipboard}
                                className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-md border border-slate-700"
                                title="Copy Response"
                            >
                                <Copy size={12} />
                            </motion.button>
                        </div>
                        <div className="text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-wrap break-words pb-4">
                            {response}
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 gap-4 opacity-50">
                        <Sparkles size={36} className="text-slate-500" />
                        <p className="text-xs px-4 leading-relaxed font-medium">Select an action above to get AI assistance for your active code snippet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIPanel;
