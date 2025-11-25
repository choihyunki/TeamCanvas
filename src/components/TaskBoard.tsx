import React from "react";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
import { Member } from "../types/Member";
import "../styles/TaskBoard.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[]; // (에러 방지용 유지)
  onAddColumn: (name: string) => void;
  onDeleteColumn: (columnId: number) => void;
  onAddMemberToColumn: (columnId: number, memberId: number) => void;
  onMoveMember: (memberId: number, from: number, to: number) => void;
  onUpdateStatus: (columnId: number, memberId: number, status: string) => void;
  onDeleteMember: (columnId: number, memberId: number) => void;
  onUpdateMemberMemo: (
    columnId: number,
    memberId: number,
    memo: string
  ) => void;
  onInviteFriend: (
    columnId: number,
    friendId: string,
    friendName: string
  ) => void;
  onAddTask: (columnId: number, title: string) => void;
  onSelectTask: (taskId: number) => void;

  // 🔥 [핵심] 컬럼(보드)에 멤버를 드롭했을 때 실행되는 함수
  onDropMemberOnColumn: (columnId: number, memberId: number) => void;
}

const STATUSES = [
  { key: "TODO", label: "대기", color: "#6b7280" },
  { key: "IN_PROGRESS", label: "진행중", color: "#3B82F6" },
  { key: "DONE", label: "완료", color: "#10b981" },
];

const TaskBoard: React.FC<Props> = ({
  columns,
  tasks,
  members,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onSelectTask,
  onAddRoleColumn,
  onDeleteRoleColumn,
  onAssignMemberToTask,
}) => {
  
  const getMemberByName = (name: string) => members.find(m => m.name === name); 


  // --- 드래그 핸들러 (Task) ---
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("taskId", taskId.toString());
    e.dataTransfer.setData("type", "TASK");
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
        target.style.visibility = 'hidden';
    }, 0);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.visibility = 'visible'; 
  };
  
  // --- 드래그 핸들러 (Member) ---
  const handleMemberDragStart = (e: React.DragEvent, memberId: number) => {
      e.dataTransfer.setData("memberId", memberId.toString());
      e.dataTransfer.setData("type", "MEMBER"); 
      
      const target = e.currentTarget as HTMLElement;
      setTimeout(() => {
          target.style.visibility = 'hidden';
      }, 0);
  };
  
  const handleMemberDragEnd = (e: React.DragEvent) => {
      const target = e.currentTarget as HTMLElement;
      target.style.visibility = 'visible';
  };

  // --- 드롭 핸들러 (Task Status 변경 / Task 담당자 할당) ---
  const handleDrop = (e: React.DragEvent, roleId: number, status: string) => {
    e.preventDefault();
    const dataType = e.dataTransfer.getData("type");
    
    if (dataType === "TASK") {
        const taskId = Number(e.dataTransfer.getData("taskId"));
        if (taskId && !isNaN(taskId)) {
            onUpdateTaskStatus(taskId, status); // Task 상태 변경
        }
    } 
    // Note: TaskBoard Cell에는 멤버 상태 변경 로직이 제거됨
  };

  // Task Card에 멤버 드롭 시 담당자 할당
  const handleDropMemberOnTaskCard = (e: React.DragEvent, taskId: number) => {
      e.preventDefault();
      const memberIdStr = e.dataTransfer.getData("memberId");
      const memberId = Number(memberIdStr);
      
      if (memberId && !isNaN(memberId)) {
          onAssignMemberToTask(taskId, memberId); // Task 할당 로직 호출
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddRoleClick = () => {
      const roleName = prompt("새로운 역할(팀) 이름을 입력하세요.");
      if (roleName) onAddRoleColumn(roleName);
  };

  return (
    <div className="swimlane-wrapper">
      <div className="swimlane-container">
        <div className="swimlane-header">
          <div className="header-cell role-header">역할 / 상태</div>
          {STATUSES.map((status) => (
            <div key={status.key} className="header-cell status-header">
              <span className="status-dot" style={{ background: status.color }} />
              {status.label}
            </div>
          ))}
        </div>
      </div>
      <div className="swimlane-body">
        {columns.map((role) => {
            // [NEW] 이 역할(로우)에 속한 모든 태스크에 배정된 멤버 이름 목록을 추출
            const assignedMembersInRole = tasks
                .filter(t => t.columnId === role.id)
                .flatMap(t => t.members)
                .filter((v, i, a) => a.indexOf(v) === i); // 중복 제거

            return (
                <div key={role.id} className="swimlane-row">
                    {/* 2-1. 역할 이름 (왼쪽 헤더) - 멤버 목록 표시 */}
                    <div 
                        className="row-header role-delete-area"
                        // [MODIFIED] 역할 Header에 멤버 드롭 로직 제거
                        onDragOver={handleDragOver} 
                    >
                        <span className="role-name">{role.name}</span>
                        <span className="role-count">
                            배정된 멤버: {assignedMembersInRole.length}명
                        </span>
                        
                        {/* [NEW] Task에 배정된 멤버들을 아바타로 표시 */}
                        <div className="role-member-avatars">
                            {assignedMembersInRole.map(name => {
                                const member = getMemberByName(name);
                                if (!member) return null;
                                
                                return (
                                    <div 
                                        key={name}
                                        className="member-avatar-mini"
                                        title={name}
                                        // [MODIFIED] Task에 배정된 멤버를 TaskCard로 드래그할 수 있도록 소스 활성화
                                        draggable="true"
                                        onDragStart={(e) => handleMemberDragStart(e, member.id)}
                                        onDragEnd={handleMemberDragEnd}
                                    >
                                        {member.name.charAt(0)}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <button 
                            className="delete-role-btn" 
                            onClick={() => onDeleteRoleColumn(role.id)}
                        >
                            ✕
                        </button>
                    </div>

                    {/* 2-2. 상태별 칸 (셀) */}
                    {STATUSES.map((status) => {
                      const cellTasks = tasks.filter(
                        (t) => t.columnId === role.id && t.status === status.key
                      );

                      return (
                        <div
                          key={`${role.id}-${status.key}`}
                          className="swimlane-cell"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, role.id, status.key)} // Task Status Drop Target
                        >
                          {cellTasks.map((task) => {
                            // Task.members는 이름 문자열 배열 (string[])
                            const assigneeNames = task.members;
                            
                            return (
                                <div
                                  key={task.id}
                                  className="task-card-mini"
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, task.id)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => onSelectTask(task.id)}
                                  onDragOver={handleDragOver} 
                                  onDrop={(e) => handleDropMemberOnTaskCard(e, task.id)} // Task 할당 드롭 처리
                                >
                                  <div className="task-title">{task.title}</div>
                                  
                                  {/* [MODIFIED] 다중 담당자 아바타 표시 */}
                                  {assigneeNames.length > 0 && (
                                      <div className="task-assignee-container">
                                          {assigneeNames.map((name) => {
                                              const assignee = getMemberByName(name);
                                              if (!assignee) return null;
                                              
                                              return (
                                                  <div 
                                                      key={name}
                                                      className="task-assignee-avatar" 
                                                      title={name}
                                                  >
                                                      {name.charAt(0)}
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  )}

                                  <button
                                    className="task-delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTask(task.id);
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                            );
                          })}

                          {status.key === "TODO" && (
                            <button
                              className="add-task-btn-mini"
                              onClick={() => onAddTask(role.id, status.key)}
                            >
                              + 할 일 추가
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
            );
        })}
      </div>

      <div className="add-role-area">
        <button 
          className="add-role-btn-large" 
          onClick={handleAddRoleClick}
        >
          + 역할/상태 추가
        </button>
      </div>
    </div>
  );
};

export default TaskBoard;