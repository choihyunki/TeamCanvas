import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatBox.css";
import { useAuth } from "../context/AuthContext";
import { useChatSocket } from "../hooks/useChatSocket";

interface ChatBoxProps {
  projectId: string | null;
}

const ChatBox: React.FC<ChatBoxProps> = ({ projectId }) => {
  const { token } = useAuth();
  const [currentMessage, setCurrentMessage] = useState("");
  const { messages, sendMessage } = useChatSocket(projectId, token || "익명");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!currentMessage.trim()) return;
    sendMessage(currentMessage);
    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!projectId) {
    return (
      <div
        className="chat-box"
        style={{
          justifyContent: "center",
          alignItems: "center",
          color: "#888",
        }}
      >
        <p>프로젝트를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>💬 팀 채팅</h3>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", marginTop: "20px" }}>
            아직 대화가 없습니다.
            <br />첫 메시지를 보내보세요! 👋
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-bubble ${
                msg.author === token ? "my-message" : "other-message"
              }`}
            >
              <div className="message-info">
                <span className="author">{msg.author}</span>
                <span className="time">{msg.time}</span>
              </div>
              <div className="text">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="메시지 입력... (Shift+Enter 줄바꿈)"
          style={{
            resize: "none",
            height: "40px",
            lineHeight: "1.4",
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            outline: "none",
            flex: 1,
            fontFamily: "inherit",
          }}
        />
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  );
};

export default ChatBox;