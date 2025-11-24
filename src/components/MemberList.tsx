import React from "react";
import { Member } from "../types/Member";
import styles from "../styles/MemberList.module.css"; // CSS Modules 사용

interface Props {
  members: Member[];
  onAddMemberClick: () => void;
  onDeleteMember: (memberId: number) => void;
}

const MemberList: React.FC<Props> = ({
  members,
  onAddMemberClick,
  onDeleteMember,
}) => {
  
  // 드래그 시작 시 멤버 ID를 데이터로 저장하는 핸들러
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, memberId: number) => {
    // ✋ Member ID를 'memberId'라는 키로 저장 (TaskBoard 드롭 대상이 사용)
    e.dataTransfer.setData("memberId", memberId.toString());
    e.dataTransfer.setData("type", "MEMBER"); // 드래그 타입 지정
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>프로젝트 멤버</h3>
      </div>

      <ul className={styles.list}>
        {members.length === 0 && (
          <p
            style={{
              color: "#999",
              fontSize: "14px",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            아직 멤버가 없습니다.
          </p>
        )}

        {members.map((m) => (
          <li 
            key={m.id} 
            className={styles.cardWrapper}
            // 👇 [핵심] 드래그 활성화 및 데이터 저장
            draggable="true" 
            onDragStart={(e) => handleDragStart(e, m.id)}
          >
            <div className={styles.memberCard}>
              <div className={styles.avatar}>{m.name.charAt(0)}</div>
              <span className={styles.memberName}>{m.name}</span>
              
              {/* Note: MemberCard의 상세 구현(온라인 상태 점 등)은 CSS Module에서 처리됩니다. */}

              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation(); 
                  onDeleteMember(m.id);
                }}
                title="멤버 삭제"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button className={styles.addButton} onClick={onAddMemberClick}>
        + 멤버 추가
      </button>
    </div>
  );
};

export default MemberList;