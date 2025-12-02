import React, { useState, useEffect, useRef } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
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
    onAddSubTask(columnId, memberId, inputs[key]);
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

              const assignedProjectMembers = task.members
                .map((memberName) => {
                  const globalMember = members.find(
                    (m) => m.name === memberName
                  );
                  if (!globalMember) return null;

                  // 1. 현재 컬럼에 이 멤버가 있는지 확인
                  const existingProjectMember = col.members.find(
                    (pm) => String(pm.id) === String(globalMember.id)
                  );

                  // 🔥 [핵심 수정] 기존 멤버가 있으면 그 데이터를 그대로 씁니다. (덮어쓰기 X)
                  if (existingProjectMember) {
                    return {
                      ...existingProjectMember,
                      // subTasks가 없으면 빈 배열로 초기화
                      subTasks: existingProjectMember.subTasks || [],
                      isNotInColumn: false,
                    };
                  } else {
                    // 현재 컬럼에 없으면, 다른 컬럼에서 정보를 가져와서 보여줌 (읽기 전용)
                    let subTasksToDisplay: any[] = [];
                    for (const otherCol of columns) {
                      const foundMember = otherCol.members.find(
                        (pm) => String(pm.id) === String(globalMember.id)
                      );
                      if (
                        foundMember &&
                        foundMember.subTasks &&
                        foundMember.subTasks.length > 0
                      ) {
                        subTasksToDisplay = foundMember.subTasks;
                        break;
                      }
                    }

                    return {
                      id: String(globalMember.id),
                      name: globalMember.name,
                      subTasks: subTasksToDisplay,
                      isNotInColumn: false,
                    };
                  }
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
                            const canManageSubTasks = !pm.isNotInColumn;
                            const memberId = String(pm.id); // ID 통일

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
                                        {canManageSubTasks ? (
                                          <select
                                            className={`status-select ${currentStatus}`}
                                            value={currentStatus}
                                            onChange={() =>
                                              onToggleSubTask(
                                                col.id,
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
                                        ) : (
                                          <span
                                            className={`status-select ${currentStatus}`}
                                          >
                                            {
                                              STATUS_OPTIONS.find(
                                                (o) => o.value === currentStatus
                                              )?.label
                                            }
                                          </span>
                                        )}
                                      </td>
                                      <td className="action-cell">
                                        {canManageSubTasks && (
                                          <button
                                            className="delete-btn"
                                            onClick={() =>
                                              onDeleteSubTask(
                                                col.id,
                                                memberId,
                                                st.id
                                              )
                                            }
                                          >
                                            삭제
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}

                                <tr className="input-row">
                                  <td colSpan={3}>
                                    <div className="input-group">
                                      <input
                                        type="text"
                                        placeholder={`${pm.name}의 작업 추가`}
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
                                          canManageSubTasks &&
                                          handleAdd(col.id, task.id, memberId)
                                        }
                                      />
                                      <button
                                        onClick={() =>
                                          canManageSubTasks &&
                                          handleAdd(col.id, task.id, memberId)
                                        }
                                        disabled={!canManageSubTasks}
                                        title={
                                          !canManageSubTasks
                                            ? "역할에 멤버를 등록해야 추가 가능"
                                            : "작업 추가"
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
