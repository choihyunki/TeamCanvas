import React, { useState } from 'react';

// --- 타입 정의 ---
interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface MemberTasks {
  [memberName: string]: Task[];
}

interface TasksByRole {
  [roleName: string]: MemberTasks;
}

// --- 컴포넌트 ---
const TaskDetails: React.FC = () => {
  const [tasksByRole, setTasksByRole] = useState<TasksByRole>({
    "프론트엔드 개발": {
      "홍길동": [
        { id: 1, text: "로그인 페이지 UI 컴포넌트 구현", completed: true },
        { id: 2, text: "상태 관리 라이브러리 연동", completed: false },
      ],
      "김민준": [
        { id: 3, text: "메인 대시보드 레이아웃 설계", completed: false },
      ]
    },
    "백엔드 개발": {
      "박서준": [
        { id: 4, text: "사용자 인증 API 엔드포인트 작성", completed: true },
      ]
    },
    "디자인": {
      "이지은": [
        { id: 5, text: "프로젝트 로고 시안 A, B, C 제작", completed: false },
      ]
    },
  });

  const [activeRole, setActiveRole] = useState(Object.keys(tasksByRole)[0]);
  const [newTaskTexts, setNewTaskTexts] = useState<{ [memberName: string]: string }>({});

  // --- 이벤트 핸들러 ---

  // 새 작업 추가
  const handleAddTask = (role: string, memberName: string) => {
    const taskText = newTaskTexts[memberName]?.trim();
    if (!taskText) return;

    const newTask: Task = {
      id: Date.now(),
      text: taskText,
      completed: false,
    };

    const updatedTasks = { ...tasksByRole };
    updatedTasks[role][memberName].push(newTask);
    setTasksByRole(updatedTasks);

    // 입력 필드 초기화
    setNewTaskTexts(prev => ({ ...prev, [memberName]: '' }));
  };

  // 작업 완료 토글
  const handleToggleTask = (role: string, memberName: string, taskId: number) => {
    const updatedTasks = { ...tasksByRole };
    const tasks = updatedTasks[role][memberName];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      setTasksByRole(updatedTasks);
    }
  };

  // 작업 삭제
  const handleDeleteTask = (role: string, memberName: string, taskId: number) => {
    if (window.confirm("이 작업을 삭제하시겠습니까?")) {
      const updatedTasks = { ...tasksByRole };
      updatedTasks[role][memberName] = updatedTasks[role][memberName].filter(t => t.id !== taskId);
      setTasksByRole(updatedTasks);
    }
  };


  const membersInRole = tasksByRole[activeRole] || {};

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>세부 작업 내용</h2>
      
      {/* 1. 역할(시트) 선택 탭 */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
        {Object.keys(tasksByRole).map(role => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            style={{
              padding: '10px 15px',
              border: 'none',
              cursor: 'pointer',
              background: activeRole === role ? '#eef2ff' : 'transparent',
              color: activeRole === role ? '#4f46e5' : '#333',
              fontWeight: activeRole === role ? 'bold' : 'normal',
              borderBottom: activeRole === role ? '3px solid #4f46e5' : '3px solid transparent',
              marginBottom: '-1px'
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {/* 2. 엑셀 같은 표 */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f8f9fa' }}>
          <tr>
            <th style={{ width: '150px', padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>팀원</th>
            <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>세부 작업</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(membersInRole).length > 0 ? (
            Object.entries(membersInRole).map(([memberName, tasks], index) => (
              <tr key={memberName} style={{ background: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>{memberName}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  {/* 작업 목록 */}
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {tasks.map(task => (
                      <li key={task.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(activeRole, memberName, task.id)}
                          style={{ marginRight: '10px', cursor: 'pointer' }}
                        />
                        <span style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#aaa' : '#333' }}>
                          {task.text}
                        </span>
                        <button onClick={() => handleDeleteTask(activeRole, memberName, task.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '14px' }}>삭제</button>
                      </li>
                    ))}
                  </ul>
                  {/* 새 작업 추가 입력란 */}
                  <div style={{ display: 'flex', marginTop: '10px' }}>
                    <input
                      type="text"
                      value={newTaskTexts[memberName] || ''}
                      onChange={(e) => setNewTaskTexts(prev => ({ ...prev, [memberName]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(activeRole, memberName)}
                      placeholder="새 작업 추가..."
                      style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <button onClick={() => handleAddTask(activeRole, memberName)} style={{ marginLeft: '8px', padding: '8px 12px', border: 'none', background: '#4f46e5', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>추가</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} style={{ padding: '20px', textAlign: 'center', color: '#888', border: '1px solid #dee2e6' }}>
                이 역할에 배정된 팀원이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskDetails;