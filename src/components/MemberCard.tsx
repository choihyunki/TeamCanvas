import React from "react";
import { Member } from "../types/Member";
import "../styles/MemberCard.css"; // CSS import

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
  return (
    <div
      onClick={onClick}
      className={`member-card ${onClick ? "clickable" : ""}`}
    >
      <div className="member-info-wrapper">
        {/* 프로필 원 */}
        <div className="profile-circle">{member.name.charAt(0)}</div>

        {/* 사용자 이름 */}
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

      {/* 삭제 버튼 */}
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
