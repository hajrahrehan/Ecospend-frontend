import React, { useState, useRef, useEffect } from "react";
import * as ApiManager from "helpers/ApiManager.tsx";

const EcoAIWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm EcoAI, your financial advisor. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isLoggedIn = !!sessionStorage.getItem("@token") && !sessionStorage.getItem("@admintoken");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await ApiManager.ChatWithAI({ message: text });
      if (res && res.data) {
        setMessages((prev) => [...prev, { role: "ai", text: res.data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Sorry, I couldn't process that. Please try again." },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again later." },
      ]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
        <div style={styles.popup}>
          {/* Header */}
          <div style={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={styles.avatarSmall}>
                <i className="fa fa-robot" style={{ fontSize: 14, color: "#fff" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>EcoAI</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                  Financial Advisor
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              <i className="fa fa-times" />
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messagesArea}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    ...(msg.role === "user" ? styles.userBubble : styles.aiBubble),
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
                <div style={{ ...styles.bubble, ...styles.aiBubble, color: "#aaa" }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputArea}>
            <input
              type="text"
              placeholder="Ask EcoAI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              style={styles.input}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                ...styles.sendBtn,
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <i className="fa fa-paper-plane" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.fab,
          transform: isOpen ? "scale(0.9)" : "scale(1)",
        }}
      >
        {isOpen ? (
          <i className="fa fa-times" style={{ fontSize: 22, color: "#fff" }} />
        ) : (
          <i className="fa fa-robot" style={{ fontSize: 22, color: "#fff" }} />
        )}
      </button>
    </>
  );
};

const styles = {
  fab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e8919f, #d4808e)",
    border: "none",
    boxShadow: "0 4px 16px rgba(212, 139, 168, 0.4)",
    cursor: "pointer",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  popup: {
    position: "fixed",
    bottom: 90,
    right: 24,
    width: 370,
    height: 500,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    zIndex: 10000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #e8919f, #d4808e)",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    padding: 4,
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: 14,
    background: "#f4b8c1",
  },
  bubble: {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 13,
    lineHeight: 1.5,
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
  },
  userBubble: {
    background: "#e8919f",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    background: "#fff",
    color: "#3a3a3a",
    border: "1px solid #f4b8c1",
    borderBottomLeftRadius: 4,
  },
  inputArea: {
    display: "flex",
    padding: 10,
    gap: 8,
    borderTop: "1px solid #f4b8c1",
    background: "#fff",
  },
  input: {
    flex: 1,
    border: "1px solid #e0d0d8",
    borderRadius: 20,
    padding: "8px 14px",
    fontSize: 13,
    outline: "none",
    color: "#3a3a3a",
    background: "#fce8eb",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e8919f, #d4808e)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },
};

export default EcoAIWidget;
