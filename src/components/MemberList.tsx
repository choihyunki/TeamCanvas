import React from "react";
import { Member } from "../types/Member";
import styles from "../styles/MemberList.module.css";
// import MemberCard from "./MemberCard"; // 🔥 직접 렌더링을 위해 제거 (MemberCard 수정 없이 바로 해결하기 위함)

interface Props {
  members: Member[];
  onAddMemberClick: () => void;
  onDeleteMember: (memberId: number) => void;
  // 🔥 [수정] ID가 문자열일 수도 있으므로 string | number 허용
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
      // 🔥 [수정] 무조건 Number로 바꾸지 않고, 값이 있으면 전달
      // (username이 "admin" 같은 문자열일 경우 NaN이 되는 것 방지)
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
    memberId: number
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

      <div
        className={styles.list}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
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
            className={styles.cardWrapper} // 기존 스타일 유지
            draggable
            onDragStart={(e) => handleDragStart(e, m.id)}
            // 🔥 [추가] 인라인 스타일로 리스트 아이템 디자인 (MemberCard 대체)
            style={{
              listStyle: "none",
              display: "flex",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #eee",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              cursor: "grab",
            }}
          >
            {/* 🔥 [핵심] 아바타 표시 (저장된 avatarInitial 사용) */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                // 온라인 상태에 따라 테두리/배경색 변경
                backgroundColor: m.isOnline ? "#d1fae5" : "#f3f4f6",
                color: m.isOnline ? "#065f46" : "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
                marginRight: "10px",
                border: m.isOnline ? "2px solid #10b981" : "1px solid #ddd",
                flexShrink: 0,
              }}
            >
              {/* 저장된 이니셜이 있으면 쓰고, 없으면 이름 첫 글자 */}
              {m.avatarInitial || m.name.charAt(0)}
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {m.name}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: m.isOnline ? "#10b981" : "#9ca3af",
                }}
              >
                {m.isOnline ? "● 온라인" : "○ 오프라인"}
              </div>
            </div>

            <button
              onClick={() => onDeleteMember(m.id)}
              style={{
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                fontSize: "18px",
                padding: "0 5px",
                marginLeft: "5px",
              }}
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
