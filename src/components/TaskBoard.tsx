import React, { useState } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
import "../styles/TaskBoard.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[]; // (에러 방지용 유지)
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

  // 🔥 [핵심] 컬럼(보드)에 멤버를 드롭했을 때 실행되는 함수
  onDropMemberOnColumn: (columnId: number, memberId: number) => void;
}

const TaskBoard: React.FC<Props> = ({
  columns,
  members,
  onAddColumn,
  onDeleteColumn,
  onAddMemberToColumn,
  onDeleteMember,
  onDropMemberOnColumn, // Project.tsx에서 내려받은 핸들러
}) => {
  const [newColumnName, setNewColumnName] = useState("");

  const handleAddColumnClick = () => {
    if (!newColumnName.trim()) return;
    onAddColumn(newColumnName.trim());
    setNewColumnName("");
  };

  // 1. 드래그 오버 허용
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 2. 드롭 이벤트 처리 (컬럼 ID와 멤버 ID를 매칭)
  const handleDropOnColumn = (e: React.DragEvent, columnId: number) => {
    e.preventDefault();
    const memberIdStr = e.dataTransfer.getData("memberId");

    if (!memberIdStr) return; // 멤버 카드가 아니면 무시

    const memberId = parseInt(memberIdStr, 10);
    onDropMemberOnColumn(columnId, memberId);
  };

  return (
    <div className="taskboard">
      <div className="columns-container">
        {columns.map((col) => (
          <div
            key={col.id}
            className="column"
            // 🔥 [핵심] 컬럼 전체를 드롭 구역으로 설정
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnColumn(e, col.id)}
            style={{
              minHeight: "300px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* --- 헤더 영역 --- */}
            <div className="column-header">
              <h3 style={{ margin: 0, fontSize: 16 }}>{col.name}</h3>
              <button
                className="task-btn small red"
                onClick={() => onDeleteColumn(col.id)}
              >
                삭제
              </button>
            </div>

            {/* 🗑️ [삭제됨] 복잡했던 '작업 리스트(Task Items)' 렌더링 부분 제거 완료 */}

            {/* --- 멤버 리스트 영역 (여기가 메인) --- */}
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
                  왼쪽에서 멤버를
                  <br />
                  이곳으로 드래그하세요
                </div>
              ) : (
                <ul style={{ padding: 0, listStyle: "none" }}>
                  {col.members.map((m) => {
                    const memberInfo = members.find((mm) => mm.id === m.id);
                    if (!memberInfo) return null;
                    return (
                      <li key={m.id} className="member-item-row">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {/* 아바타 */}
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
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* (선택사항) 버튼으로 멤버 추가하는 기능은 유지 */}
              <button
                className="task-btn"
                style={{ width: "100%", marginTop: "auto" }}
                onClick={() => {
                  const idStr = prompt(
                    "추가할 멤버 선택 (ID):\n" +
                      members.map((m) => `${m.id} - ${m.name}`).join("\n")
                  );
                  if (!idStr) return;
                  const id = Number(idStr);
                  onAddMemberToColumn(col.id, id);
                }}
              >
                + 멤버 직접 배정
              </button>
            </div>
          </div>
        ))}

        {/* --- 새 역할(보드) 추가 영역 --- */}
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
            placeholder="보드 이름 (예: 디자인)"
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
