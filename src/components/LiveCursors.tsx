// src/components/LiveCursors.tsx
import React from "react";

// 커서 데이터 타입 정의
export interface CursorData {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

interface Props {
  cursors: CursorData[];
}

// 커서 아이콘 (SVG)
const CursorIcon = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="36"
    viewBox="0 0 24 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "translate(-2px, -2px)" }} // 클릭 지점 보정
  >
    <path
      d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
      fill={color}
      stroke="white"
    />
  </svg>
);

const LiveCursors: React.FC<Props> = ({ cursors }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none", // 마우스 이벤트를 가리지 않도록 설정 (필수!)
        zIndex: 9999, // 최상단에 표시
        overflow: "hidden",
      }}
    >
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
            transition: "transform 0.1s linear", // 부드러운 이동 애니메이션
          }}
        >
          <CursorIcon color={cursor.color} />

          {/* 이름표 */}
          <div
            style={{
              backgroundColor: cursor.color,
              color: "white",
              padding: "2px 8px",
              borderRadius: "10px",
              fontSize: "12px",
              marginTop: "4px",
              marginLeft: "10px",
              whiteSpace: "nowrap",
            }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveCursors;
