import React from "react";
import { Member } from "../types/Member";
import "../styles/MemberCard.css";

interface Props {
  member: Member;
  onClick?: () => void;
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

const MemberCard: React.FC<Props> = ({
  member,
  onClick,
  onDelete,
  showDelete = false,
}) => {
  // 🔥 [추가] 드래그 시작 시 실행: 멤버 ID를 데이터에 담음
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("memberId", member.id.toString());
    e.dataTransfer.effectAllowed = "copy"; // 복사 아이콘 표시
  };

  return (
    <div
      onClick={onClick}
      className={`member-card ${onClick ? "clickable" : ""}`}
      // 🔥 [추가] 드래그 활성화
      draggable={true}
      onDragStart={handleDragStart}
      style={{ cursor: "grab" }} // 마우스 커서를 손 모양으로
    >
      <div className="member-info-wrapper">
        <div className="profile-circle">{member.name.charAt(0)}</div>
        <div>
          <div className="member-name">{member.name}</div>
          <div
            className={`member-status ${
              member.isOnline ? "status-online" : "status-offline"
            }`}
          >
            {member.isOnline ? "온라인" : "오프라인"}
          </div>
        </div>
      </div>

      {showDelete && onDelete && (
        <button
          className="delete-icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(member.id);
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default MemberCard;
