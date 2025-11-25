import React, { useMemo } from "react";
import { Task } from "../types/Task";
import "../styles/ProgressBar.css";

interface Props {
  tasks: Task[];
}

const ProgressBar: React.FC<Props> = ({ tasks }) => {
  const { completed, total, percent } = useMemo(() => {
    const total = tasks.length;
    if (total === 0) {
      return { completed: 0, total: 0, percent: 0 };
    }

    const completedTasks = tasks.filter((t) => t.status === "DONE").length;
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
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="progress-text">
        {completed} / {total} 완료 ({percent}%)
      </div>
    </div>
  );
};

export default ProgressBar;