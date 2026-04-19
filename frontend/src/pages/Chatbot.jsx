import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import toast from "react-hot-toast";
import { Bot, User, Send, Plus, Trash2, MessageSquare, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const navigate = useNavigate();
  const {
    message,
    setMessage,
    chat,
    loading,
    sendMessage,
    newChat,
    currentSession,
    currentSessionId,
    sessions,
    setCurrentSessionId,
    deleteSession,
    bottomRef,
  } = useChat();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sessionSwitching, setSessionSwitching] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSend = async () => {
    if (loading || !message.trim()) return;

    try {
      await sendMessage();
    } catch (error) {
      toast.error("Chat server error. Please try again.");
    }
  };

  const handleSessionSelect = (sessionId) => {
    setSessionSwitching(true);
    setCurrentSessionId(sessionId);
    setDropdownOpen(false);
    setTimeout(() => setSessionSwitching(false), 300);
  };

  const handleDeleteSessionClick = (e, sessionId) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this chat? This action cannot be undone.");
    if (confirmed) {
      deleteSession(sessionId);
    }
  };

  const formatSessionTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getLastMessage = (messages) => {
    if (!messages || messages.length === 0) return "No messages";
    const lastMsg = messages[messages.length - 1];
    return lastMsg.text.length > 40 ? lastMsg.text.substring(0, 40) + "..." : lastMsg.text;
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full bg-gray-50 dark:bg-gray-950 flex flex-col pt-6 pb-6 px-4 md:px-8 transition-colors duration-300">

      <div className="max-w-5xl mx-auto w-full h-full flex flex-col glass-card rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 animate-fadeIn">
        
        {/* Header Area */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center z-20 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
              <p className="text-xs text-gray-500 font-medium">Ask about heart health</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto relative">
            
            {/* Session Selector */}
            <div className="relative w-full sm:w-64">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                     {currentSession ? formatSessionTime(currentSession.id) : "Select Chat..."}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto custom-scrollbar overflow-x-hidden"
                  >
                    {sessions.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No previous chats</div>
                    ) : (
                      <ul className="py-2">
                        {sessions.map((session) => {
                          const isActive = session.id === currentSessionId;
                          return (
                            <li key={session.id}>
                              <button
                                onClick={() => handleSessionSelect(session.id)}
                                className={`w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors group ${
                                  isActive ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className={`text-sm font-semibold truncate pr-2 ${isActive ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}>
                                    {formatSessionTime(session.id)}
                                  </span>
                                  <button
                                    onClick={(e) => handleDeleteSessionClick(e, session.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full pr-4">{getLastMessage(session.messages)}</p>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => { newChat(); setDropdownOpen(false); toast.success("New chat started"); }}
              className="bg-primary hover:bg-primary-dark text-white p-2.5 rounded-xl transition shadow-md whitespace-nowrap flex items-center justify-center shrink-0"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white/40 dark:bg-gray-900/40 relative overflow-hidden flex flex-col">
          {sessionSwitching && (
             <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
               <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-lg text-sm font-medium animate-pulse">Loading discussion...</div>
             </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar scroll-smooth">
            {chat.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-4">
                <Bot className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-xl font-medium text-gray-600 dark:text-gray-300">
                  {sessions.length === 0 ? "Start your first medical consultation" : "Ask a medical question"}
                </p>
                <p className="text-sm text-gray-500 mt-2 max-w-xs">Our AI is here to provide educational insights about cardiovascular health.</p>
              </div>
            )}

            <AnimatePresence>
              {chat.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}
                >
                  <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* AVATAR */}
                    <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center ${msg.role === "user" ? "bg-primary text-white" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* BUBBLE */}
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-rose-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none"
                    }`}>
                      <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      <div className={`text-[10px] mt-2 font-medium ${msg.role === "user" ? "text-red-100 text-right" : "text-gray-400 text-left"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                <div className="flex gap-3 max-w-[75%]">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 flex shrink-0 items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex flex-col justify-center gap-1.5 h-12 w-16">
                     <div className="flex gap-1 justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} className="h-1"></div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 p-4 shrink-0">
          <div className="flex gap-3 max-w-4xl mx-auto items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask your follow-up medical question..."
                disabled={sessionSwitching}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-3.5 pr-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              onClick={handleSend}
              disabled={loading || !message.trim() || sessionSwitching}
              className="bg-primary hover:bg-primary-dark text-white w-12 h-12 rounded-2xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shrink-button transform hover:-translate-y-0.5"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-3 hidden sm:block">AI responses are for reference and do not replace clinical advice.</p>
        </div>
      </div>
    </div>
  );
}
