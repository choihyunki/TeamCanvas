import React from "react";
import { Member } from "../types/Member"; // Member 타입을 정의한 파일에서 가져옵니다.
import MemberCard from "./MemberCard";   // 재사용을 위해 분리한 MemberCard 컴포넌트를 가져옵니다.

// 이 컴포넌트가 부모로부터 받을 props 타입 정의
interface Props {
  members: Member[];
  onAddMemberClick?: () => void; // '추가' 버튼 클릭 시 호출될 함수 (선택적)
  onDeleteMember?: (memberId: number) => void; // 멤버 삭제 시 호출될 함수 (선택적)
  // 다른 리스트로 드롭을 허용할 경우를 위한 props (선택적)
  onAddMember?: (memberId: string) => void;
}

const MemberList: React.FC<Props> = ({
  members,
  onAddMemberClick,
  onDeleteMember,
  onAddMember, // 드롭 기능을 위해 사용될 수 있음
}) => {
  // 드래그 관련 이벤트 핸들러들
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // 드롭을 허용하기 위해 기본 동작을 막음
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // onAddMember prop이 전달된 경우에만 드롭 로직 실행
    if (onAddMember) {
      const memberId = e.dataTransfer.getData("memberId");
      if (memberId) {
        onAddMember(memberId);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px", // 카드 간 간격
        padding: "10px",
        background: "#fdfdfd",
        height: "100%",
        borderRadius: "8px",
      }}
    >
      {/* 컴포넌트 헤더: 타이틀과 추가 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "10px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          멤버 리스트
        </h3>
        {/* onAddMemberClick 함수가 props로 전달되었을 때만 '추가' 버튼을 보여줌 */}
        {onAddMemberClick && (
          <button
            onClick={onAddMemberClick}
            style={{
              padding: "5px 10px",
              fontSize: "14px",
              cursor: "pointer",
              border: "1px solid #ccc",
              borderRadius: "5px",
              background: "#f5f5f5",
            }}
          >
            추가
          </button>
        )}
      </div>

      {/* 멤버 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {members.map((member) => (
          <div key={member.id} style={{ position: "relative" }}>
            {/* 재사용 컴포넌트인 MemberCard를 사용 */}
            <MemberCard
              member={member}
              // 드래그 시작 시 멤버 ID를 데이터로 설정
              onDragStart={(e) =>
                e.dataTransfer.setData("memberId", member.id.toString())
              }
            />
            {/* onDeleteMember 함수가 props로 전달되었을 때만 '삭제' 버튼을 보여줌 */}
            {onDeleteMember && (
              <button
                onClick={() => onDeleteMember(member.id)}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#aaa",
                  padding: "0 4px",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f44336')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}
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