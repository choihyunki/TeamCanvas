import React, { useState, useEffect, useMemo } from "react";
import { Task } from "../types/Task";
import "../styles/Schedule.css"; 

interface ScheduleTask extends Task {
    startDate?: string;
}

interface Props {
  tasks: ScheduleTask[];
  onUpdateTask: (updatedTask: ScheduleTask) => void;
}

const calculateChartStartDate = (tasks: ScheduleTask[]): Date => {
    let minDate: Date | null = null;
    
    tasks.forEach(task => {
        if (task.startDate) {
            const currentStart = new Date(task.startDate);
            if (!minDate || currentStart.getTime() < minDate.getTime()) {
                minDate = currentStart;
            }
        }
    });

    if (minDate) {
        // 🔥 [수정 핵심] minDate가 Date임을 타입 단언 (as Date)으로 보장
        const finalMinDate = minDate as Date;
        finalMinDate.setDate(finalMinDate.getDate() - 3); 
        return finalMinDate;
    }

    return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
};

const DAYS_PER_PIXEL = 20;

const Schedule: React.FC<Props> = ({ tasks, onUpdateTask }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState("");
  const [newStartDate, setNewStartDate] = useState(""); 

  const today = new Date().toISOString().split('T')[0];

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const chartStartDate = useMemo(() => calculateChartStartDate(tasks), [tasks]);

  const getDaysFromChartStart = (dateStr: string): number => {
      const date = new Date(dateStr);
      const diffTime = date.getTime() - chartStartDate.getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 3600 * 24)));
  };
  
  const handleSaveDate = () => {
    if (!selectedTask) return;

    const updated: ScheduleTask = {
      ...selectedTask,
      startDate: newStartDate, 
      dueDate: newDueDate,
    };

    onUpdateTask(updated);
    alert("일정이 저장되었습니다!");
  };
  
  const renderGanttBar = (task: ScheduleTask) => {
    if (!task.startDate || !task.dueDate) return null;
    
    const startDate = task.startDate;
    const dueDate = task.dueDate;

    const startDays = getDaysFromChartStart(startDate);
    const endDays = getDaysFromChartStart(dueDate);
    
    const durationDays = endDays - startDays + 1;
    
    const widthPx = durationDays * DAYS_PER_PIXEL;
    const leftOffsetPx = startDays * DAYS_PER_PIXEL;

    return (
      <div 
        className="gantt-bar" 
        style={{ 
            width: `${Math.max(20, widthPx)}px`, 
            left: `${150 + leftOffsetPx}px` 
        }}
      >
        {task.title}
      </div>
    );
  };

  const renderTimeAxis = () => {
    const maxDays = tasks.length > 0 
        ? tasks.reduce((max, t) => {
            if (t.dueDate) {
                const days = getDaysFromChartStart(t.dueDate);
                return Math.max(max, days);
            }
            return max;
        }, 0)
        : 10;
        
    const daysInView = Math.max(90, maxDays + 30);

    const markers = [];
    let currentDate = new Date(chartStartDate);
    
    for (let i = 0; i < daysInView; i++) {
        const dateString = currentDate.toISOString().split('T')[0];
        const isMonthStart = currentDate.getDate() === 1;

        markers.push(
            <div 
                key={dateString}
                className={`time-marker ${isMonthStart ? 'month-start' : ''}`}
                style={{ width: `${DAYS_PER_PIXEL}px` }}
            >
                {isMonthStart ? `${currentDate.getMonth() + 1}월` : '.'}
            </div>
        );
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return markers;
  };


  return (
    <div className="schedule-container">
      <h2 className="schedule-title">작업 일정 관리</h2>

      <div className="schedule-layout">
        
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
                  setNewStartDate(t.startDate || today); 
                }}
                className={`schedule-task-item ${
                  selectedTaskId === t.id ? "selected" : ""
                }`}
              >
                <strong>{t.title}</strong>
                <div className="task-meta">
                  일정: {t.startDate || "미지정"} ~ {t.dueDate || "미지정"}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="schedule-gantt-view">
            <h3>간트 차트 뷰</h3>
            <div className="gantt-time-axis" style={{ width: `${(tasks.length > 0 ? (tasks.reduce((max, t) => (t.dueDate && getDaysFromChartStart(t.dueDate) > max ? getDaysFromChartStart(t.dueDate) : max), 0) + 30) * DAYS_PER_PIXEL : 90 * DAYS_PER_PIXEL) + 150}px` }}>
                {renderTimeAxis()}
            </div>
            <div className="gantt-tasks-area">
                {tasks.map(t => (
                    <div key={t.id} className="gantt-task-row">
                        <div className="gantt-task-name">{t.title}</div>
                        {renderGanttBar(t)}
                    </div>
                ))}
            </div>
        </div>


        <div className="schedule-detail-panel">
          <h3>작업 상세</h3>

          {selectedTask ? (
            <div>
              <h4 style={{ marginBottom: 10 }}>{selectedTask.title}</h4>
              
              <label style={{ display: 'block' }}>시작일 설정:</label>
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="date-input"
              />

              <label style={{ marginTop: 10, display: 'block' }}>마감일 설정:</label>
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

              <p>현재 시작일: {selectedTask.startDate || "없음"}</p>
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