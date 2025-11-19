import React, { useState } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
import "../styles/TaskBoard.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[];
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
}

const TaskBoard: React.FC<Props> = ({
  columns,
  members,
  tasks,
  onAddColumn,
  onDeleteColumn,
  onAddMemberToColumn,
  onDeleteMember,
  onAddTask,
  onSelectTask,
}) => {
  const [newColumnName, setNewColumnName] = useState("");

  const handleAddColumnClick = () => {
    if (!newColumnName.trim()) return;
    onAddColumn(newColumnName.trim());
    setNewColumnName("");
  };

  const handleAddTaskClick = (columnId: number) => {
    const title = prompt("추가할 작업명:");
    if (!title) return;
    onAddTask(columnId, title);
  };

  return (
    <div className="taskboard">
      <div className="columns-container">
        {columns.map((col) => (
          <div key={col.id} className="column">
            <div className="column-header">
              <h3 style={{ margin: 0, fontSize: 16 }}>{col.name}</h3>
              <div className="taskboard-header-actions">
                <button
                  className="task-btn small"
                  onClick={() => handleAddTaskClick(col.id)}
                >
                  + 작업
                </button>
                <button
                  className="task-btn small red"
                  onClick={() => onDeleteColumn(col.id)}
                >
                  삭제
                </button>
              </div>
            </div>

            {/* 작업 리스트 */}
            <div className="task-items">
              {tasks
                .filter((t) => t.columnId === col.id)
                .map((task) => (
                  <div
                    key={task.id}
                    className="task-item"
                    onClick={() => onSelectTask(task.id)}
                  >
                    <strong>{task.title}</strong>
                    {task.members.length > 0 && (
                      <div className="task-members">
                        {task.members.map((m) => (
                          <span key={m} className="task-member-tag">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* 멤버 리스트 (역할 배정) */}
            <div className="taskboard-members">
              <h4>역할 멤버</h4>
              <ul style={{ padding: 0, listStyle: "none" }}>
                {col.members.map((m) => {
                  const memberInfo = members.find((mm) => mm.id === m.id);
                  if (!memberInfo) return null;
                  return (
                    <li key={m.id} className="member-item-row">
                      <span>{memberInfo.name}</span>
                      <button
                        className="edit-btn red"
                        style={{ color: "red" }}
                        onClick={() => onDeleteMember(col.id, m.id)}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                className="task-btn"
                style={{ width: "100%", marginTop: 10 }}
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
                + 멤버 배정
              </button>
            </div>
          </div>
        ))}

        {/* 역할 추가 */}
        <div className="column empty-column" style={{ display: "block" }}>
          <div style={{ marginBottom: 10, fontWeight: "bold" }}>새 역할</div>
          <input
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="역할 이름 입력"
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 8,
              borderRadius: 6,
              border: "1px solid #ddd",
            }}
          />
          <button
            className="task-btn"
            style={{ width: "100%" }}
            onClick={handleAddColumnClick}
          >
            + 역할 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
