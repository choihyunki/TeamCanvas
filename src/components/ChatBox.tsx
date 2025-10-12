import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import "../styles/ChatBox.css";
import axiosInstance from "../api/AxiosInstance";

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

interface ChatMessageResponse {
  roomId: number;
  userId: number;
  userName: string;
  message: string;
  createdAt: string;
}

const ChatBox: React.FC<{ roomId: number }> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<Client | null>(null);

  const userId = localStorage.getItem("userId") || "0";
  const userName = localStorage.getItem("userName") || "나";

  // ✅ WebSocket + 초기 메시지 로딩
  useEffect(() => {
    if (!roomId) return;

    console.log(`💬 Connecting to chat room: ${roomId}`);

    axiosInstance
      .get(`/api/chat/${roomId}/messages`)
      .then((res) => {
        const formatted = res.data.map((m: ChatMessageResponse) => ({
          type: "user" as const,
          id: Date.now() + Math.random(),
          user: { name: m.userName, avatarInitial: m.userName.charAt(0) },
          text: m.message,
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: m.userId.toString() === userId,
        }));
        setMessages(formatted);
      })
      .catch((err) => console.error("⚠️ 메시지 불러오기 실패:", err));

    // WebSocket 연결 설정
    const socket = new SockJS("http://localhost:8080/ws-chat");
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ WebSocket connected:", roomId);

        // 방 구독
        client.subscribe(`/topic/room.${roomId}`, (msg: IMessage) => {
          const body: ChatMessageResponse = JSON.parse(msg.body);
          const newMessage: UserMessage = {
            type: "user",
            id: Date.now(),
            user: {
              name: body.userName,
              avatarInitial: body.userName.charAt(0),
            },
            text: body.message,
            time: new Date(body.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isMe: body.userId.toString() === userId,
          };
          setMessages((prev) => [...prev, newMessage]);
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🔌 Disconnecting from chat room");
      client.deactivate();
    };
  }, [roomId]);

  // ✅ 스크롤 자동 이동
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ 메시지 전송
  const handleSend = () => {
    if (!input.trim() || !clientRef.current?.connected) return;

    const payload = {
      roomId,
      userId: Number(userId),
      userName,
      message: input.trim(),
    };

    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });

    setInput("");
  };

  return (
    <div className="chat-container">
      {/* 헤더 */}
      <div className="chat-header">
        <span className="online-indicator">온라인</span>
        <h3 className="chat-header-title">팀 채팅</h3>
        <p className="chat-header-subtitle">
          #{roomId}번 방 | 실시간으로 팀원들과 소통하세요
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
                <div key={msg.id} className="system-message">
                  {msg.text}
                </div>
              );
            case "user":
              return (
                <div
                  key={msg.id}
                  className={`message-row ${msg.isMe ? "is-me" : ""}`}
                >
                  <div className="avatar">{msg.user.avatarInitial}</div>
                  <div className="message-info">
                    {!msg.isMe && (
                      <div className="username">{msg.user.name}</div>
                    )}
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
        <button onClick={handleSend} className="send-button">
          ➢
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
