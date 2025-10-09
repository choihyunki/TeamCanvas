import React from "react";
import { Member } from "../types/Member";
import MemberCard from "./MemberCard";
import styles from "../styles/MemberList.module.css"; // 외부 스타일로 분리

export interface MemberListProps {
  members: Member[];
  onAddMemberClick?: () => void;
  onDeleteMember?: (memberId: number) => void;
  onAddMember?: (memberId: string) => void;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  onAddMemberClick,
  onDeleteMember,
  onAddMember,
}) => {
  // 드래그 관련 이벤트
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!onAddMember) return;
    const memberId = e.dataTransfer.getData("memberId");
    if (memberId) onAddMember(memberId);
  };

  return (
    <div
      className={styles.container}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 헤더 */}
      <div className={styles.header}>
        <h3 className={styles.title}>멤버 리스트</h3>
        {onAddMemberClick && (
          <button className={styles.addButton} onClick={onAddMemberClick}>
            추가
          </button>
        )}
      </div>

      {/* 멤버 카드 목록 */}
      <div className={styles.list}>
        {members.map((member) => (
          <div key={member.id} className={styles.cardWrapper}>
            <MemberCard
              member={member}
              onDragStart={(e) =>
                e.dataTransfer.setData("memberId", member.id.toString())
              }
            />
            {onDeleteMember && (
              <button
                className={styles.deleteButton}
                onClick={() => onDeleteMember(member.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;
