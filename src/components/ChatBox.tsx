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

  // 🔥 스크롤 자동 이동을 위한 Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 올 때마다 스크롤을 맨 아래로 내림
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!currentMessage.trim()) return;
    sendMessage(currentMessage);
    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // 한글 입력 중 조합(Composing) 상태일 때 중복 전송 방지
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 엔터 키의 기본 동작(줄바꿈) 막기
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
      {/* 1. 헤더 */}
      <div className="chat-header">
        <h3>💬 팀 채팅</h3>
      </div>

      {/* 2. 메시지 영역 (스크롤됨) */}
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
        {/* 스크롤을 여기로 내리기 위한 투명한 div */}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. 입력창 영역 (input -> textarea로 변경) */}
      <div className="chat-input-area">
        <textarea
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="메시지 입력... (Shift+Enter 줄바꿈)"
          style={{
            resize: "none", // 사용자 임의 크기 조절 방지
            height: "40px", // 기본 높이 설정
            lineHeight: "1.4",
            padding: "10px",
            borderRadius: "12px", // 둥글게
            border: "1px solid #ddd",
            outline: "none",
            flex: 1, // 영역 채우기
            fontFamily: "inherit",
          }}
        />
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  );
};

export default ChatBox;
