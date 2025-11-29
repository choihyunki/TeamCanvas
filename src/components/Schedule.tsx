import React, { useState } from "react";
import { Task } from "../types/Task";
import "../styles/Schedule.css"; // CSS import

interface Props {
  tasks: Task[];
  onUpdateTask: (updatedTask: Task) => void;
}

const Schedule: React.FC<Props> = ({ tasks, onUpdateTask }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState("");

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const handleSaveDate = () => {
    if (!selectedTask) return;

    const updated: Task = {
      ...selectedTask,
      dueDate: newDueDate,
    };

    onUpdateTask(updated);
    alert("마감일이 저장되었습니다!");
  };

  return (
    <div className="schedule-container">
      <h2 className="schedule-title">작업 일정 관리</h2>

      <div className="schedule-layout">
        {/* 왼쪽 - 작업 목록 */}
        <div className="schedule-list-panel">
          <h3>작업 목록</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.length === 0 && <p>아직 등록된 작업이 없습니다.</p>}

            {tasks.map((t) => (
              <li
                key={t.id}
                onClick={() => {
                  setSelectedTaskId(t.id);
                  setNewDueDate(t.dueDate || "");
                }}
                className={`schedule-task-item ${
                  selectedTaskId === t.id ? "selected" : ""
                }`}
              >
                <strong>{t.title}</strong>
                <div className="task-meta">마감일: {t.dueDate || "없음"}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* 오른쪽 - 상세 일정 설정 */}
        <div className="schedule-detail-panel">
          <h3>작업 상세</h3>

          {selectedTask ? (
            <div>
              <h4 style={{ marginBottom: 10 }}>{selectedTask.title}</h4>

              <label>마감일 설정:</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="date-input"
              />

              <button onClick={handleSaveDate} className="date-save-btn">
                저장
              </button>

              <hr className="divider" />

              <p>현재 마감일: {selectedTask.dueDate || "없음"}</p>
            </div>
          ) : (
            <p style={{ color: "#aaa" }}>왼쪽에서 작업을 선택하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
