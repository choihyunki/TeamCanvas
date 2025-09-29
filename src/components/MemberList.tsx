import React from "react";
import { Member } from "../types/Member"; // 공통 타입 import

interface Props {
  members: Member[];
}

const MemberList: React.FC<Props> = ({ members }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "10px",
        background: "#fdfdfd",
        height: "100%",
      }}
    >
      <h3
        style={{
          margin: "0 0 10px 0",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        멤버 리스트
      </h3>

      {members.map((member) => (
        <div
          key={member.id}
          draggable
          onDragStart={(e) =>
            e.dataTransfer.setData("memberId", member.id.toString())
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px",
            borderRadius: "16px",
            background: "#e0f7fa",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            cursor: "grab",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#b2ebf2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#e0f7fa")}
        >
          {/* 아바타 + 이름 */}
          <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#80deea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                marginRight: "10px",
                fontSize: "16px",
              }}
            >
              {member.name.charAt(0)}
            </div>
            <div style={{ fontSize: "16px", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {member.name}
            </div>
          </div>
          {/* 역할 */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#000",
              fontSize: "14px",
              fontWeight: 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {member.role}
          </div>
          {/* 온라인 상태 원 */}
          <div
            title={member.isOnline ? "온라인" : "오프라인"}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: member.isOnline ? "#4caf50" : "#9e9e9e",
              marginLeft: "8px",
            }}
          />
        </div>
))}
    </div>
  );
};

export default MemberList;
