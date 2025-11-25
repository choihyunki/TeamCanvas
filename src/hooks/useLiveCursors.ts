import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { CursorData } from "../components/LiveCursors";

// 랜덤 색상 생성
const getRandomColor = () => {
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F033FF",
    "#FF33A8",
    "#00E5FF",
    "#FFD700",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useLiveCursors = (myUserName: string) => {
  const [cursors, setCursors] = useState<CursorData[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const myColor = useRef(getRandomColor());

  useEffect(() => {
    // 🔥 [수정] 진짜 서버(4000번 포트)에 연결
    socketRef.current = io("http://localhost:4000");

    const socket = socketRef.current;

    // 1. 다른 사람의 좌표 받기
    socket.on("cursor-update", (data: CursorData) => {
      setCursors((prev) => {
        const filtered = prev.filter((c) => c.userId !== data.userId);
        return [...filtered, data];
      });
    });

    // 2. 나간 사람 지우기
    socket.on("user-disconnected", (userId: string) => {
      setCursors((prev) => prev.filter((c) => c.userId !== userId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 3. 내 마우스 움직임 전송
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!socketRef.current) return;

    const myData = {
      userName: myUserName,
      x: e.clientX,
      y: e.clientY,
      color: myColor.current,
    };

    // 🔥 [수정] 서버로 진짜 전송 (내 화면에는 안 그림)
    socketRef.current.emit("cursor-move", myData);
  };

  return { cursors, handleMouseMove };
};
