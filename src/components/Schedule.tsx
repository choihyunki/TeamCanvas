import React, { useState } from 'react';

// --- 타입 정의 ---
interface Task {
  id: number;
  name: string;
  start: Date;
  end: Date;
  color: string;
}

// --- 컴포넌트 ---
const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // ⭐️ 임시 데이터: 실제로는 props나 API를 통해 받아와야 합니다.
  const [tasks] = useState<Task[]>([
    { id: 1, name: "로그인 UI 구현", start: new Date(2025, 9, 2), end: new Date(2025, 9, 7), color: '#81c784' },
    { id: 2, name: "API 엔드포인트 작성", start: new Date(2025, 9, 6), end: new Date(2025, 9, 12), color: '#64b5f6' },
    { id: 3, name: "데이터베이스 설계", start: new Date(2025, 9, 10), end: new Date(2025, 9, 15), color: '#ffb74d' },
    { id: 4, name: "프로젝트 로고 디자인", start: new Date(2025, 9, 16), end: new Date(2025, 9, 20), color: '#ba68c8' },
    { id: 5, name: "QA 및 버그 수정", start: new Date(2025, 9, 22), end: new Date(2025, 9, 28), color: '#e57373' },
  ]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // --- 이벤트 핸들러 ---
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // --- 렌더링 함수 ---
  const renderTimelineGrid = () => {
    const dayHeaders = [];
    for (let day = 1; day <= daysInMonth; day++) {
      dayHeaders.push(
        <div key={day} style={{ flex: '1 0 40px', textAlign: 'center', padding: '10px 0', borderRight: '1px solid #eee', boxSizing: 'border-box' }}>
          {day}
        </div>
      );
    }
    return dayHeaders;
  };

  const renderTaskBars = () => {
    return tasks.map(task => {
      // 현재 월에 해당하는 작업만 필터링
      if (task.start.getMonth() !== month && task.end.getMonth() !== month) {
        return null;
      }

      const startDay = task.start.getMonth() === month ? task.start.getDate() : 1;
      const endDay = task.end.getMonth() === month ? task.end.getDate() : daysInMonth;

      const duration = endDay - startDay + 1;
      const left = ((startDay - 1) / daysInMonth) * 100;
      const width = (duration / daysInMonth) * 100;

      return (
        <div key={task.id} style={{ position: 'relative', height: '50px', borderBottom: '1px solid #eee' }}>
          <div
            title={`${task.name}: ${task.start.toLocaleDateString()} ~ ${task.end.toLocaleDateString()}`}
            style={{
              position: 'absolute',
              top: '10px',
              left: `${left}%`,
              width: `${width}%`,
              height: '30px',
              background: task.color,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '10px',
              boxSizing: 'border-box',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            }}
          >
            {task.name}
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>작업 일정 (타임라인)</h2>

      {/* 컨트롤러 (이전/다음 달) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
        <button onClick={goToPreviousMonth} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>
          이전 달
        </button>
        <h3 style={{ margin: 0 }}>
          {year}년 {month + 1}월
        </h3>
        <button onClick={goToNextMonth} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>
          다음 달
        </button>
      </div>

      {/* 타임라인 */}
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflowX: 'auto' }}>
        <div style={{ minWidth: `${daysInMonth * 40}px` }}>
          {/* 날짜 헤더 */}
          <div style={{ display: 'flex', background: '#f8f9fa', borderBottom: '1px solid #ccc' }}>
            {renderTimelineGrid()}
          </div>
          {/* 작업 바 */}
          <div>
            {renderTaskBars()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;