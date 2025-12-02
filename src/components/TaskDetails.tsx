import React, { useState, useEffect, useRef } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import { Task, SubTaskItem } from "../types/Task";
import "../styles/TaskDetails.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[];
  selectedTaskId: string | null;
  onUpdateTask?: (updatedTask: Task) => void;

  onAddSubTask: (columnId: string, memberId: string, content: string) => void;
  onToggleSubTask: (
    columnId: string,
    memberId: string,
    subTaskId: string
  ) => void;
  onDeleteSubTask: (
    columnId: string,
    memberId: string,
    subTaskId: string
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
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selectedTaskId !== null && taskRefs.current[selectedTaskId]) {
      taskRefs.current[selectedTaskId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedTaskId]);

  const handleInputChange = (taskId: string, memberId: string, val: string) => {
    setInputs((prev) => ({ ...prev, [`${taskId}-${memberId}`]: val }));
  };

  const handleAdd = (columnId: string, taskId: string, memberId: string) => {
    const key = `${taskId}-${memberId}`;
    if (!inputs[key]?.trim()) return;
    // 🔥 taskId를 넘깁니다. (Project.tsx 핸들러와 매칭)
    onAddSubTask(taskId, memberId, inputs[key]);
    setInputs((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div className="task-details-wrapper">
      <h2 className="page-title">📑 전체 세부 작업 목록</h2>

      {columns.map((col) => {
        const colTasks = tasks.filter(
          (t) => String(t.columnId) === String(col.id)
        );
        if (colTasks.length === 0) return null;

        return (
          <div key={col.id} className="role-section">
            <h3 className="role-title">Result : {col.name}</h3>

            {colTasks.map((task) => {
              const isSelected = task.id === selectedTaskId;

              const getSubTasksForMember = (memId: string): SubTaskItem[] => {
                const info = task.subTaskInfos?.find(
                  (info) => String(info.memberId) === String(memId)
                );
                return info ? info.items : [];
              };

              const assignedProjectMembers = task.members
                .map((memberName) => {
                  const globalMember = members.find(
                    (m) => m.name === memberName || m.username === memberName
                  );
                  if (!globalMember) return null;

                  // 🔥 [핵심 수정] 컬럼에 있든 없든, Task에 배정된 사람이면 무조건 보여주고 입력 허용!
                  // 기존에 존재 여부를 체크하던 로직을 제거하고 항상 데이터를 반환합니다.
                  return {
                    id: String(globalMember.id),
                    name: globalMember.name,
                    subTasks: getSubTasksForMember(String(globalMember.id)),
                    isNotInColumn: false, // 🔥 무조건 false로 설정하여 입력 잠금 해제
                  };
                })
                .filter((item) => item !== null) as any[];

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
                    <span className={`task-status-badge status-${task.status}`}>
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
                            const subTasks = pm.subTasks || [];
                            const canManageSubTasks = !pm.isNotInColumn; // 항상 true
                            const memberId = String(pm.id);
                            const rowCount = subTasks.length + 2;

                            return (
                              <React.Fragment key={pm.id}>
                                <tr className="member-header-row">
                                  <td
                                    rowSpan={rowCount}
                                    className="member-cell"
                                  >
                                    <div className="member-badge">
                                      {pm.name}
                                    </div>
                                  </td>
                                </tr>

                                {subTasks.map((st: any) => (
                                  <tr key={st.id} className="task-row">
                                    <td className="content-cell">
                                      {st.content}
                                    </td>
                                    <td className="status-cell">
                                      <select
                                        className={`status-select ${
                                          st.completed ? "DONE" : "TODO"
                                        }`}
                                        value={st.completed ? "DONE" : "TODO"}
                                        onChange={() =>
                                          onToggleSubTask(
                                            task.id,
                                            memberId,
                                            st.id
                                          )
                                        }
                                      >
                                        {STATUS_OPTIONS.map((opt) => (
                                          <option
                                            key={opt.value}
                                            value={opt.value}
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
                                            task.id,
                                            memberId,
                                            st.id
                                          )
                                        }
                                      >
                                        삭제
                                      </button>
                                    </td>
                                  </tr>
                                ))}

                                <tr className="input-row">
                                  <td colSpan={3}>
                                    <div className="input-group">
                                      <input
                                        type="text"
                                        placeholder={`${pm.name}의 작업 추가...`}
                                        value={
                                          inputs[`${task.id}-${memberId}`] || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            task.id,
                                            memberId,
                                            e.target.value
                                          )
                                        }
                                        onKeyDown={(e) =>
                                          e.key === "Enter" &&
                                          handleAdd(col.id, task.id, memberId)
                                        }
                                      />
                                      <button
                                        onClick={() =>
                                          handleAdd(col.id, task.id, memberId)
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
