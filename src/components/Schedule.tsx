// src/components/Schedule.tsx

import React, { useState } from "react";
import { Task } from "../types/Task";

interface Props {
  tasks: Task[];
  onUpdateTask: (updatedTask: Task) => void;
}

const Schedule: React.FC<Props> = ({ tasks, onUpdateTask }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [newDueDate, setNewDueDate] = useState("");

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const handleSaveDate = () => {
    if (!selectedTask || !newDueDate) return;

    const updated: Task = {
      ...selectedTask,
      dueDate: newDueDate,
    };

    onUpdateTask(updated);
    alert("마감일이 저장되었습니다!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: 20 }}>작업 일정 관리</h2>

      {/* 작업 리스트 */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* 왼쪽 - 작업 목록 */}
        <div style={{ width: "40%" }}>
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
                style={{
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  marginBottom: "8px",
                  cursor: "pointer",
                  background: selectedTaskId === t.id ? "#eef2ff" : "white",
                }}
              >
                <strong>{t.title}</strong>
                <div style={{ fontSize: 13, color: "#555" }}>
                  마감일: {t.dueDate || "없음"}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 오른쪽 - 상세 일정 설정 */}
        <div style={{ width: "60%" }}>
          <h3>작업 상세</h3>

          {selectedTask ? (
            <div>
              <h4 style={{ marginBottom: 10 }}>{selectedTask.title}</h4>

              <label>마감일 설정:</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                style={{
                  marginLeft: "10px",
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />

              <button
                onClick={handleSaveDate}
                style={{
                  marginLeft: "12px",
                  padding: "8px 12px",
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                저장
              </button>

              <hr style={{ margin: "20px 0" }} />

              <p>현재 마감일: {selectedTask.dueDate || "없음"}</p>
            </div>
          ) : (
            <p>왼쪽에서 작업을 선택하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
