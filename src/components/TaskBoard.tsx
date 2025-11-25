// src/components/TaskBoard.tsx

import React, { useState } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
import "../styles/TaskBoard.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[]; // (에러 방지용 유지)

  // 🔥 [수정] Project.tsx와 이름 통일
  onAddColumn: (name: string) => void;
  onDeleteColumn: (columnId: number) => void;

  onAddMemberToColumn: (columnId: number, memberId: number) => void;
  onMoveMember: (memberId: number, from: number, to: number) => void;
  onUpdateStatus: (columnId: number, memberId: number, status: string) => void;
  onDeleteMember: (columnId: number, memberId: number) => void;
  onUpdateMemberMemo: (
    columnId: number,
    memberId: number,
    memo: string
  ) => void;
  onInviteFriend: (
    columnId: number,
    friendId: string,
    friendName: string
  ) => void;

  onAddTask: (columnId: number, title: string) => void;
  onSelectTask: (taskId: number) => void;

  // 드롭 핸들러
  onDropMemberOnColumn: (columnId: number, memberId: number) => void;
}

const TaskBoard: React.FC<Props> = ({
  columns,
  members,
  onAddColumn, // 이름 일치 확인
  onDeleteColumn,
  onAddMemberToColumn,
  onDeleteMember,
  onDropMemberOnColumn,
}) => {
  const [newColumnName, setNewColumnName] = useState("");

  const handleAddColumnClick = () => {
    if (!newColumnName.trim()) return;
    onAddColumn(newColumnName.trim());
    setNewColumnName("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = (e: React.DragEvent, columnId: number) => {
    e.preventDefault();
    const memberIdStr = e.dataTransfer.getData("memberId");
    if (!memberIdStr) return;
    const memberId = parseInt(memberIdStr, 10);
    onDropMemberOnColumn(columnId, memberId);
  };

  return (
    <div className="taskboard">
      <div className="columns-container">
        {columns.map((col) => {
          // 진행률 계산 로직 추가
          const getProgress = (mId: number) => {
            const memberInCol = col.members.find((m) => m.id === mId);
            const subTasks = memberInCol?.subTasks || [];
            const total = subTasks.length;
            const done = subTasks.filter((t) => t.completed).length;
            return total === 0 ? 0 : Math.round((done / total) * 100);
          };

          return (
            <div
              key={col.id}
              className="column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnColumn(e, col.id)}
              style={{
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="column-header">
                <h3 style={{ margin: 0, fontSize: 16 }}>{col.name}</h3>
                <button
                  className="task-btn small red"
                  onClick={() => onDeleteColumn(col.id)}
                >
                  삭제
                </button>
              </div>

              <div className="taskboard-members" style={{ flex: 1 }}>
                <h4 style={{ marginTop: 15, marginBottom: 10, color: "#666" }}>
                  배정된 멤버
                </h4>

                {col.members.length === 0 ? (
                  <div
                    style={{
                      padding: "30px 0",
                      color: "#aaa",
                      fontSize: "13px",
                      textAlign: "center",
                      border: "2px dashed #e5e7eb",
                      borderRadius: "8px",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    멤버를 이곳으로
                    <br />
                    드래그하세요
                  </div>
                ) : (
                  <ul style={{ padding: 0, listStyle: "none" }}>
                    {col.members.map((m) => {
                      const memberInfo = members.find((mm) => mm.id === m.id);
                      if (!memberInfo) return null;

                      const percent = getProgress(m.id); // 진행률 가져오기

                      return (
                        <li
                          key={m.id}
                          className="member-item-row"
                          style={{ display: "block", marginBottom: 12 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  background: "#4f46e5",
                                  color: "white",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  fontSize: 12,
                                  fontWeight: "bold",
                                }}
                              >
                                {memberInfo.name[0]}
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 500 }}>
                                {memberInfo.name}
                              </span>
                            </div>
                            <button
                              className="edit-btn"
                              style={{ color: "#ef4444", fontWeight: "bold" }}
                              onClick={() => onDeleteMember(col.id, m.id)}
                            >
                              ✕
                            </button>
                          </div>

                          {/* 진행률 바 표시 */}
                          <div
                            style={{
                              marginTop: 6,
                              width: "100%",
                              height: 4,
                              background: "#eee",
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${percent}%`,
                                height: "100%",
                                background:
                                  percent === 100 ? "#10b981" : "#4f46e5",
                                transition: "width 0.3s",
                              }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <button
                  className="task-btn"
                  style={{ width: "100%", marginTop: "auto" }}
                  onClick={() => {
                    const idStr = prompt(
                      "추가할 멤버 ID: " +
                        members.map((m) => `${m.id}-${m.name}`).join(", ")
                    );
                    if (!idStr) return;
                    onAddMemberToColumn(col.id, Number(idStr));
                  }}
                >
                  + 멤버 직접 배정
                </button>
              </div>
            </div>
          );
        })}

        <div
          className="column empty-column"
          style={{ display: "block", minHeight: "fit-content" }}
        >
          <div style={{ marginBottom: 10, fontWeight: "bold", color: "#444" }}>
            새 작업 보드
          </div>
          <input
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="보드 이름"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
              border: "1px solid #ddd",
            }}
          />
          <button
            className="task-btn"
            style={{ width: "100%", padding: "10px" }}
            onClick={handleAddColumnClick}
          >
            + 보드 생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
