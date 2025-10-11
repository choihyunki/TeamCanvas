import React from "react";
import { Member } from "../types/Member"; // 타입 파일 경로는 프로젝트에 맞게 확인해주세요.

interface Props {
  member: Member;
  memo?: string;
  children?: React.ReactNode;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const MemberCard: React.FC<Props> = ({ member, memo, children, onDragStart }) => {
  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        borderRadius: "12px",
        background: "#e0f7fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        cursor: onDragStart ? "grab" : "default",
        width: "100%",
        boxSizing: 'border-box',
      }}
    >
      {/* ✅ 1. 왼쪽: 아바타와 이름 (flex 속성 제거) */}
      <div style={{
        display: "flex",
        alignItems: "center",
        minWidth: 0, // 자식 요소가 부모를 넘어설 때 줄어들도록 함
      }}>
        <div style={{ position: 'relative', marginRight: '8px', flexShrink: 0 }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#80deea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {member.name.charAt(0)}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: member.isOnline ? '#4caf50' : '#9e9e9e',
              border: '2px solid white',
            }}
            title={member.isOnline ? "온라인" : "오프라인"}
          />
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: "500",
            whiteSpace: "nowrap", // 이름은 한 줄로 표시
            overflow: "hidden",
            textOverflow: "ellipsis",
            // ✅ 이름이 길 경우를 대비해 최대 너비 설정
            maxWidth: '100px',
          }}
        >
          {member.name}
        </div>
      </div>
      
      {/* ✅ 2. 중앙: 메모 (남는 공간을 모두 차지) */}
      <div style={{
        flex: 1, // 남는 공간을 모두 차지하도록 설정
        textAlign: 'center',
        fontSize: '14px',
        color: '#4A5568',
        fontStyle: 'italic',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0, // 내용이 길어도 강제로 줄어들도록 허용
      }}>
        {memo}
      </div>

      {/* 오른쪽: 버튼 영역 (크기 고정) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
};

export default MemberCard;