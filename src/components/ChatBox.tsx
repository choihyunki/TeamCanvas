import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatBox.css";

type Message = UserMessage | SystemMessage | DateSeparator;

interface UserMessage {
  type: "user";
  id: number;
  user: { name: string; avatarInitial: string };
  text: string;
  time: string;
  isMe: boolean;
}

interface SystemMessage {
  type: "system";
  id: number;
  text: string;
}

interface DateSeparator {
  type: "date";
  id: number;
  date: string;
}

interface ChatBoxProps {
  projectId: number | null;
}

// localStorage 키 prefix
const STORAGE_KEY_PREFIX = "project-chat:";

// 시간 포맷 (HH:MM)
const formatTime = (date: Date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// 날짜 포맷 (YYYY.MM.DD)
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
};

// 새로운 프로젝트에서 처음 열었을 때 기본 메시지
const buildInitialMessages = (): Message[] => {
  const now = new Date();
  return [
    {
      type: "date",
      id: 1,
      date: formatDate(now),
    } as DateSeparator,
    {
      type: "system",
      id: 2,
      text: "프로젝트 채팅을 시작해보세요. 팀원들과 할 일을 상의할 수 있습니다.",
    } as SystemMessage,
  ];
};

const ChatBox: React.FC<ChatBoxProps> = ({ projectId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ 프로젝트 변경될 때마다 해당 프로젝트의 채팅 로드
  useEffect(() => {
    if (!projectId) {
      setMessages(buildInitialMessages());
      return;
    }

    if (typeof window === "undefined") {
      setMessages(buildInitialMessages());
      return;
    }

    const key = `${STORAGE_KEY_PREFIX}${projectId}`;
    const raw = window.localStorage.getItem(key);

    if (raw) {
      try {
        const parsed: Message[] = JSON.parse(raw);
        setMessages(parsed);
        return;
      } catch (e) {
        console.warn("채팅 데이터 파싱 실패, 초기화합니다.", e);
      }
    }

    // 저장된 기록이 없다면 기본 메시지로 시작
    setMessages(buildInitialMessages());
  }, [projectId]);

  // ✅ 메시지 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (!projectId) return;
    if (typeof window === "undefined") return;

    const key = `${STORAGE_KEY_PREFIX}${projectId}`;
    window.localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, projectId]);

  // ✅ 새 메시지 올 때마다 스크롤 맨 아래로
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ 메시지 전송
  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed === "") return;

    const now = new Date();
    const timeStr = formatTime(now);

    const newMessage: UserMessage = {
      type: "user",
      id: Date.now(),
      user: { name: "나", avatarInitial: "나" },
      text: trimmed,
      time: timeStr,
      isMe: true,
    };

    // 날짜 구분선이 없으면 오늘 날짜로 하나 추가
    const hasDateSeparator = messages.some((m) => m.type === "date");
    const nextMessages: Message[] = hasDateSeparator
      ? [...messages, newMessage]
      : [
          ...messages,
          {
            type: "date",
            id: Date.now() - 1,
            date: formatDate(now),
          } as DateSeparator,
          newMessage,
        ];

    setMessages(nextMessages);
    setInput("");
  };

  return (
    <div className="chat-container">
      {/* 헤더 */}
      <div className="chat-header">
        <span className="online-indicator">온라인</span>
        <h3 className="chat-header-title">팀 채팅</h3>
        <p className="chat-header-subtitle">
          프로젝트별로 팀원들과 실시간으로 소통하세요
        </p>
      </div>

      {/* 메시지 리스트 */}
      <div className="message-list">
        {messages.map((msg) => {
          switch (msg.type) {
            case "date":
              return (
                <div key={msg.id} className="message-separator">
                  <span>{msg.date}</span>
                </div>
              );
            case "system":
              return (
                <div key={msg.id} className="message system-message">
                  <div className="system-message-text">{msg.text}</div>
                </div>
              );
            case "user":
              return (
                <div
                  key={msg.id}
                  className={`message-row ${
                    msg.isMe ? "message-row-me" : "message-row-other"
                  }`}
                >
                  {!msg.isMe && (
                    <div className="avatar">{msg.user.avatarInitial}</div>
                  )}
                  <div className="message-bubble-wrapper">
                    {!msg.isMe && (
                      <div className="message-username">{msg.user.name}</div>
                    )}
                    <div className="message-bubble">
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">{msg.time}</div>
                    </div>
                  </div>
                  {msg.isMe && (
                    <div className="avatar avatar-me">
                      {msg.user.avatarInitial}
                    </div>
                  )}
                </div>
              );
            default:
              return null;
          }
        })}
        <div ref={messageEndRef} />
      </div>

      {/* 입력창 */}
      <div className="input-area">
        <button className="icon-button">
          {/* 아이콘은 기존 CSS 그대로 사용 (예시로 빈 버튼 유지) */}
          <span>＋</span>
        </button>
        <button className="icon-button">
          <span>😊</span>
        </button>
        <textarea
          className="chat-input"
          placeholder="메시지를 입력 후 Enter를 눌러 보내세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button onClick={handleSend} className="send-button">
          ➢
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
