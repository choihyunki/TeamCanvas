import React, { useState } from "react"; // ⭐️ [추가] useState 훅을 가져옵니다.
import { Member } from "../types/Member";

interface Props {
  member: Member;
  memo?: string;
  children?: React.ReactNode;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const MemberCard: React.FC<Props> = ({ member, memo, children, onDragStart }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 15px",
    borderRadius: "8px",
    background: isHovered ? "#eff6ff" : "#dbeafe", 
    border: "1px solid #bfdbfe",
    boxShadow: isHovered ? "0 4px 8px rgba(0,0,0,0.08)" : "none",
    cursor: onDragStart ? "grab" : "default",
    width: "100%",
    boxSizing: 'border-box',
    transition: "all 0.2s ease-in-out",
    transform: isHovered ? "translateY(-2px)" : "none",
  };

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cardStyle}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        minWidth: 0,
      }}>
        <div style={{ position: 'relative', marginRight: '10px', flexShrink: 0 }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#e9ecef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#495057",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {member.name.charAt(0)}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: member.isOnline ? '#28a745' : '#adb5bd',
              border: '2px solid white',
            }}
            title={member.isOnline ? "온라인" : "오프라인"}
          />
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: "600", // ⭐️ [수정] 이름을 조금 더 굵게
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: '100px',
            color: '#212529',
          }}
        >
          {member.name}
        </div>
      </div>

      {/* 2. 중앙: 메모 */}
      <div style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '14px',
        color: '#6c757d',
        fontStyle: 'normal',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
      }}>
        {memo}
      </div>

      {/* 3. 오른쪽: 버튼 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
};

export default MemberCard;