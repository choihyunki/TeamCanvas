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
    onAddSubTask(taskId, memberId, inputs[key]); // 🔥 columnId 대신 taskId를 넘김 (함수 시그니처 변경 필요 시 체크)
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

              // 🔥 [핵심 변경] task 안에 있는 subTaskInfos에서 내 데이터를 찾음
              const getSubTasksForMember = (memId: string): SubTaskItem[] => {
                const info = task.subTaskInfos?.find(
                  (info) => String(info.memberId) === String(memId)
                );
                return info ? info.items : [];
              };

              const assignedProjectMembers = task.members
                .map((memberName) => {
                  // 1. 전역 멤버 리스트에서 정보 찾기
                  const globalMember = members.find(
                    (m) => m.name === memberName || m.username === memberName
                  );
                  if (!globalMember) return null;

                  // 2. 현재 컬럼에 소속되어 있는지 확인 (권한 체크용)
                  const isInColumn = col.members.some(
                    (m) => String(m.id) === String(globalMember.id)
                  );

                  return {
                    id: String(globalMember.id),
                    name: globalMember.name,
                    // 🔥 기존 col.members에서 가져오던 걸 task 내부 데이터로 변경
                    subTasks: getSubTasksForMember(String(globalMember.id)),
                    isNotInColumn: !isInColumn, // 컬럼에 없으면 편집 불가
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
                  {/* ... (Header 영역 기존 유지) ... */}
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
                            // 🔥 컬럼에 소속되지 않았으면 입력 불가
                            const canManageSubTasks = !pm.isNotInColumn;
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
                                      {canManageSubTasks ? (
                                        <select
                                          className={`status-select ${
                                            st.completed ? "DONE" : "TODO"
                                          }`}
                                          value={st.completed ? "DONE" : "TODO"}
                                          // 🔥 인자 변경: columnId 제거 -> taskId, memberId, subTaskId 사용
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
                                      ) : (
                                        <span
                                          className={`status-select ${
                                            st.completed ? "DONE" : "TODO"
                                          }`}
                                        >
                                          {
                                            STATUS_OPTIONS.find(
                                              (o) =>
                                                o.value ===
                                                (st.completed ? "DONE" : "TODO")
                                            )?.label
                                          }
                                        </span>
                                      )}
                                    </td>
                                    <td className="action-cell">
                                      {canManageSubTasks && (
                                        <button
                                          className="delete-btn"
                                          // 🔥 인자 변경
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
                                      )}
                                    </td>
                                  </tr>
                                ))}

                                <tr className="input-row">
                                  <td colSpan={3}>
                                    <div className="input-group">
                                      <input
                                        type="text"
                                        placeholder={
                                          canManageSubTasks
                                            ? `${pm.name}의 작업 추가...`
                                            : "해당 역할에 소속되지 않음"
                                        }
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
                                          // 🔥 인자 변경: columnId는 이제 필요없음 (task 안에 저장하니까)
                                          // 하지만 Props 구조 유지를 위해 임시로 col.id를 넣거나
                                          // Project.tsx에서 핸들러 시그니처를 바꾸는 게 좋음.
                                          // 여기선 Project.tsx도 바꿀 것이므로 taskId를 넘깁니다.
                                          onAddSubTask(
                                            task.id,
                                            memberId,
                                            inputs[`${task.id}-${memberId}`]
                                          )
                                        }
                                        disabled={!canManageSubTasks}
                                      />
                                      <button
                                        onClick={() =>
                                          canManageSubTasks &&
                                          onAddSubTask(
                                            task.id,
                                            memberId,
                                            inputs[`${task.id}-${memberId}`]
                                          )
                                        }
                                        disabled={!canManageSubTasks}
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
      {/* ... */}
    </div>
  );
};

export default TaskDetails;
