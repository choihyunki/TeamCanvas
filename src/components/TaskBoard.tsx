import React from "react";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
import { Member } from "../types/Member";
import "../styles/TaskBoard.css";

interface Props {
  columns: RoleColumn[];
  tasks: Task[];
  members: Member[];
  onAddTask: (roleId: number, status: string) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: string) => void;
  onDeleteTask: (taskId: number) => void;
  onSelectTask: (taskId: number) => void;
  onAddRoleColumn: (name: string) => void;
  onAddMemberToRole: (roleId: number, memberId: number) => void;
  onDeleteRoleColumn: (roleId: number) => void;
  onUpdateMemberStatusInRole: (roleId: number, memberId: number, newStatus: string) => void;
  onAssignMemberToTask: (taskId: number, memberId: number) => void;
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
  onAddMemberToRole,
  onDeleteRoleColumn,
  onUpdateMemberStatusInRole,
  onAssignMemberToTask,
}) => {
  
  const getMemberById = (id: number) => members.find(m => m.id === id);
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

  // --- 드롭 핸들러 (Task Status 변경 / Member 상태 변경) ---
  const handleDrop = (e: React.DragEvent, roleId: number, status: string) => {
    e.preventDefault();
    const dataType = e.dataTransfer.getData("type");
    
    if (dataType === "TASK") {
        const taskId = Number(e.dataTransfer.getData("taskId"));
        if (taskId && !isNaN(taskId)) {
            onUpdateTaskStatus(taskId, status); 
        }
    } else if (dataType === "MEMBER") {
        const memberId = Number(e.dataTransfer.getData("memberId"));
        if (memberId && !isNaN(memberId)) {
            onUpdateMemberStatusInRole(roleId, memberId, status); 
        }
    }
  };

  // [NEW] Task Card에 멤버 드롭 시 담당자 할당
  const handleDropMemberOnTaskCard = (e: React.DragEvent, taskId: number) => {
      e.preventDefault();
      const memberIdStr = e.dataTransfer.getData("memberId");
      const memberId = Number(memberIdStr);
      
      if (memberId && !isNaN(memberId)) {
          onAssignMemberToTask(taskId, memberId);
      }
  };

  // --- 드롭 핸들러 (Member Role 할당) ---
  const handleDropMemberOnRole = (e: React.DragEvent, roleId: number) => {
      e.preventDefault();
      const memberIdStr = e.dataTransfer.getData("memberId");
      const memberId = Number(memberIdStr);
      if (memberId && !isNaN(memberId)) {
          onAddMemberToRole(roleId, memberId);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // 👈 이 부분이 드롭을 허용하는 핵심입니다.
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
        {columns.map((role) => (
          <div key={role.id} className="swimlane-row">
            {/* 2-1. 역할 이름 (왼쪽 헤더) - 멤버 드롭 영역 */}
            <div 
                className="row-header role-delete-area"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropMemberOnRole(e, role.id)}
            >
              <span className="role-name">{role.name}</span>
              <span className="role-count">
                멤버: {role.members.length}명
              </span>
              
              {/* 역할에 배정된 멤버들을 아바타로 표시 (드래그 소스) */}
              <div className="role-member-avatars">
                  {role.members.map(pm => {
                      const memberData = getMemberById(pm.id);
                      if (!memberData) return null;
                      
                      const statusColor = STATUSES.find(s => s.key === pm.status)?.color || '#9ca3af';

                      return (
                          <div 
                              key={pm.id}
                              className="member-avatar-mini"
                              title={`${memberData.name} (${pm.status})`}
                              draggable="true" 
                              onDragStart={(e) => handleMemberDragStart(e, pm.id)} 
                              onDragEnd={handleMemberDragEnd}
                          >
                              {memberData.name.charAt(0)}
                              <span className="member-status-dot" style={{ backgroundColor: statusColor }} />
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
                  onDrop={(e) => handleDrop(e, role.id, status.key)} 
                >
                  {cellTasks.map((task) => {
                    const assigneeName = task.members.length > 0 ? task.members[0] : null; 
                    const assignee = assigneeName ? getMemberByName(assigneeName) : null;
                    
                    return (
                        <div
                          key={task.id}
                          className="task-card-mini"
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onSelectTask(task.id)}
                          onDragOver={handleDragOver} 
                          onDrop={(e) => handleDropMemberOnTaskCard(e, task.id)} 
                        >
                          <div className="task-title">{task.title}</div>
                          
                          {/* 담당자 아바타 표시 */}
                          {assignee && (
                              <div className="task-assignee-avatar" title={assignee.name}>
                                  {assignee.name.charAt(0)}
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
        ))}
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