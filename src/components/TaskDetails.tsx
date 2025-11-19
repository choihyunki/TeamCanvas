import React, { useEffect, useState } from "react";
import { Member } from "../types/Member";
import { Task } from "../types/Task";
import { RoleColumn } from "../types/Project";
import "../styles/TaskDetails.css"; // CSS import

interface Props {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[];
  selectedTaskId: number | null;
  onUpdateTask: (updatedTask: Task) => void;
}

const TaskDetails: React.FC<Props> = ({
  columns,
  members,
  tasks,
  selectedTaskId,
  onUpdateTask,
}) => {
  const [localDescription, setLocalDescription] = useState("");
  const [localStatus, setLocalStatus] = useState<string>("");
  const [localMemo, setLocalMemo] = useState("");

  const task = tasks.find((t) => t.id === selectedTaskId) || null;
  const taskColumn = task ? columns.find((c) => c.id === task.columnId) : null;

  useEffect(() => {
    if (!task) {
      setLocalDescription("");
      setLocalStatus("");
      setLocalMemo("");
      return;
    }
    setLocalDescription(task.description || "");
    setLocalStatus(task.status || "");
    setLocalMemo(task.memo || "");
  }, [task]);

  if (!selectedTaskId) {
    return (
      <div className="task-details-container">
        <h2 className="task-details-title">세부 작업 내용</h2>
        <p className="empty-message">선택된 작업이 없습니다.</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-details-container">
        <h2>작업을 찾을 수 없습니다.</h2>
      </div>
    );
  }

  const handleAddMember = () => {
    const name = prompt(
      "참여자로 추가할 멤버를 입력하거나 선택하세요:\n" +
        members.map((m) => `${m.name}`).join("\n")
    );
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    if (task.members.includes(trimmed)) {
      alert("이미 참여중인 멤버입니다.");
      return;
    }

    if (!window.confirm(`${trimmed}님을 이 작업에 참여시키겠습니까?`)) return;

    const updated: Task = {
      ...task,
      members: [...task.members, trimmed],
    };
    onUpdateTask(updated);
  };

  const handleSaveDescription = () => {
    const updated: Task = {
      ...task,
      description: localDescription,
      status: localStatus,
      memo: localMemo,
    };
    onUpdateTask(updated);
    alert("작업 정보가 저장되었습니다.");
  };

  return (
    <div className="task-details-container">
      <h2 className="task-details-title">세부 작업 내용</h2>

      {/* 작업 제목 */}
      <section className="details-section">
        <h3 className="section-label">작업 제목</h3>
        <div className="info-box">{task.title}</div>
      </section>

      {/* 해당 역할 */}
      <section className="details-section">
        <h3 className="section-label">해당 역할</h3>
        <div className="role-box">{taskColumn ? taskColumn.name : "없음"}</div>
      </section>

      {/* 참여 멤버 */}
      <section className="details-section">
        <h3 className="section-label">참여중인 멤버</h3>
        {task.members.length === 0 ? (
          <p className="empty-message" style={{ padding: 0 }}>
            아직 참여한 멤버가 없습니다.
          </p>
        ) : (
          <div className="member-list-wrapper">
            {task.members.map((name) => (
              <span key={name} className="member-tag">
                {name}
              </span>
            ))}
          </div>
        )}
        <button onClick={handleAddMember} className="add-member-btn">
          + 참여 멤버 추가
        </button>
      </section>

      {/* 설명 */}
      <section className="details-section">
        <h3 className="section-label">작업 설명</h3>
        <textarea
          className="description-area"
          value={localDescription}
          onChange={(e) => setLocalDescription(e.target.value)}
          placeholder="작업 설명을 입력하세요."
        />
      </section>

      {/* 메모 */}
      <section className="details-section">
        <h3 className="section-label">추가 메모</h3>
        <textarea
          className="memo-area"
          value={localMemo}
          onChange={(e) => setLocalMemo(e.target.value)}
          placeholder="간단한 메모를 남길 수 있습니다."
        />
      </section>

      <button onClick={handleSaveDescription} className="save-btn">
        변경사항 저장
      </button>
    </div>
  );
};

export default TaskDetails;
