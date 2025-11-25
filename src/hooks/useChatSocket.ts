import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  author: string;
  message: string;
  time: string;
  projectId?: number; // DB 저장용
}

export const useChatSocket = (projectId: number | null, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // 1. 서버 연결
    socketRef.current = io("http://localhost:4000");
    const socket = socketRef.current;

    // 2. 방 입장
    socket.emit("join_room", projectId);

    // 🔥 3. [추가됨] 이전 채팅 내역 한 번에 로드
    socket.on("load_messages", (history: ChatMessage[]) => {
      setMessages(history);
    });

    // 4. 실시간 메시지 받기
    socket.on("receive_message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  const sendMessage = async (currentMessage: string) => {
    if (currentMessage !== "" && socketRef.current && projectId) {
      const messageData = {
        projectId,
        author: userName,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // 서버로 전송 (DB 저장은 서버가 알아서 함)
      await socketRef.current.emit("send_message", messageData);
    }
  };

  return { messages, sendMessage };
};
