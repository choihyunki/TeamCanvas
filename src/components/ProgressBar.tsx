// src/components/ProgressBar.tsx

import React, { useMemo } from "react";
import { Task } from "../types/Task";

interface Props {
  tasks: Task[];
}

const ProgressBar: React.FC<Props> = ({ tasks }) => {
  // 🔥 완료된 작업 개수 계산
  const { completed, total, percent } = useMemo(() => {
    const total = tasks.length;
    if (total === 0) {
      return { completed: 0, total: 0, percent: 0 };
    }

    // Task.status === "완료" 로 간주 (원하면 바꿀 수 있음)
    const completedTasks = tasks.filter((t) => t.status === "완료").length;
    const percent = Math.round((completedTasks / total) * 100);

    return {
      completed: completedTasks,
      total,
      percent,
    };
  }, [tasks]);

  return (
    <div style={{ padding: "15px" }}>
      <h3 style={{ marginBottom: 10 }}>프로젝트 진행률</h3>

      <div
        style={{
          width: "100%",
          height: "14px",
          borderRadius: "7px",
          background: "#e5e7eb",
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "#4f46e5",
            transition: "0.3s",
          }}
        />
      </div>

      <div style={{ fontSize: 14, color: "#4b5563" }}>
        {completed} / {total} 완료 ({percent}%)
      </div>
    </div>
  );
};

export default ProgressBar;
