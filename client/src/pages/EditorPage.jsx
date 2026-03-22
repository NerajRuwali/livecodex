import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Copy, Code2, LogOut, Play, Pause, RotateCcw, History, Users, MessageSquare, Terminal, Sparkles, BookOpen } from 'lucide-react';
import { socket } from '../socket/socket';
import CodeEditor from '../components/CodeEditor';
import ChatPanel from '../components/ChatPanel';
import AIPanel from '../components/AIPanel';
import OutputPanel from '../components/OutputPanel';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';

const ResizeHandle = () => (
    <Separator className="w-1 bg-[#0f172a] hover:bg-accent/80 transition-colors mx-0 cursor-col-resize flex items-center justify-center shrink-0 group">
        <div className="h-8 w-0.5 bg-slate-700 rounded-full group-hover:bg-accent transition-colors" />
    </Separator>
);

const VerticalResizeHandle = () => (
    <Separator className="h-1 bg-[#0f172a] hover:bg-accent/80 transition-colors my-0 cursor-row-resize flex items-center justify-center shrink-0 group">
        <div className="w-8 h-0.5 bg-slate-700 rounded-full group-hover:bg-accent transition-colors" />
    </Separator>
);

const EditorPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    const [username] = useState(`User-${Math.floor(Math.random() * 1000)}`);
    const [users, setUsers] = useState([]);
    
    const [role, setRole] = useState('');
    const [question, setQuestion] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    const [isPlaybackMode, setIsPlaybackMode] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!roomId) {
            navigate('/');
            return;
        }

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit('joinRoom', { roomId, username });

        const handleRoomUsers = (usersList) => setUsers(usersList);
        const handleUserJoined = (name) => toast.success(`${name} joined`, { style: { background: '#1e293b', color: '#fff' } });
        const handleUserLeft = (name) => {
            toast(`${name} left`, { icon: '👋', style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' } });
        };
        
        const handleAssignRole = (assignedRole) => setRole(assignedRole);
        const handleUpdateQuestion = (q) => setQuestion(q);

        socket.on('roomUsers', handleRoomUsers);
        socket.on('userJoined', handleUserJoined);
        socket.on('userLeft', handleUserLeft);
        socket.on('assignRole', handleAssignRole);
        socket.on('updateQuestion', handleUpdateQuestion);

        return () => {
            socket.emit('leaveRoom', { roomId });
            socket.off('roomUsers', handleRoomUsers);
            socket.off('userJoined', handleUserJoined);
            socket.off('userLeft', handleUserLeft);
            socket.off('assignRole', handleAssignRole);
            socket.off('updateQuestion', handleUpdateQuestion);
        };
    }, [roomId, username, navigate]);

    useEffect(() => {
        let interval;
        const handleTimerStarted = ({ endTime }) => {
            setIsTimerRunning(true);
            if (interval) clearInterval(interval);
            
            const updateTimer = () => {
                const remaining = Math.max(0, endTime - Date.now());
                setTimeLeft(remaining);
                if (remaining === 0) {
                    clearInterval(interval);
                    setIsTimerRunning(false);
                }
            };
            
            updateTimer();
            interval = setInterval(updateTimer, 1000);
        };
        
        socket.on('timerStarted', handleTimerStarted);
        return () => {
            socket.off('timerStarted', handleTimerStarted);
            if (interval) clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const handleCodeUpdate = (newCode) => {
            setCode(newCode);
        };
        socket.on("codeUpdate", handleCodeUpdate);
        return () => socket.off("codeUpdate", handleCodeUpdate);
    }, []);

    useEffect(() => {
        const handleLoadCode = ({ code, language }) => {
            setCode(code);
            setSelectedLanguage(language || "javascript");
        };
        socket.on("loadCode", handleLoadCode);
        return () => socket.off("loadCode", handleLoadCode);
    }, []);

    useEffect(() => {
        const handleCopy = (e) => {
            if (role === "candidate") {
                e.preventDefault();
                toast.error("Copy disabled during interview", { style: { background: '#ef4444', color: '#fff' } });
            }
        };

        const handlePaste = (e) => {
            if (role === "candidate") {
                e.preventDefault();
                toast.error("Paste disabled during interview", { style: { background: '#ef4444', color: '#fff' } });
            }
        };

        const handleVisibility = () => {
            if (document.hidden && role === "candidate") {
                toast.error("Tab switching detected!", { duration: 5000, style: { border: '1px solid #ef4444' } });
                socket.emit('sendMessage', { roomId, message: "⚠️ [SYSTEM] Tab switching detected from Candidate!", user: "Interview System" });
            }
        };

        document.addEventListener("copy", handleCopy);
        document.addEventListener("paste", handlePaste);
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("paste", handlePaste);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [role, roomId]);

    useEffect(() => {
        if (isPlaybackMode) {
            setIsLocked(true);
        } else if (timeLeft <= 0 && role === "candidate") {
            setIsLocked(true);
        } else {
            setIsLocked(false);
        }
    }, [timeLeft, role, isPlaybackMode]);

    useEffect(() => {
        let interval;
        if (isPlaying && isPlaybackMode) {
            interval = setInterval(() => {
                setPlaybackIndex(prev => {
                    if (prev >= historyData.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 500);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, isPlaybackMode, historyData.length]);

    const togglePlaybackMode = async () => {
        if (isPlaybackMode) {
            setIsPlaybackMode(false);
            setIsPlaying(false);
            setPlaybackIndex(0);
        } else {
            try {
                const res = await fetch(`http://localhost:5001/history/${roomId}`);
                const data = await res.json();
                if (data.success && data.data.length > 0) {
                    setHistoryData(data.data);
                    setIsPlaybackMode(true);
                    setPlaybackIndex(0);
                    setIsPlaying(false);
                } else {
                    toast.error("No history available", { style: { background: '#1e293b', color: '#cbd5e1' } });
                }
            } catch (err) {
                toast.error("Failed to fetch history");
            }
        }
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        socket.emit('codeChange', { roomId, code: newCode, language: selectedLanguage });
    };

    const handleRunCode = async () => {
        if (!code.trim()) {
            toast.error('Code cannot be empty');
            return;
        }

        setIsRunning(true);
        setStatus('Running...');
        setOutput('');
        
        try {
            const response = await fetch('http://localhost:5001/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language: selectedLanguage })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setStatus(data.status);
                setOutput(data.output);
            } else {
                setStatus('Error');
                setOutput(data.message || 'Execution failed');
                toast.error(data.message || 'Failed to run code');
            }
        } catch (error) {
            setStatus('Connection Error');
            setOutput(error.message);
            toast.error('Unable to reach compiler backend!');
        } finally {
            setIsRunning(false);
        }
    };

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID copied');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const leaveRoom = () => {
        navigate('/');
    };

    const formatTimer = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.4 }}
            className="flex flex-col h-screen bg-[#0f172a] text-slate-300 font-sans overflow-hidden"
        >
            {/* Top Navigation Bar */}
            <header className="h-14 bg-[#1e293b] border-b border-slate-700/50 flex items-center justify-between px-4 shrink-0 shadow-sm z-10 w-full relative">
                
                {/* Brand & Room Info (Left) */}
                <div className="flex items-center gap-4 pl-2 w-1/3">
                    <div className="flex items-center gap-2">
                        <Code2 size={24} className="text-accent" />
                        <h2 className="text-lg font-bold text-white tracking-tight hidden sm:block">LiveCodeX</h2>
                    </div>
                    <div className="h-5 w-px bg-slate-700 hidden sm:block"></div>
                    <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-700 transition cursor-pointer" onClick={copyRoomId} title="Copy Room ID">
                        <span className="text-xs text-slate-400 font-medium">Room</span>
                        <span className="text-xs font-mono font-bold text-blue-400">{roomId}</span>
                        <Copy size={14} className="text-slate-500 ml-1" />
                    </div>
                    {role && (
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm hidden md:inline-block border
                            ${role === 'interviewer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                            {role === 'interviewer' ? 'Interviewer' : 'Candidate'}
                        </span>
                    )}
                </div>

                {/* Timer (Center Absolute for perfect alignment) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    {isTimerRunning || timeLeft > 0 ? (
                        <motion.div 
                            animate={timeLeft < 5 * 60 * 1000 && timeLeft > 0 ? { scale: [1, 1.03, 1], boxShadow: ["0px 0px 0px rgba(248,113,113,0)", "0px 0px 15px rgba(248,113,113,0.3)", "0px 0px 0px rgba(248,113,113,0)"] } : {}}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className={`font-mono text-2xl font-bold tracking-tight px-6 py-1 rounded-xl pointer-events-auto backdrop-blur-sm transition-colors duration-300
                            ${timeLeft < 5 * 60 * 1000 && timeLeft > 0 
                                ? 'text-red-400 bg-red-900/10 border border-red-500/30' 
                                : 'text-slate-200 bg-slate-800/50 border border-slate-700/50 shadow-inner'}`}>
                            {formatTimer(timeLeft)}
                        </motion.div>
                    ) : (
                        role === 'interviewer' && (
                            <motion.button 
                                whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => socket.emit("startTimer", { roomId, duration: 45 * 60 * 1000 })}
                                className="pointer-events-auto bg-slate-800 border border-slate-600 px-5 py-2 text-xs font-semibold tracking-wide rounded-lg shadow-sm flex items-center gap-2"
                            >
                                <Play size={14} className="text-emerald-400" /> Start Interview
                            </motion.button>
                        )
                    )}
                </div>

                {/* Actions (Right) */}
                <div className="flex items-center gap-3 w-1/3 justify-end pr-2">
                    <select 
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer transition-colors shadow-inner font-medium hidden md:block"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>

                    <div className="h-5 w-px bg-slate-700 hidden sm:block"></div>

                    {isPlaybackMode ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700 shadow-sm"
                        >
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 rounded-md text-accent hover:bg-accent/20 transition-colors">
                                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsPlaying(false); setPlaybackIndex(0); }} className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
                                <RotateCcw size={14} />
                            </motion.button>
                            <input 
                                type="range"
                                min="0"
                                max={Math.max(0, historyData.length - 1)}
                                value={playbackIndex}
                                onChange={(e) => { setIsPlaying(false); setPlaybackIndex(parseInt(e.target.value, 10)); }}
                                className="mx-2 w-28 accent-accent cursor-pointer h-1.5 bg-slate-700 rounded-full appearance-none outline-none transition-all"
                            />
                            <span className="text-[10px] font-mono font-medium text-slate-400 pr-2 w-12 text-center">
                                {playbackIndex}/{Math.max(0, historyData.length - 1)}
                            </span>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={togglePlaybackMode} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                                Exit
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
                            <motion.button 
                                whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={togglePlaybackMode}
                                className="text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold"
                                title="Time Travel"
                            >
                                <History size={16} /> <span className="hidden xl:inline">History</span>
                            </motion.button>
                            <motion.button 
                                whileHover={!isRunning ? { scale: 1.02, filter: "brightness(1.1)" } : {}}
                                whileTap={!isRunning ? { scale: 0.98 } : {}}
                                onClick={handleRunCode}
                                disabled={isRunning}
                                className="bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold shadow-sm shadow-emerald-500/20 border border-emerald-500"
                            >
                                <Play size={16} className={isRunning ? "opacity-50" : "fill-current"} />
                                <span className={isRunning ? "opacity-50" : ""}>{isRunning ? 'Running' : 'Run'}</span>
                            </motion.button>
                        </>
                    )}

                    <div className="h-5 w-px bg-slate-700 hidden sm:block"></div>

                    <motion.button 
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={leaveRoom}
                        className="text-slate-400 p-2 rounded-lg transition-colors"
                        title="Leave Room"
                    >
                        <LogOut size={18} />
                    </motion.button>
                </div>
            </header>

            {/* Main Application Body - Resizable Panels Layout */}
            <main className="flex-1 w-full bg-[#0f172a] p-1.5 overflow-hidden">
                <Group orientation="horizontal" className="h-full w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800">
                    
                    {/* LEFT PANEL: Users & Chat */}
                    <Panel defaultSize={20} minSize={15} className="bg-[#1e293b] flex flex-col">
                        <Group orientation="vertical">
                            {/* Users Section */}
                            <Panel defaultSize={35} minSize={20} className="flex flex-col border-b border-slate-700/50 bg-[#1e293b]">
                                <div className="h-10 border-b border-slate-700/50 flex items-center px-4 shrink-0 bg-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-slate-400" />
                                        <h3 className="font-semibold text-xs tracking-wider text-slate-300 uppercase">Participants</h3>
                                    </div>
                                    <div className="ml-auto bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{users.length}</div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                    {users.map((u) => {
                                        const isMe = u.socketId === socket.id || u.username === username;
                                        return (
                                            <div key={u.socketId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-default border border-transparent hover:border-slate-700/50">
                                                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm
                                                    ${isMe ? 'bg-gradient-to-br from-accent to-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-medium truncate text-slate-200">{u.username} {isMe && <span className="text-slate-500 text-xs font-normal">(You)</span>}</span>
                                                    <span className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-0.5 font-medium tracking-wide">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                                                        {u.role === 'interviewer' ? 'Interviewer' : 'Candidate'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Panel>
                            
                            <VerticalResizeHandle />
                            
                            {/* Chat Section */}
                            <Panel defaultSize={65} minSize={30} className="flex flex-col bg-[#1e293b]">
                                <ChatPanel roomId={roomId} currentUser={username} />
                            </Panel>
                        </Group>
                    </Panel>

                    <ResizeHandle />

                    {/* CENTER PANEL: Question & Code Editor */}
                    <Panel defaultSize={55} minSize={30} className="flex flex-col bg-[#1e293b] rounded-md overflow-hidden relative shadow-2xl">
                        {isLocked && (
                            <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                                <div className="bg-red-500/10 text-red-200 border border-red-500/30 px-6 py-4 rounded-xl font-medium text-sm shadow-xl shrink-0 flex items-center gap-3 backdrop-blur-md">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    Interview Ended. Editor Locked.
                                </div>
                            </div>
                        )}
                        <Group orientation="vertical">
                            {/* Problem Statement */}
                            <Panel defaultSize={15} minSize={10} className="flex flex-col border-b border-slate-700 bg-slate-900/40">
                                <div className="h-10 border-b border-slate-700/50 flex items-center px-4 shrink-0 bg-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} className="text-slate-400" />
                                        <h3 className="font-semibold text-xs tracking-wider text-slate-300 uppercase">Problem Statement</h3>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto w-full custom-scrollbar">
                                    {role === 'interviewer' ? (
                                        <textarea 
                                            value={question} 
                                            onChange={(e) => {
                                                setQuestion(e.target.value);
                                                socket.emit('updateQuestion', { roomId, question: e.target.value });
                                            }}
                                            className="w-full h-full bg-transparent outline-none resize-none text-slate-200 placeholder-slate-500 text-sm leading-relaxed"
                                            placeholder="Write the interview problem here... (Syncs automatically)"
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                                            {question || <span className="text-slate-500 italic">Waiting for interviewer to provide the problem statement...</span>}
                                        </div>
                                    )}
                                </div>
                            </Panel>

                            <VerticalResizeHandle />

                            {/* Monaco Editor */}
                            <Panel defaultSize={85} minSize={40} className="relative bg-[#1e1e1e]">
                                <CodeEditor 
                                    code={isPlaybackMode && historyData.length > 0 ? historyData[playbackIndex].code : code} 
                                    language={selectedLanguage} 
                                    onChange={handleCodeChange} 
                                    roomId={roomId} 
                                    username={username}
                                    isReadOnly={isLocked}
                                />
                            </Panel>
                        </Group>
                    </Panel>

                    <ResizeHandle />

                    {/* RIGHT PANEL: AI & Output */}
                    <Panel defaultSize={25} minSize={15} className="bg-[#1e293b] flex flex-col">
                        <Group orientation="vertical">
                            {/* AI Panel */}
                            <Panel defaultSize={60} minSize={20} className="flex flex-col border-b border-slate-700/50 bg-[#1e293b]">
                                <AIPanel code={code} />
                            </Panel>

                            <VerticalResizeHandle />

                            {/* Output Panel */}
                            <Panel defaultSize={40} minSize={20} className="flex flex-col bg-[#1e293b]">
                                <OutputPanel output={output} status={status} isLoading={isRunning} />
                            </Panel>
                        </Group>
                    </Panel>

                </Group>
            </main>
        </motion.div>
    );
};

export default EditorPage;
