// src/components/MemberList.tsx

import React from "react";
import { Member } from "../types/Member";
import "../styles/MemberList.module.css";

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
    <div style={{ padding: "10px" }}>
      <h3 style={{ marginBottom: "10px" }}>프로젝트 멤버</h3>

      {/* 멤버 목록 */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {members.length === 0 && (
          <p style={{ color: "#666" }}>아직 멤버가 없습니다.</p>
        )}

        {members.map((m) => (
          <li
            key={m.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 8px",
              background: "#fff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              marginBottom: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* 프로필 원 */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#4f46e5",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 14,
                }}
              >
                {m.name[0]}
              </div>

              <span style={{ fontSize: 15, fontWeight: 500 }}>{m.name}</span>
            </div>

            <button
              onClick={() => onDeleteMember(m.id)}
              style={{
                border: "none",
                background: "transparent",
                color: "red",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* 멤버 추가 버튼 */}
      <button
        onClick={onAddMemberClick}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 15,
          fontWeight: "bold",
        }}
      >
        + 멤버 추가
      </button>
    </div>
  );
};

export default MemberList;
