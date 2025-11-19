// src/components/MemberList.tsx

import React from "react";
import { Member } from "../types/Member";
import styles from "../styles/MemberList.module.css";

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
          <li key={m.id} className={styles.cardWrapper}>
            {/* 🔥 인라인 스타일 제거하고 CSS 클래스 적용 */}
            <div className={styles.memberCard}>
              <div className={styles.avatar}>{m.name.charAt(0)}</div>
              <span className={styles.memberName}>{m.name}</span>

              <button
                className={styles.deleteButton}
                onClick={() => onDeleteMember(m.id)}
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
