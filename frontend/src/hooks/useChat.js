import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api";

export function useChat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("chatSessions") || "[]");
    setSessions(stored);
    if (stored.length > 0) {
      const last = stored[stored.length - 1];
      setCurrentSessionId(last.id);
      setChat(last.messages);
    }
  }, []);

  useEffect(() => {
    if (currentSessionId && sessions.length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(sessions));
    }
  }, [sessions, currentSessionId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  useEffect(() => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId ? { ...session, messages: chat } : session
      )
    );
  }, [chat, currentSessionId]);

  const newChat = () => {
    const id = Date.now();
    setCurrentSessionId(id);
    setChat([]);
    setSessions((prev) => [...prev, { id, messages: [] }]);
  };

  const deleteSession = (sessionId) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      localStorage.setItem("chatSessions", JSON.stringify(updated));

      // If deleted session is currently active, switch to another or clear
      if (sessionId === currentSessionId) {
        if (updated.length > 0) {
          const nextSession = updated[updated.length - 1];
          setCurrentSessionId(nextSession.id);
          setChat(nextSession.messages);
        } else {
          setCurrentSessionId(null);
          setChat([]);
        }
      }

      return updated;
    });
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = { role: "user", text: message, timestamp: new Date().toISOString() };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/chat", { message });
      const fullText = response.data.reply;
      setChat((prev) => [...prev, { role: "bot", text: fullText, timestamp: new Date().toISOString() }]);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Unable to connect to chat service. Please try again.";
      setChat((prev) => [...prev, { role: "bot", text: `⚠️ ${errorMessage}`, timestamp: new Date().toISOString() }]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const currentSession = useMemo(() => sessions.find((s) => s.id === currentSessionId), [sessions, currentSessionId]);

  return {
    message,
    setMessage,
    chat,
    loading,
    sendMessage,
    newChat,
    deleteSession,
    setCurrentSessionId,
    sessions,
    currentSession,
    currentSessionId,
    bottomRef,
  };
}
