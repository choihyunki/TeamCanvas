// src/components/MemberCard.tsx

import React from "react";
import { Member } from "../types/Member";

interface Props {
  member: Member;
  onClick?: () => void; // 카드 클릭 이벤트
  onDelete?: (id: number) => void; // 삭제 버튼 눌렀을 때
  showDelete?: boolean; // 삭제 버튼 표시 여부
}

const MemberCard: React.FC<Props> = ({
  member,
  onClick,
  onDelete,
  showDelete = false,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        borderRadius: "8px",
        background: "#fff",
        border: "1px solid #e5e7eb",
        cursor: onClick ? "pointer" : "default",
        transition: "0.2s",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* 프로필 원 */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#6366f1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          {member.name.charAt(0)}
        </div>

        {/* 사용자 이름 */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{member.name}</div>
          <div
            style={{
              fontSize: 12,
              color: member.isOnline ? "#10b981" : "#6b7280",
              fontWeight: 500,
            }}
          >
            {member.isOnline ? "온라인" : "오프라인"}
          </div>
        </div>
      </div>

      {/* 삭제 버튼 */}
      {showDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭과 충돌 방지
            onDelete(member.id);
          }}
          style={{
            border: "none",
            background: "transparent",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default MemberCard;
