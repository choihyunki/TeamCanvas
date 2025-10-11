import React, { useState, useEffect, useRef } from "react";
import '../styles/ChatBox.css';

type Message = UserMessage | SystemMessage | DateSeparator;

interface UserMessage {
  type: 'user';
  id: number;
  user: { name: string; avatarInitial: string };
  text: string;
  time: string;
  isMe: boolean; // '나'의 메시지인지 구분
}
interface SystemMessage {
  type: 'system';
  id: number;
  text: string;
}
interface DateSeparator {
  type: 'date';
  id: number;
  date: string;
}

// ✅ 이미지와 유사한 목업(mockup) 데이터
const initialMessages: Message[] = [
  { type: 'date', id: 1, date: '2024년 1월 15일' },
  { type: 'system', id: 2, text: '프로젝트가 시작되었습니다!' },
  { type: 'user', id: 3, user: { name: '이영희', avatarInitial: '이' }, text: '안녕하세요! 잘 부탁드립니다.', time: '오후 06:15', isMe: false },
  { type: 'user', id: 4, user: { name: '박민수', avatarInitial: '박' }, text: 'API 명세서 초안을 작성했습니다. 검토 부탁드려요.', time: '오후 07:30', isMe: false },
  { type: 'date', id: 5, date: '2025년 10월 11일' },
  { type: 'user', id: 6, user: { name: '나', avatarInitial: '나' }, text: '파일.pdf', time: '오전 03:53', isMe: true },
];

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  // 메시지 보낼 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === "") return;

    const newMessage: UserMessage = {
      type: 'user',
      id: Date.now(),
      user: { name: "나", avatarInitial: '나' },
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="chat-container">
      {/* 헤더 */}
      <div className="chat-header">
        <span className="online-indicator">온라인</span>
        <h3 className="chat-header-title">팀 채팅</h3>
        <p className="chat-header-subtitle">실시간으로 팀원들과 소통하세요</p>
      </div>

      {/* 메시지 리스트 */}
      <div className="message-list">
        {messages.map((msg) => {
          // ✅ 메시지 타입에 따라 다른 UI 렌더링
          switch (msg.type) {
            case 'date':
              return <div key={msg.id} className="message-separator"><span>{msg.date}</span></div>;
            case 'system':
              return <div key={msg.id} className="system-message">{msg.text}</div>;
            case 'user':
              return (
                <div key={msg.id} className={`message-row ${msg.isMe ? 'is-me' : ''}`}>
                  <div className="avatar">{msg.user.avatarInitial}</div>
                  <div className="message-info">
                    {!msg.isMe && <div className="username">{msg.user.name}</div>}
                    <div className="message-content">
                      <div className="message-bubble">{msg.text}</div>
                      <div className="timestamp">{msg.time}</div>
                    </div>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}
        {/* 스크롤 이동을 위한 빈 div */}
        <div ref={messageEndRef} />
      </div>

      {/* 입력창 */}
      <div className="input-area">
        <button className="icon-button">📎</button>
        <button className="icon-button">🙂</button>
        <textarea
          rows={1}
          placeholder="메시지를 입력하세요..."
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button onClick={handleSend} className="send-button">➢</button>
      </div>
    </div>
  );
};

export default ChatBox;