import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Input,
  Button,
} from "reactstrap";

import * as ApiManager from "helpers/ApiManager.tsx";

function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm EcoAI, your financial advisor. Ask me about your spending, savings tips, or anything banking related!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: res.data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Sorry, I couldn't process that. Please try again.",
          },
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

  return (
    <div className="content">
      <Row>
        <Col md={12}>
          <Card>
            <CardHeader>
              <CardTitle tag="h4">
                <i className="fa fa-robot" style={{ marginRight: 8 }} />
                EcoAI Chat
              </CardTitle>
              <p className="card-category">
                Your personal financial advisor
              </p>
            </CardHeader>
            <CardBody>
              <div
                style={{
                  height: "55vh",
                  overflowY: "auto",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#f4b8c1",
                  marginBottom: "15px",
                }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.role === "user" ? "flex-end" : "flex-start",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 15px",
                        borderRadius:
                          msg.role === "user"
                            ? "15px 15px 0 15px"
                            : "15px 15px 15px 0",
                        background:
                          msg.role === "user" ? "#e8919f" : "#f4b8c1",
                        color: msg.role === "user" ? "#fff" : "#3a3a3a",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.role === "ai" && (
                        <strong
                          style={{
                            display: "block",
                            marginBottom: 4,
                            color: "#d4808e",
                          }}
                        >
                          EcoAI
                        </strong>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 15px",
                        borderRadius: "15px 15px 15px 0",
                        background: "#f4b8c1",
                        color: "#999",
                        fontSize: "14px",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          marginBottom: 4,
                          color: "#d4808e",
                        }}
                      >
                        EcoAI
                      </strong>
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <Row>
                <Col xs={10}>
                  <Input
                    type="text"
                    placeholder="Ask EcoAI about your finances..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    style={{
                      background: "#fff",
                      color: "#3a3a3a",
                      border: "1px solid #ddd",
                    }}
                  />
                </Col>
                <Col xs={2}>
                  <Button
                    color="primary"
                    className="w-100"
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                  >
                    {loading ? "..." : "Send"}
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Chat;
