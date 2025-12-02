// src/hooks/useLiveCursors.ts 전체 교체

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

// 🔥 [수정] projectId 인자 추가
export const useLiveCursors = (myUserName: string, projectId: string) => {
  const [cursors, setCursors] = useState<CursorData[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const myColor = useRef(getRandomColor());
  const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!projectId) return;

    socketRef.current = io(SERVER_URL);
    const socket = socketRef.current;

    // 🔥 [추가] 커서용 소켓도 방에 입장해야 함!
    socket.emit("join_room", projectId);

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
  }, [projectId]); // projectId 바뀔 때마다 재연결

  // 3. 내 마우스 움직임 전송
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!socketRef.current) return;

    const myData = {
      projectId: projectId, // 🔥 [추가] 어느 방인지 명시
      userName: myUserName,
      x: e.clientX,
      y: e.clientY,
      color: myColor.current,
    };

    socketRef.current.emit("cursor-move", myData);
  };

  return { cursors, handleMouseMove };
};
