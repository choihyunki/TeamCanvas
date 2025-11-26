import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  author: string;
  message: string;
  time: string;
  projectId?: string;
}

// .env에서 주소 가져오기 (없으면 로컬호스트)
const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export const useChatSocket = (projectId: string | null, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // 1. 소켓 연결 (한 번만 연결되도록 설정)
    if (!socketRef.current) {
      socketRef.current = io(SERVER_URL);
    }
    const socket = socketRef.current;

    // 2. 방 입장 (중요: 이게 되어야 같은 방 사람끼리만 대화함)
    socket.emit("join_room", projectId);

    // 3. 기존 메시지 로드 (서버에서 보내줌)
    const handleLoadMessages = (history: ChatMessage[]) => {
      setMessages(history);
    };

    // 4. 🔥 [핵심] 실시간 메시지 받기
    const handleReceiveMessage = (data: ChatMessage) => {
      console.log("새 메시지 도착!", data); // 확인용 로그
      setMessages((prev) => [...prev, data]);
    };

    // 리스너 등록
    socket.on("load_messages", handleLoadMessages);
    socket.on("receive_message", handleReceiveMessage);

    // 5. 정리 (Cleanup): 나갈 때 리스너만 끄기 (소켓 연결은 유지해도 됨)
    return () => {
      socket.off("load_messages", handleLoadMessages);
      socket.off("receive_message", handleReceiveMessage);
      // socket.disconnect(); // 필요에 따라 주석 해제 (보통은 유지하는 게 끊김 방지에 좋음)
    };
  }, [projectId]);

  // 메시지 보내기 함수
  const sendMessage = async (currentMessage: string) => {
    if (currentMessage.trim() !== "" && socketRef.current && projectId) {
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

      // 🔥 (옵션) 내 화면에는 서버 응답 기다리지 않고 즉시 추가 (반응속도 UP)
      // setMessages((prev) => [...prev, messageData]);
    }
  };

  return { messages, sendMessage };
};
