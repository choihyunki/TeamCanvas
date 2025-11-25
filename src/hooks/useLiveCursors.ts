// src/hooks/useLiveCursors.ts
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { CursorData } from "../components/LiveCursors";

// 랜덤 색상 생성
const getRandomColor = () => {
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A8"];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useLiveCursors = (myUserName: string) => {
  const [cursors, setCursors] = useState<CursorData[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const myColor = useRef(getRandomColor());

  useEffect(() => {
    // 실제 서버가 없으면 에러가 나므로 autoConnect: false 설정 (테스트용)
    // 나중에 서버가 준비되면 "http://localhost:4000" 등으로 변경하고 autoConnect: true로 하세요.
    socketRef.current = io("http://localhost:4000", {
      autoConnect: false,
    });

    const socket = socketRef.current;

    // 1. 다른 사람의 커서 움직임 수신
    socket.on("cursor-update", (data: CursorData) => {
      setCursors((prev) => {
        const filtered = prev.filter((c) => c.userId !== data.userId);
        return [...filtered, data];
      });
    });

    // 2. 사용자가 나갔을 때 커서 제거
    socket.on("user-disconnected", (userId: string) => {
      setCursors((prev) => prev.filter((c) => c.userId !== userId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 3. 내 마우스 움직임 처리 함수
  // 🔥 [수정] 함수 이름을 handleMouseMove로 정의 (반환값과 일치)
  const handleMouseMove = (e: React.MouseEvent) => {
    // if (!socketRef.current) return; // 서버 연결 전이라 주석 처리

    // 성능 최적화를 위해 50ms마다 한 번씩만 전송 (Throttling 추천)
    const myData = {
      userId: "me", // 테스트용 ID
      userName: myUserName,
      x: e.clientX,
      y: e.clientY,
      color: myColor.current,
    };

    // 서버가 있다면 전송
    // socketRef.current?.emit("cursor-move", myData);

    // 🔥 [테스트용] 로컬에서 확인하기 위해 내 움직임도 화면에 찍어봄
    // (실제 배포 시에는 주석 처리하세요)
    setCursors((prev) => {
      const filtered = prev.filter((c) => c.userId !== "me");
      return [...filtered, myData];
    });
  };

  // 🔥 [반환] 훅을 사용하는 곳(Project.tsx)에서 이 이름들을 씁니다.
  return { cursors, handleMouseMove };
};
