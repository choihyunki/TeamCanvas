import React from "react";
import { Member } from "../types/Member";
import styles from "../styles/MemberList.module.css";
import MemberCard from "./MemberCard"; // 🔥 컴포넌트 import 필수!

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
            {/* 🔥 중요: 직접 div를 그리지 않고, 드래그 기능이 있는 MemberCard 컴포넌트를 사용합니다 */}
            <MemberCard
              member={m}
              onDelete={onDeleteMember}
              showDelete={true}
            />
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
