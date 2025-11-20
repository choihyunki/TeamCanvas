import React, { useState } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import "../styles/TaskDetails.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  onAddSubTask: (columnId: number, memberId: number, content: string) => void;
  onToggleSubTask: (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => void;
  onDeleteSubTask: (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => void;
}

const TaskDetails: React.FC<Props> = ({
  columns,
  members,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}) => {
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(
    columns.length > 0 ? columns[0].id : null
  );

  // 입력 상태 관리 (멤버별로 입력을 따로 관리하기 위해 객체 사용)
  const [inputs, setInputs] = useState<{ [key: number]: string }>({});

  const handleInputChange = (memberId: number, val: string) => {
    setInputs((prev) => ({ ...prev, [memberId]: val }));
  };

  const handleSubmit = (columnId: number, memberId: number) => {
    const content = inputs[memberId];
    if (!content || !content.trim()) return;

    onAddSubTask(columnId, memberId, content.trim());
    setInputs((prev) => ({ ...prev, [memberId]: "" })); // 입력창 초기화
  };

  const selectedColumn = columns.find((c) => c.id === selectedColumnId);

  return (
    <div className="task-details-container">
      <h2 className="task-details-title">세부 작업 내용</h2>

      {/* 1. 보드(역할) 선택 탭 */}
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          marginBottom: 20,
          paddingBottom: 10,
          borderBottom: "1px solid #eee",
        }}
      >
        {columns.map((col) => (
          <button
            key={col.id}
            onClick={() => setSelectedColumnId(col.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              background: selectedColumnId === col.id ? "#4f46e5" : "#e0e7ff",
              color: selectedColumnId === col.id ? "white" : "#4f46e5",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {col.name}
          </button>
        ))}
        {columns.length === 0 && (
          <p style={{ color: "#888" }}>생성된 보드가 없습니다.</p>
        )}
      </div>

      {/* 2. 선택된 보드의 멤버별 작업 리스트 */}
      {selectedColumn ? (
        <div className="details-content">
          {selectedColumn.members.length === 0 ? (
            <div className="empty-message">
              이 보드에 배정된 멤버가 없습니다. <br />
              '작업 보드' 탭에서 멤버를 드래그하여 추가하세요.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              {selectedColumn.members.map((m) => {
                const memberInfo = members.find((mm) => mm.id === m.id);
                const subTasks = m.subTasks || [];

                return (
                  <div
                    key={m.id}
                    style={{
                      background: "white",
                      padding: 15,
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  >
                    {/* 멤버 헤더 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
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
                          marginRight: 10,
                        }}
                      >
                        {memberInfo?.name[0]}
                      </div>
                      <h3 style={{ margin: 0 }}>{memberInfo?.name}</h3>
                    </div>

                    {/* 작업 리스트 (체크박스) */}
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "0 0 15px 0",
                      }}
                    >
                      {subTasks.map((task) => (
                        <li
                          key={task.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 0",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() =>
                              onToggleSubTask(selectedColumn.id, m.id, task.id)
                            }
                            style={{
                              width: 18,
                              height: 18,
                              marginRight: 10,
                              cursor: "pointer",
                            }}
                          />
                          <span
                            style={{
                              flex: 1,
                              textDecoration: task.completed
                                ? "line-through"
                                : "none",
                              color: task.completed ? "#aaa" : "#333",
                            }}
                          >
                            {task.content}
                          </span>
                          <button
                            onClick={() =>
                              onDeleteSubTask(selectedColumn.id, m.id, task.id)
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* 작업 추가 입력창 (Cell Add Style) */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        placeholder="할 일을 입력하세요..."
                        value={inputs[m.id] || ""}
                        onChange={(e) =>
                          handleInputChange(m.id, e.target.value)
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleSubmit(selectedColumn.id, m.id)
                        }
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: 4,
                          border: "1px solid #ccc",
                        }}
                      />
                      <button
                        onClick={() => handleSubmit(selectedColumn.id, m.id)}
                        style={{
                          padding: "8px 12px",
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        추가
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="empty-message">보드를 선택해주세요.</p>
      )}
    </div>
  );
};

export default TaskDetails;
