import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  author: string;
  message: string;
  time: string;
}

export const useChatSocket = (projectId: number | null, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // 1. 서버 연결
    socketRef.current = io("http://localhost:4000");
    const socket = socketRef.current;

    // 2. 방 입장 (해당 프로젝트 방에 들어감)
    socket.emit("join_room", projectId);

    // 3. 메시지 받기 리스너
    socket.on("receive_message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  // 4. 메시지 보내기 함수
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

      // 서버로 전송
      await socketRef.current.emit("send_message", messageData);

      // (선택) 내 화면에는 바로 띄우기 (서버가 보내주긴 하지만 반응 속도를 위해)
      // setMessages((prev) => [...prev, messageData]);
    }
  };

  return { messages, sendMessage };
};
