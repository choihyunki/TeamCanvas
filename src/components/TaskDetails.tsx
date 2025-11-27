import React, { useState, useEffect } from "react";
import { Member } from "../types/Member";
import { RoleColumn, SubTask } from "../types/Project";
import { Task } from "../types/Task";
import "../styles/TaskDetails.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[];
  selectedTaskId: number | null;
  onUpdateTask?: (updatedTask: Task) => void; // (사용 안 함, 에러 방지용)

  // 서브 태스크 핸들러
  onAddSubTask: (columnId: number, memberId: number, content: string) => void;
  onToggleSubTask: (columnId: number, memberId: number, subTaskId: number) => void;
  onDeleteSubTask: (columnId: number, memberId: number, subTaskId: number) => void;
}

// 🔥 [디자인 반영] 진행 상태 옵션 (색상 포함)
const STATUS_OPTIONS = [
  { value: "TODO", label: "할 일", color: "#6b7280", bg: "#f3f4f6" }, // 회색
  { value: "IN_PROGRESS", label: "진행중", color: "#ffffff", bg: "#3B82F6" }, // 파랑
  { value: "DONE", label: "완료", color: "#ffffff", bg: "#10b981" }, // 초록
  { value: "DROP", label: "Drop", color: "#ffffff", bg: "#374151" }, // 진한 회색
  { value: "PASS", label: "Pass", color: "#ffffff", bg: "#8b5cf6" }, // 보라색
];

const TaskDetails: React.FC<Props> = ({
  columns,
  members,
  tasks,
  selectedTaskId,
  onAddSubTask,
  onToggleSubTask, // 여기서는 상태 변경용으로 사용
  onDeleteSubTask,
}) => {
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  
  // 입력창 상태 (멤버 ID별)
  const [inputs, setInputs] = useState<{ [key: number]: string }>({});

  if (!selectedTask) {
    return <div className="empty-msg">작업을 선택해주세요.</div>;
  }

  // 현재 Task가 속한 컬럼(Role) 찾기
  const currentColumn = columns.find((c) => c.id === selectedTask.columnId);

  // 🔥 [핵심 수정] 할당된 멤버 필터링 로직 강화
  // 1. 현재 컬럼에 속한 멤버들 중에서
  // 2. Task에 할당된 멤버 이름 리스트에 포함된 사람만 필터링
  const assignedProjectMembers = currentColumn
    ? currentColumn.members.filter((pm) => {
        const globalMember = members.find((m) => m.id === pm.id);
        return globalMember && selectedTask.members.includes(globalMember.name);
      })
    : [];

  const handleInputChange = (id: number, val: string) => {
    setInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleAdd = (memberId: number) => {
    if (!inputs[memberId]?.trim()) return;
    if (currentColumn) {
      onAddSubTask(currentColumn.id, memberId, inputs[memberId]);
      setInputs((prev) => ({ ...prev, [memberId]: "" }));
    }
  };

  return (
    <div className="task-details-wrapper">
      <h2 className="details-title">
        📄 {selectedTask.title} <span className="sub-title">(세부 작업 관리)</span>
      </h2>

      {/* 테이블 영역 */}
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
                  이 작업에 할당된 멤버가 없습니다. <br />
                  (TaskBoard에서 멤버를 드래그하여 추가하세요)
                </td>
              </tr>
            ) : (
              assignedProjectMembers.map((pm) => {
                const globalMember = members.find((m) => m.id === pm.id);
                const subTasks = pm.subTasks || [];

                return (
                  <React.Fragment key={pm.id}>
                    {/* 1. 멤버 이름 행 (작업자가 누군지 표시) */}
                    <tr className="member-header-row">
                      <td rowSpan={subTasks.length + 2} className="member-cell">
                        <div className="member-badge">
                          {globalMember?.name}
                        </div>
                      </td>
                    </tr>

                    {/* 2. 기존 서브 태스크 리스트 */}
                    {subTasks.map((st) => {
                      // completed 상태에 따라 스타일 결정
                      const currentStatus = st.completed ? "DONE" : "TODO"; // 임시 로직 (DB에 status 필드 추가 권장)
                      const statusStyle = STATUS_OPTIONS.find(o => o.value === currentStatus) || STATUS_OPTIONS[0];

                      return (
                        <tr key={st.id} className="task-row">
                          <td className="content-cell">{st.content}</td>
                          <td className="status-cell">
                            {/* 🔥 상태 변경 드롭다운 (뱃지 스타일) */}
                            <select
                              className="status-select"
                              value={st.completed ? "DONE" : "TODO"}
                              onChange={() => {
                                // 현재 API 한계로 토글만 호출 (실제로는 status update 호출 필요)
                                if (currentColumn) {
                                    onToggleSubTask(currentColumn.id, pm.id, st.id);
                                }
                              }}
                              style={{
                                backgroundColor: st.completed ? "#10b981" : "#6b7280",
                                color: "white",
                              }}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} style={{ color: 'black', background: 'white' }}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="action-cell">
                            <button
                              className="delete-btn"
                              onClick={() =>
                                currentColumn && onDeleteSubTask(currentColumn.id, pm.id, st.id)
                              }
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* 3. 작업 추가 입력 행 */}
                    <tr className="input-row">
                        <td colSpan={3}>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    placeholder={`${globalMember?.name}의 작업 추가...`}
                                    value={inputs[pm.id] || ""}
                                    onChange={(e) => handleInputChange(pm.id, e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAdd(pm.id)}
                                />
                                <button onClick={() => handleAdd(pm.id)}>추가</button>
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
};

export default TaskDetails;