import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const OutputPanel = ({ output, status, isLoading }) => {
    return (
        <div className="h-full w-full bg-[#090e17] flex flex-col text-slate-300 shrink-0 relative overflow-hidden">
            {/* Header */}
            <div className="h-10 bg-[#1e293b]/80 backdrop-blur-sm border-b border-slate-700/50 px-4 flex items-center justify-between shrink-0 absolute top-0 w-full z-10">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-slate-400" />
                    <span className="text-xs uppercase font-semibold text-slate-300 tracking-wider">Terminal</span>
                </div>
                {status && !isLoading && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        status.toLowerCase().includes('accepted') 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {status}
                    </span>
                )}
            </div>

            {/* Console Log Area */}
            <div className="flex-1 p-5 pt-14 font-mono text-[13px] overflow-y-auto whitespace-pre-wrap leading-relaxed custom-scrollbar selection:bg-accent/30 selection:text-white">
                {isLoading ? (
                    <div className="text-accent animate-pulse flex items-center gap-3">
                        <svg className="animate-spin h-4 w-4 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading runtime environment...
                    </div>
                ) : output ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${status && !status.toLowerCase().includes('accepted') ? 'text-red-400' : 'text-slate-300'}`}
                    >
                        {output}
                    </motion.div>
                ) : (
                    <div className="text-slate-600 flex flex-col gap-1 items-start font-mono text-sm opacity-50 select-none">
                        <span>~$ wait-for-execution</span>
                        <span>Click "Run" above to view compilation results.</span>
                        <span className="animate-pulse">_</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputPanel;
