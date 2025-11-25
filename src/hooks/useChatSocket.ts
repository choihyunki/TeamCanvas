import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  author: string;
  message: string;
  time: string;
  projectId?: string; // 🔥 [수정] number -> string
}

// 🔥 [수정] projectId 타입을 string | null 로 변경
export const useChatSocket = (projectId: string | null, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // 1. 서버 연결
    socketRef.current = io("http://localhost:4000");
    const socket = socketRef.current;

    // 2. 방 입장
    socket.emit("join_room", projectId);

    socket.on("load_messages", (history: ChatMessage[]) => {
      setMessages(history);
    });

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

      await socketRef.current.emit("send_message", messageData);
    }
  };

  return { messages, sendMessage };
};
