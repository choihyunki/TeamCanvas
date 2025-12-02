import React, { useMemo } from "react";
import { Task } from "../types/Task";
import "../styles/ProgressBar.css";

interface Props {
  tasks: Task[];
}

const ProgressBar: React.FC<Props> = ({ tasks }) => {
  const { completed, total, percent } = useMemo(() => {
    let totalCount = 0;
    let doneCount = 0;

    tasks.forEach((task) => {
      // 1. 해당 태스크 안에 세부 작업(SubTask)이 있는지 확인
      const subInfos = task.subTaskInfos || [];
      let hasSubTasks = false;
      let taskSubTotal = 0;
      let taskSubDone = 0;

      subInfos.forEach((info) => {
        if (info.items && info.items.length > 0) {
          hasSubTasks = true;
          info.items.forEach((item) => {
            taskSubTotal++;
            if (item.completed) taskSubDone++;
          });
        }
      });

      if (hasSubTasks) {
        // A. 세부 작업이 있으면 -> 세부 작업의 개수를 반영
        totalCount += taskSubTotal;
        doneCount += taskSubDone;
      } else {
        // B. 세부 작업이 없으면 -> 메인 태스크 카드 자체의 상태(DONE)만 반영
        totalCount++;
        if (task.status === "DONE") {
          doneCount++;
        }
      }
    });

    if (totalCount === 0) {
      return { completed: 0, total: 0, percent: 0 };
    }

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
