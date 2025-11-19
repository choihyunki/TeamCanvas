// src/components/ChatBox.tsx

import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatBox.css";

interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
}

interface Props {
  projectId: number | null;
}

const ChatBox: React.FC<Props> = ({ projectId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const STORAGE_KEY = projectId ? `chat_project_${projectId}` : "chat_default";

  // 🔥 프로젝트별 채팅 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([]);
      }
    }
  }, [STORAGE_KEY]);

  // 🔥 메시지 보내기
  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "나", // 로그인 사용자 이름 넣고 싶으면 AuthContext에서 token 가져와도 됨
      message: input.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    const updated = [...messages, newMsg];

    setMessages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); // 🔥 저장

    setInput("");
    scrollToBottom();
  };

  // Enter로 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  // 🔥 스크롤 아래로 내리기
  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">프로젝트 채팅</div>

      <div className="chatbox-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="chat-message">
            <div className="chat-sender">{msg.sender}</div>
            <div className="chat-text">{msg.message}</div>
            <div className="chat-time">{msg.timestamp}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="chatbox-input-area">
        <input
          className="chatbox-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
        />
        <button className="chatbox-send-btn" onClick={sendMessage}>
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
