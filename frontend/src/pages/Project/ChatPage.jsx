// src/pages/ChatPage.jsx - PROJECT NAME PERFECTLY DISPLAYED
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import ProjectChatsList from "./ProjectChatsList";
import api from "../../api/api";

const ChatPage = () => {
  const { projectId: urlProjectId } = useParams();
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || null);
  const [selectedProjectName, setSelectedProjectName] = useState(""); // ✅ PROJECT NAME STATE
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // ✅ Receives PROJECT NAME from ProjectChatsList
  const handleProjectSelect = useCallback((projectId, projectData) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectData?.name || `Project #${projectId}`); // ✅ SETS PROJECT NAME
    setMessages([]);
  }, []);

  // ... rest of your effects (unchanged) ...

  useEffect(() => {
    if (!selectedProjectId || selectedProjectId === -1) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/chatapp_home/?project_id=${selectedProjectId}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages", err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId || selectedProjectId === -1) {
      setIsConnecting(false);
      return;
    }
    const token = localStorage.getItem("access");
    if (!token) return;
    setIsConnecting(true);
    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ||
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
    const socketUrl = `${WS_BASE_URL}/ws/chat/${selectedProjectId}/?token=${token}`;
    
    if (wsRef.current) wsRef.current.close();
    const socket = new WebSocket(socketUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnecting(false);
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "connection_success") setCurrentUser(data.user);
        else if (data.type === "chat_message") setMessages((prev) => [...prev, data]);
      } catch (e) {
        console.error("WS parse error", e);
      }
    };
    socket.onerror = (e) => {
      console.error("WebSocket error", e);
      setIsConnecting(false);
    };
    socket.onclose = () => {
      console.log("WebSocket closed");
      setIsConnecting(false);
      wsRef.current = null;
    };
    setWs(socket);
    return () => {
      if (socket.readyState === WebSocket.OPEN) socket.close();
      wsRef.current = null;
    };
  }, [selectedProjectId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!ws || ws.readyState !== WebSocket.OPEN || !newMessage.trim()) return;
    ws.send(JSON.stringify({ message: newMessage.trim() }));
    setNewMessage("");
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isOwnMessage = (msg) => currentUser && msg.sender?.id === currentUser.id;
  const getProjectDisplayId = (projectId) => {
    if (!projectId || projectId === 0 || projectId === -1) return "----";
    try {
      return String(projectId).trim().slice(-4).padStart(4, '0');
    } catch {
      return "----";
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isNoProjectSelected = !selectedProjectId || selectedProjectId === -1;

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
      <ProjectChatsList 
        onProjectSelect={handleProjectSelect}
        selectedProjectId={selectedProjectId}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {isNoProjectSelected ? (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center text-gray-500 p-8 max-w-md">
              <div className="text-6xl mb-6">📱</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Project</h2>
              <p className="text-lg">Choose a project from the left sidebar to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* ✅ PROJECT NAME DISPLAYED HERE */}
            <div className="h-20 flex-shrink-0 flex items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border-b border-blue-500/30 z-10">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* ✅ PROJECT AVATAR */}
                  <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold">
                      {selectedProjectName?.[0]?.toUpperCase() || "P"} {/* ✅ FIRST LETTER */}
                    </span>
                  </div>
                  
                  {/* ✅ PROJECT NAME - MAIN DISPLAY */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold truncate">
                      {selectedProjectName} {/* ✅ ACTUAL PROJECT NAME */}
                    </h2>
                    <p className="text-blue-100 text-xs font-medium mt-0.5">
                      {getProjectDisplayId(selectedProjectId)} • {isConnecting ? "Connecting..." : "Active"}
                    </p>
                  </div>
                </div>
                
                {/* ✅ USER INFO */}
                {currentUser && (
                  <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full ml-2">
                    {currentUser.github_username || currentUser.email}
                  </span>
                )}
              </div>
            </div>

            {/* Messages scroll area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-gray-100 p-4 pb-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 pt-24 pb-24">
                  <div className="text-5xl mb-6 animate-bounce">💬</div>
                  <p className="text-xl font-semibold">{isConnecting ? "Connecting..." : "No messages yet"}</p>
                  <p className="text-sm mt-2 opacity-75">{isConnecting ? "" : "Be the first to start!"}</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={msg.id || `${msg.timestamp}-${msg.message}-${index}`} className={`flex ${isOwnMessage(msg) ? "justify-end" : "justify-start"} px-2`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-md transform transition-all hover:scale-[1.01] select-text ${
                      isOwnMessage(msg)
                        ? "rounded-bl-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-4"
                        : "rounded-br-lg bg-white/90 backdrop-blur-sm border border-gray-200/50 text-gray-900 mr-4 shadow-sm"
                    }`}>
                      <div className="mb-1 text-xs font-semibold opacity-90 truncate max-w-[200px]">
                        {msg.sender?.github_username || msg.sender?.email || "User"}
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed break-words">
                        {msg.message}
                      </div>
                      <div className={`mt-2 text-xs opacity-75 flex items-center gap-1 ${
                        isOwnMessage(msg) ? "text-blue-100 justify-end" : "text-gray-500"
                      }`}>
                        {formatTime(msg.timestamp)}
                        {isOwnMessage(msg) && <div className="w-3 h-3 bg-white/30 rounded-full" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input frozen at bottom */}
            <div className="h-20 flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl z-20 pt-2 pb-3 px-4">
              <form onSubmit={handleSendMessage} className="h-full flex items-end gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={isConnecting ? "Connecting..." : "💬 Type a message"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isConnecting}
                    className="w-full h-12 rounded-3xl border-2 border-gray-200 px-5 py-2.5 text-base outline-none placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isConnecting) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!ws || ws.readyState !== WebSocket.OPEN || !newMessage.trim() || isConnecting}
                  className="w-12 h-12 flex items-center justify-center rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
