// src/components/TaskDetails.tsx

import React, { useState } from "react";
import { Member } from "../types/Member";
import { Task } from "../types/Task";
import { RoleColumn } from "../types/Project";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[];
  selectedTaskId: number | null;
}

const TaskDetails: React.FC<Props> = ({
  columns,
  members,
  tasks,
  selectedTaskId,
}) => {
  const [editDescription, setEditDescription] = useState("");

  if (selectedTaskId === null) {
    return (
      <div style={{ padding: 20 }}>
        <h2>세부 작업 내용</h2>
        <p>선택된 작업이 없습니다.</p>
      </div>
    );
  }

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) {
    return (
      <div style={{ padding: 20 }}>
        <h2>작업을 찾을 수 없습니다.</h2>
      </div>
    );
  }

  const taskColumn = columns.find((c) => c.id === task.columnId);

  const addMember = () => {
    const name = prompt(
      "참여자로 추가할 멤버 선택:\n" +
        members.map((m) => `${m.name}`).join("\n")
    );
    if (!name) return;
    if (task.members.includes(name)) {
      alert("이미 참여중인 멤버입니다.");
      return;
    }

    const confirmMsg = `${name}님을 이 작업에 참여시키겠습니까?`;
    if (!window.confirm(confirmMsg)) return;

    // 🔥 Task.members 업데이트
    task.members.push(name);

    alert("멤버가 추가되었습니다.");
  };

  const saveDescription = () => {
    task.description = editDescription;
    alert("설명이 저장되었습니다.");
  };

  return (
    <div style={{ padding: "20px", overflowY: "auto" }}>
      <h2 style={{ marginBottom: "15px" }}>세부 작업 내용</h2>

      <section style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 5 }}>작업 제목</h3>
        <div
          style={{
            padding: "10px",
            background: "#fff",
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {task.title}
        </div>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 5 }}>해당 역할</h3>
        <div
          style={{
            padding: 10,
            background: "#f9fafb",
            borderRadius: 6,
            border: "1px solid #ddd",
          }}
        >
          {taskColumn ? taskColumn.name : "없음"}
        </div>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 8 }}>참여중인 멤버</h3>

        {task.members.length === 0 ? (
          <p style={{ color: "#666" }}>아직 참여한 멤버가 없습니다.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {task.members.map((name) => (
              <span
                key={name}
                style={{
                  padding: "5px 10px",
                  background: "#e8eaff",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#4f46e5",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={addMember}
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          + 참여 멤버 추가
        </button>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 5 }}>작업 설명</h3>

        <textarea
          style={{
            width: "100%",
            minHeight: 120,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ddd",
            resize: "vertical",
          }}
          placeholder="작업 설명을 입력하세요..."
          defaultValue={task.description || ""}
          onChange={(e) => setEditDescription(e.target.value)}
        />

        <button
          onClick={saveDescription}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          설명 저장
        </button>
      </section>
    </div>
  );
};

export default TaskDetails;
