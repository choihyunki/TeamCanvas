import React from "react";

// ✅ 1. Member 타입에 isOnline 속성 추가
interface Member {
  id: number;
  name: string;
  role?: string;
  isOnline?: boolean; // 온라인 상태
}

interface Props {
  member: Member;
  children?: React.ReactNode;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const MemberCard: React.FC<Props> = ({ member, children, onDragStart }) => {
  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        borderRadius: "12px",
        background: "#e0f7fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        cursor: onDragStart ? "grab" : "default",
        width: "100%",
        boxSizing: 'border-box',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        {/* ✅ 2. 아바타 컨테이너에 relative 포지션 설정 */}
        <div style={{ position: 'relative', marginRight: '8px', flexShrink: 0 }}>
          {/* 아바타 */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#80deea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {member.name.charAt(0)}
          </div>

          {/* ✅ 3. 온라인 상태 표시 점(dot) 추가 */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: member.isOnline ? '#4caf50' : '#9e9e9e', // 온라인이면 초록, 오프라인이면 회색
              border: '2px solid white', // 아바타와 겹칠 때 경계를 선명하게
            }}
            title={member.isOnline ? "온라인" : "오프라인"}
          />
        </div>
        
        {/* 이름 */}
        <div
          style={{
            fontSize: "15px",
            fontWeight: "500",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {member.name}
        </div>
      </div>
      
      {/* 상태 변경 UI 등 추가적인 요소가 들어갈 자리 */}
      <div>{children}</div>
    </div>
  );
};

export default MemberCard;