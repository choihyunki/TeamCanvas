<<<<<<< HEAD
import React, { useState } from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import "../styles/TaskDetails.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
<<<<<<< HEAD
=======
  // (구조 유지를 위해 남겨둠 - 실제로는 안 쓰더라도 에러 방지용)
  tasks?: Task[];
  selectedTaskId?: number | null;
  onUpdateTask?: (updatedTask: Task) => void;

  // 🔥 [필수 추가] Project.tsx에서 내려받은 세부 작업 핸들러
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD
=======
  // 1. 현재 선택된 보드(Column) 관리
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(
    columns.length > 0 ? columns[0].id : null
  );

<<<<<<< HEAD
  // 입력 상태 관리 (멤버별로 입력을 따로 관리하기 위해 객체 사용)
  const [inputs, setInputs] = useState<{ [key: number]: string }>({});

=======
  // 2. 입력창 상태 관리 (멤버 ID별로 입력값을 저장)
  const [inputs, setInputs] = useState<{ [key: number]: string }>({});

  // 보드가 변경되면 첫 번째 보드를 기본 선택
  useEffect(() => {
    if (!selectedColumnId && columns.length > 0) {
      setSelectedColumnId(columns[0].id);
    }
  }, [columns, selectedColumnId]);

>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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

<<<<<<< HEAD
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

=======
      {/* 1. 상단 탭: 어떤 보드(역할)를 볼 것인가? */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 10,
          borderBottom: "1px solid #eee",
          marginBottom: 20,
        }}
      >
        {columns.length === 0 && (
          <p style={{ color: "#999", fontSize: 14 }}>
            생성된 작업 보드가 없습니다.
          </p>
        )}

        {columns.map((col) => (
          <button
            key={col.id}
            onClick={() => setSelectedColumnId(col.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: selectedColumnId === col.id ? "#4f46e5" : "#e0e7ff",
              color: selectedColumnId === col.id ? "white" : "#4f46e5",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: "14px",
            }}
          >
            {col.name}
          </button>
        ))}
      </div>

      {/* 2. 선택된 보드의 멤버별 작업 리스트 */}
      {selectedColumn ? (
        <div className="details-content">
          {selectedColumn.members.length === 0 ? (
            <div
              className="empty-message"
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#999",
                border: "2px dashed #eee",
                borderRadius: 8,
              }}
            >
              이 보드에 배정된 멤버가 없습니다.
              <br />
              <span style={{ fontSize: 12 }}>
                ('작업 보드' 탭에서 멤버를 드래그하여 추가하세요)
              </span>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              {selectedColumn.members.map((m) => {
                const memberInfo = members.find((mm) => mm.id === m.id);
                const subTasks = m.subTasks || []; // 없으면 빈 배열

                if (!memberInfo) return null;

                return (
                  <div
                    key={m.id}
                    style={{
                      background: "white",
                      padding: 15,
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* 멤버 헤더 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 12,
                        borderBottom: "1px solid #f3f4f6",
                        paddingBottom: 8,
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
                          fontSize: 14,
                          fontWeight: "bold",
                        }}
                      >
                        {memberInfo.name[0]}
                      </div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>
                        {memberInfo.name}
                      </h3>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 12,
                          color: "#888",
                        }}
                      >
                        {subTasks.filter((t) => t.completed).length} /{" "}
                        {subTasks.length} 완료
                      </span>
                    </div>

>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD
                            padding: "6px 0",
                            borderBottom: "1px solid #f3f4f6",
=======
                            padding: "8px 0",
                            borderBottom: "1px solid #f9fafb",
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() =>
                              onToggleSubTask(selectedColumn.id, m.id, task.id)
                            }
                            style={{
<<<<<<< HEAD
                              width: 18,
                              height: 18,
                              marginRight: 10,
                              cursor: "pointer",
=======
                              width: 16,
                              height: 16,
                              marginRight: 10,
                              cursor: "pointer",
                              accentColor: "#4f46e5",
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
                            }}
                          />
                          <span
                            style={{
                              flex: 1,
<<<<<<< HEAD
=======
                              fontSize: 14,
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
                              textDecoration: task.completed
                                ? "line-through"
                                : "none",
                              color: task.completed ? "#aaa" : "#333",
<<<<<<< HEAD
=======
                              transition: "color 0.2s",
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD
                            }}
=======
                              fontSize: 14,
                              padding: "0 5px",
                            }}
                            title="삭제"
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD
                        placeholder="할 일을 입력하세요..."
=======
                        placeholder="+ 할 일 입력 (Enter)"
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD
                          padding: "8px",
                          borderRadius: 4,
                          border: "1px solid #ccc",
=======
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: "1px solid #ddd",
                          fontSize: 13,
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
                        }}
                      />
                      <button
                        onClick={() => handleSubmit(selectedColumn.id, m.id)}
                        style={{
<<<<<<< HEAD
                          padding: "8px 12px",
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
=======
                          padding: "8px 14px",
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD
        <p className="empty-message">보드를 선택해주세요.</p>
=======
        <div className="empty-message" style={{ marginTop: 50 }}>
          선택된 보드가 없습니다.
        </div>
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
      )}
    </div>
  );
};

export default TaskDetails;
