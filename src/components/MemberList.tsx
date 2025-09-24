import React from "react";

interface Member {
  id: number;
  name: string;
}

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
            padding: "12px",
            borderRadius: "16px",
            background: "#e0f7fa", // 파스텔톤 블루
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            cursor: "grab", // ✅ 드래그 가능한 느낌
            transition: "0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#b2ebf2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#e0f7fa")}
        >
          {/* 아바타 (이니셜 원형) */}
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

          {/* 이름 */}
          <div style={{ fontSize: "16px", fontWeight: "500" }}>
            {member.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberList;
