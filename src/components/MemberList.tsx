import React from "react";
import { Member } from "../types/Member";
import styles from "../styles/MemberList.module.css"; 

interface Props {
  members: Member[];
  onAddMemberClick: () => void;
  onDeleteMember: (memberId: number) => void;
  onAddMemberFromFriend: (friendId: number, friendName: string) => void; 
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

    // 1. 드래그 데이터 추출 (friendId와 friendName 키 사용)
    const friendName = e.dataTransfer.getData("friendName");
    const friendIdStr = e.dataTransfer.getData("friendId");
    
    if (friendName && friendIdStr) { 
        const friendId = Number(friendIdStr);

        // window.confirm 대신 alert 사용 (Canvas 환경 권장)
        if (window.confirm(`프로젝트 멤버에 ${friendName} 님을 추가하시겠습니까?`)) {
            onAddMemberFromFriend(friendId, friendName); 
        }
    }
  };


  // 드래그 시작 시 멤버 ID를 데이터로 저장하는 핸들러 (TaskBoard로 이동할 때 사용)
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, memberId: number) => {
    e.dataTransfer.setData("memberId", memberId.toString());
    e.dataTransfer.setData("type", "MEMBER"); 
    e.dataTransfer.effectAllowed = "move";
  };
  
  // [FIXED] 드롭 허용 및 시각적 강조 핸들러 (무조건 드롭 허용 신호를 보내 커서 X 방지)
  const handleDragOver = (e: React.DragEvent) => {
      // 1. 드래그된 데이터에 'friendName' 키가 있는지 확인
      // 2. 아니면 'text/plain'만 있어도 드롭을 허용 (커서 X 방지 핵심)
      if (e.dataTransfer.types.includes('friendName') || e.dataTransfer.types.length > 0) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy'; 
          (e.currentTarget as HTMLElement).style.backgroundColor = "#f0f7ff"; 
      }
  };
  
  // 드래그 이탈 시 시각적 강조 제거
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
            draggable="true" 
            onDragStart={(e) => handleDragStart(e, m.id)}
          >
            <div className={styles.memberCard}>
              <div className={styles.avatar}>{m.name.charAt(0)}</div>
              <span className={styles.memberName}>{m.name}</span>
              
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