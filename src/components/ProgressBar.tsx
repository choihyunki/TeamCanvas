import React, { useMemo } from "react";
import { Task } from "../types/Task";
import "../styles/ProgressBar.css";

interface Props {
  tasks: Task[];
}

const ProgressBar: React.FC<Props> = ({ tasks }) => {
  const { completed, total, percent } = useMemo(() => {
    // 1. 전체 목표: 오직 '메인 태스크'의 개수만 기준 (세부 작업 추가해도 안 늘어남)
    const totalCount = tasks.length;

    if (totalCount === 0) {
      return { completed: 0, total: 0, percent: 0 };
    }

    // 2. 완료 성과: 오직 'DONE(완료)' 상태인 태스크만 인정
    // (대기 상태에서 세부 작업을 아무리 체크해도 메인 카드를 안 옮기면 인정 X)
    const doneCount = tasks.filter((t) => t.status === "DONE").length;

    const percent = Math.round((doneCount / totalCount) * 100);

    return {
      completed: doneCount,
      total: totalCount,
      percent,
    };
  }, [tasks]);

  return (
    <div className="progress-container">
      <h3 className="progress-title">프로젝트 진행률</h3>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="progress-text">
        {completed} / {total} 완료 ({percent}%)
      </div>
    </div>
  );
};

export default ProgressBar;
