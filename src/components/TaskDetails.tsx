import React, { useState, useEffect, useRef } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
import "../styles/TaskDetails.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[];
  selectedTaskId: number | null;
  onUpdateTask?: (updatedTask: Task) => void;

  // 서브 태스크 핸들러
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

const STATUS_OPTIONS = [
  { value: "TODO", label: "할 일", color: "#6b7280", bg: "#f3f4f6" },
  { value: "IN_PROGRESS", label: "진행중", color: "#ffffff", bg: "#3B82F6" },
  { value: "DONE", label: "완료", color: "#ffffff", bg: "#10b981" },
  { value: "DROP", label: "Drop", color: "#ffffff", bg: "#374151" },
  { value: "PASS", label: "Pass", color: "#ffffff", bg: "#8b5cf6" },
];

const TaskDetails: React.FC<Props> = ({
  columns,
  members,
  tasks,
  selectedTaskId,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}) => {
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const taskRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selectedTaskId !== null && taskRefs.current[selectedTaskId]) {
      taskRefs.current[selectedTaskId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedTaskId]);

  const handleInputChange = (taskId: number, memberId: number, val: string) => {
    setInputs((prev) => ({ ...prev, [`${taskId}-${memberId}`]: val }));
  };

  const handleAdd = (columnId: number, memberId: number, taskId: number) => {
    const key = `${taskId}-${memberId}`;
    if (!inputs[key]?.trim()) return;

    onAddSubTask(columnId, memberId, inputs[key]);
    setInputs((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div className="task-details-wrapper">
      <h2 className="page-title">📑 전체 세부 작업 목록</h2>

      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.columnId === col.id);

        if (colTasks.length === 0) return null;

        return (
          <div key={col.id} className="role-section">
            <h3 className="role-title">Result : {col.name}</h3>

            {colTasks.map((task) => {
              const isSelected = task.id === selectedTaskId;

              // 🔥 [수정됨] 로직 변경
              // "역할 멤버" 기준(X) -> "태스크에 할당된 이름" 기준(O)
              // 이렇게 해야 역할에 없더라도 태스크에 이름이 있으면 화면에 뜹니다.
              const assignedProjectMembers = task.members
                .map((memberName) => {
                  // 1. 전체 멤버 목록에서 정보 찾기
                  const globalMember = members.find((m) => m.name === memberName);
                  if (!globalMember) return null;

                  // 2. 현재 역할(Column)에 이 멤버가 등록되어 있는지 확인 (SubTask 데이터를 가져오기 위해)
                  const existingProjectMember = col.members.find(
                    (pm) => pm.id === globalMember.id
                  );

                  // 3. 역할에 등록된 멤버라면 그대로 사용, 아니라면(외부 인원) 임시 객체 생성
                  if (existingProjectMember) {
                    return existingProjectMember;
                  } else {
                    return {
                      id: globalMember.id,
                      name: globalMember.name, // 이름 표시용
                      subTasks: [], // 아직 역할에 없으므로 빈 배열
                      // 필요한 경우 status나 memo 등 기본값 추가 가능
                    };
                  }
                })
                .filter((item) => item !== null) as any[]; 
                // any[] 로 처리하여 기존 타입 호환성 문제 방지 (ProjectMember 타입 구조에 따라)

              return (
                <div
                  key={task.id}
                  ref={(el) => {
                    taskRefs.current[task.id] = el;
                  }}
                  className={`task-item-container ${
                    isSelected ? "highlighted-task" : ""
                  }`}
                >
                  <div className="task-header">
                    <span className="task-header-title">{task.title}</span>
                    <span
                      className={`task-status-badge status-${task.status}`}
                    >
                      {STATUS_OPTIONS.find((o) => o.value === task.status)
                        ?.label || task.status}
                    </span>
                  </div>

                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: "15%" }}>작업자</th>
                          <th style={{ width: "50%" }}>작업내용</th>
                          <th style={{ width: "20%" }}>진행상태</th>
                          <th style={{ width: "15%" }}>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedProjectMembers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="no-members">
                              할당된 멤버가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          assignedProjectMembers.map((pm) => {
                            // pm은 위에서 찾은 멤버 객체
                            const globalMember = members.find(
                              (m) => m.id === pm.id
                            );
                            // 이름이 없는 경우 대비
                            const memberName = globalMember?.name || pm.name; 
                            const subTasks = pm.subTasks || [];

                            return (
                              <React.Fragment key={pm.id}>
                                <tr className="member-header-row">
                                  <td
                                    rowSpan={subTasks.length + 2}
                                    className="member-cell"
                                  >
                                    <div className="member-badge">
                                      {memberName}
                                    </div>
                                    {/* 역할에 없는 멤버일 경우 안내 메시지 띄울 수 있음 (선택사항) */}
                                    {/* {!globalMember && <small style={{display:'block', fontSize:'10px', color:'red'}}>(미등록)</small>} */}
                                  </td>
                                </tr>

                                {subTasks.map((st: any) => {
                                  const currentStatus = st.completed
                                    ? "DONE"
                                    : "TODO";
                                  return (
                                    <tr key={st.id} className="task-row">
                                      <td className="content-cell">
                                        {st.content}
                                      </td>
                                      <td className="status-cell">
                                        <select
                                          className="status-select"
                                          value={currentStatus}
                                          onChange={() =>
                                            onToggleSubTask(
                                              col.id,
                                              pm.id,
                                              st.id
                                            )
                                          }
                                          style={{
                                            backgroundColor: st.completed
                                              ? "#10b981"
                                              : "#6b7280",
                                            color: "white",
                                          }}
                                        >
                                          {STATUS_OPTIONS.map((opt) => (
                                            <option
                                              key={opt.value}
                                              value={opt.value}
                                              style={{
                                                color: "black",
                                                background: "white",
                                              }}
                                            >
                                              {opt.label}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                      <td className="action-cell">
                                        <button
                                          className="delete-btn"
                                          onClick={() =>
                                            onDeleteSubTask(
                                              col.id,
                                              pm.id,
                                              st.id
                                            )
                                          }
                                        >
                                          삭제
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}

                                <tr className="input-row">
                                  <td colSpan={3}>
                                    <div className="input-group">
                                      <input
                                        type="text"
                                        placeholder={`${memberName}의 작업 추가...`}
                                        value={
                                          inputs[`${task.id}-${pm.id}`] || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            task.id,
                                            pm.id,
                                            e.target.value
                                          )
                                        }
                                        onKeyDown={(e) =>
                                          e.key === "Enter" &&
                                          handleAdd(col.id, pm.id, task.id)
                                        }
                                      />
                                      <button
                                        onClick={() =>
                                          handleAdd(col.id, pm.id, task.id)
                                        }
                                      >
                                        추가
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {tasks.length === 0 && (
        <div className="empty-msg">등록된 작업이 없습니다.</div>
      )}
    </div>
  );
};

export default TaskDetails;