import React, { useState } from "react";

interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;

    const newMessage: Message = {
      id: Date.now(),
      user: "나", // 나중에 DB 연동 시 로그인 사용자명으로 교체
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #ddd",
          fontWeight: "bold",
          background: "#f9f9f9",
        }}
      >
        팀 채팅
      </div>

      {/* 메시지 리스트 */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          background: "#fff",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "12px" }}>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>
              {msg.user}{" "}
              <span style={{ color: "#888", fontSize: "12px" }}>{msg.time}</span>
            </div>
            <div style={{ fontSize: "15px" }}>{msg.text}</div>
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <div
        style={{
          padding: "10px",
          borderTop: "1px solid #ddd",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{
            flex: 1,
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "8px 16px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          보내기
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
