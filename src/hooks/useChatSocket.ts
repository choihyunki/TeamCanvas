import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  author: string;
  message: string;
  time: string;
  projectId?: string;
}

// .env에서 주소 가져오기
const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export const useChatSocket = (projectId: string | null, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. 프로젝트 ID가 없으면 연결하지 않음
    if (!projectId) return;

    // 2. 소켓 연결 (없을 때만 생성)
    if (!socketRef.current) {
      console.log(`🔌 소켓 연결 시도: ${SERVER_URL}`);
      socketRef.current = io(SERVER_URL, {
        transports: ["websocket"], // 폴링 방지
        reconnection: true, // 끊기면 자동 재연결
      });
    }

    const socket = socketRef.current;

    // 3. 서버 연결 성공 시 "방 입장" (가장 중요!)
    const handleConnect = () => {
      console.log("✅ 소켓 연결됨! ID:", socket.id);
      // 🔥 [핵심] 무조건 문자열로 변환해서 방에 들어감
      socket.emit("join_room", String(projectId));
    };

    // 4. 메시지 받기 리스너
    const handleReceiveMessage = (data: ChatMessage) => {
      console.log("📩 [실시간 수신]", data);
      setMessages((prev) => [...prev, data]);
    };

    const handleLoadMessages = (history: ChatMessage[]) => {
      console.log("📂 히스토리 로드:", history.length);
      setMessages(history);
    };

    // 리스너 등록
    socket.on("connect", handleConnect);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("load_messages", handleLoadMessages);

    // 🔥 [중요] 이미 연결된 상태라면 즉시 방 입장 시도
    // (페이지 이동 등으로 소켓이 이미 살아있을 때를 대비)
    if (socket.connected) {
      socket.emit("join_room", String(projectId));
    }

    // Cleanup (언마운트 시 리스너만 끄고 연결은 유지 - 끊김 방지)
    return () => {
      socket.off("connect", handleConnect);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("load_messages", handleLoadMessages);
    };
  }, [projectId, SERVER_URL]); // projectId가 바뀌면 다시 실행됨

  // 메시지 보내기
  const sendMessage = async (currentMessage: string) => {
    if (currentMessage.trim() !== "" && socketRef.current && projectId) {
      const messageData = {
        projectId: String(projectId), // 보낼 때도 문자열로
        author: userName,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // 서버 전송
      await socketRef.current.emit("send_message", messageData);
    }
  };

  return { messages, sendMessage };
};
