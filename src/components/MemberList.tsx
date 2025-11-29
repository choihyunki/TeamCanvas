import React from "react";
import { Member } from "../types/Member";
import styles from "../styles/MemberList.module.css";

interface Props {
  members: Member[];
  onAddMemberClick: () => void;
  onDeleteMember: (memberId: string) => void;
  onAddMemberFromFriend: (
    friendId: number | string,
    friendName: string
  ) => void;
}

const MemberList: React.FC<Props> = ({
  members,
  onAddMemberClick,
  onDeleteMember,
  onAddMemberFromFriend,
}) => {
  // 친구 목록에서 드롭되었을 때 처리하는 핸들러
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";

    // 1. 드래그 데이터 추출
    const friendName = e.dataTransfer.getData("friendName");
    const friendIdStr = e.dataTransfer.getData("friendId");

    if (friendName && friendIdStr) {
      if (
        window.confirm(`프로젝트 멤버에 ${friendName} 님을 추가하시겠습니까?`)
      ) {
        onAddMemberFromFriend(friendIdStr, friendName);
      }
    }
  };

  // 드래그 시작 (TaskBoard로 이동용)
  const handleDragStart = (
    e: React.DragEvent<HTMLLIElement>,
    memberId: string
  ) => {
    e.dataTransfer.setData("memberId", memberId.toString());
    e.dataTransfer.setData("type", "MEMBER");
    e.dataTransfer.effectAllowed = "move";
  };

  // 드롭 허용 및 시각적 강조
  const handleDragOver = (e: React.DragEvent) => {
    if (
      e.dataTransfer.types.includes("friendName") ||
      e.dataTransfer.types.length > 0
    ) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      (e.currentTarget as HTMLElement).style.backgroundColor = "#f0f7ff";
    }
  };

  // 드래그 이탈
  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
  };

  return (
    <div
      className={styles.container}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>프로젝트 멤버 ({members.length})</h3>
      </div>

      <div className={styles.list}>
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
            draggable
            onDragStart={(e) => handleDragStart(e, m.id)}
          >
            {/* 🔥 [수정] 아바타 및 상태 점 (CSS Module 적용) */}
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {m.avatarInitial || m.name.charAt(0)}
              </div>
              {/* 상태 점: 온라인이면 green, 아니면 gray */}
              <div
                className={`${styles.statusDot} ${
                  m.isOnline ? styles.online : styles.offline
                }`}
              />
            </div>

            {/* 🔥 [수정] 멤버 정보 및 텍스트 상태 */}
            <div className={styles.memberInfo}>
              <div className={styles.memberName}>{m.name}</div>
              <div
                className={`${styles.statusText} ${
                  m.isOnline ? styles.textOnline : styles.textOffline
                }`}
              >
                {m.isOnline ? "Active Now" : "Offline"}
              </div>
            </div>

            <button
              className={styles.deleteButton}
              onClick={() => onDeleteMember(m.id)}
              title="내보내기"
            >
              &times;
            </button>
          </li>
        ))}
      </div>

      <button className={styles.addButton} onClick={onAddMemberClick}>
        + 멤버 추가
      </button>
    </div>
  );
};

export default MemberList;
