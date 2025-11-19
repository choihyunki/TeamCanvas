// src/components/TaskDetails.tsx

import React, { useEffect, useState } from "react";
import { Member } from "../types/Member";
import { Task } from "../types/Task";
import { RoleColumn } from "../types/Project";

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

  // 선택된 작업이 바뀔 때마다 로컬 상태 동기화
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
      <div style={{ padding: 20 }}>
        <h2>세부 작업 내용</h2>
        <p>선택된 작업이 없습니다.</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ padding: 20 }}>
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
    <div style={{ padding: "20px", overflowY: "auto" }}>
      <h2 style={{ marginBottom: "15px" }}>세부 작업 내용</h2>

      {/* 작업 제목 */}
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 5 }}>작업 제목</h3>
        <div
          style={{
            padding: "10px",
            borderRadius: 6,
            border: "1px solid #ddd",
            background: "#fff",
            fontWeight: "bold",
          }}
        >
          {task.title}
        </div>
      </section>

      {/* 역할 / 칼럼 */}
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 5 }}>담당 역할</h3>
        <div
          style={{
            padding: "8px",
            borderRadius: 6,
            border: "1px solid #ddd",
            background: "#f9fafb",
          }}
        >
          {taskColumn ? taskColumn.name : "역할 없음"}
        </div>
      </section>

      {/* 상태 */}
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 5 }}>작업 상태</h3>
        <select
          value={localStatus}
          onChange={(e) => setLocalStatus(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: 6,
            border: "1px solid #ddd",
            minWidth: "160px",
          }}
        >
          <option value="">상태 선택</option>
          <option value="대기">대기</option>
          <option value="진행중">진행중</option>
          <option value="완료">완료</option>
        </select>
      </section>

      {/* 참여중인 멤버 */}
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 5 }}>참여중인 멤버</h3>

        {task.members.length === 0 ? (
          <p style={{ color: "#6b7280" }}>아직 참여한 멤버가 없습니다.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {task.members.map((name) => (
              <span
                key={name}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#e0e7ff",
                  color: "#4f46e5",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {name}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleAddMember}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            background: "#4f46e5",
            color: "white",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          + 참여 멤버 추가
        </button>
      </section>

      {/* 설명 */}
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 5 }}>작업 설명</h3>
        <textarea
          value={localDescription}
          onChange={(e) => setLocalDescription(e.target.value)}
          placeholder="작업 설명을 입력하세요."
          style={{
            width: "100%",
            minHeight: 100,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ddd",
            resize: "vertical",
          }}
        />
      </section>

      {/* 메모 */}
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 5 }}>추가 메모</h3>
        <textarea
          value={localMemo}
          onChange={(e) => setLocalMemo(e.target.value)}
          placeholder="간단한 메모를 남길 수 있습니다."
          style={{
            width: "100%",
            minHeight: 80,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ddd",
            resize: "vertical",
          }}
        />
      </section>

      <button
        onClick={handleSaveDescription}
        style={{
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
          background: "#10b981",
          color: "white",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        변경사항 저장
      </button>
    </div>
  );
};

export default TaskDetails;
