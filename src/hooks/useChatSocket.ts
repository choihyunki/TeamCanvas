import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  author: string;
  message: string;
  time: string;
  projectId?: string;
}

// 환경 변수에서 주소 가져오기 (없으면 로컬)
const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export const useChatSocket = (projectId: string | null, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 프로젝트 ID가 없으면 연결하지 않음
    if (!projectId) return;

    // 1. 소켓 연결 시도
    // (이미 연결된 상태라면 재연결 방지)
    if (!socketRef.current) {
      console.log(`🔌 소켓 연결 시도: ${SERVER_URL}`);

      socketRef.current = io(SERVER_URL, {
        transports: ["websocket"], // 폴링 방지하고 바로 웹소켓 사용
        reconnectionAttempts: 5, // 재연결 시도 횟수
      });
    }

    const socket = socketRef.current;

    // 2. 연결 상태 확인용 로그
    socket.on("connect", () => {
      console.log("✅ 소켓 연결 성공! ID:", socket.id);
      // 연결되자마자 방 입장
      socket.emit("join_room", projectId);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ 소켓 연결 에러:", err.message);
    });

    // 3. 메시지 로드 & 수신 리스너
    socket.on("load_messages", (history: ChatMessage[]) => {
      console.log("📂 이전 대화 불러옴:", history.length + "개");
      setMessages(history);
    });

    socket.on("receive_message", (data: ChatMessage) => {
      console.log("📩 실시간 메시지 수신:", data);
      setMessages((prev) => [...prev, data]);
    });

    // 방 입장 (재연결 시 대비하여 useEffect 실행 시마다 호출)
    socket.emit("join_room", projectId);

    return () => {
      // 컴포넌트 언마운트 시 리스너 해제
      socket.off("connect");
      socket.off("connect_error");
      socket.off("load_messages");
      socket.off("receive_message");
      // 주의: 페이지 이동이 잦다면 disconnect를 하는 게 좋지만,
      // SPA에서는 유지하는 경우도 있음. 여기선 끊어줌.
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId]);

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
    }
  };

  return { messages, sendMessage };
};
