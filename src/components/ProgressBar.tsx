// src/components/ProgressBar.tsx

import React, { useMemo } from "react";
import { Task } from "../types/Task";
import "../styles/ProgressBar.css"; // CSS import

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
    <div className="progress-container">
      <h3 className="progress-title">프로젝트 진행률</h3>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percent}%` }} // 동적 값은 인라인 유지
        />
      </div>

      <div className="progress-text">
        {completed} / {total} 완료 ({percent}%)
      </div>
    </div>
  );
};

export default ProgressBar;
