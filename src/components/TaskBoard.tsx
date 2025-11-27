import React, { useState } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
import "../styles/TaskBoard.css"; // 제공해주신 CSS 파일 import

interface Props {
  columns: RoleColumn[];
  tasks: Task[];
  members: Member[];

  onAddColumn: (name: string) => void;
  onDeleteColumn: (columnId: number) => void;

  onAddTask: (roleId: number, status: string) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: string) => void;
  onDeleteTask: (taskId: number) => void;
  onSelectTask: (taskId: number) => void;
  onAssignMemberToTask: (taskId: number, memberId: number) => void;

  onAddMemberToColumn: (columnId: number, memberId: number) => void;
  onDeleteMember: (columnId: number, memberId: number) => void;
  onDropMemberOnColumn: (columnId: number, memberId: number) => void;
  onMoveMember: (memberId: number, from: number, to: number) => void;
  onUpdateStatus: (columnId: number, memberId: number, status: string) => void;
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
  onAssignMemberToTask,
  onAddColumn,
  onDeleteColumn,
  onAddMemberToColumn,
  onDeleteMember: _onDeleteMember,
  onDropMemberOnColumn: _onDropMemberOnColumn,
  onMoveMember: _onMoveMember,
  onUpdateStatus: _onUpdateStatus,
  onUpdateMemberMemo: _onUpdateMemberMemo,
  onInviteFriend,
}) => {
  const [newColumnName, setNewColumnName] = useState("");

  const getMemberByName = (name: string) =>
    members.find((m) => m.name === name);

  // --- 드래그 핸들러 ---
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("taskId", taskId.toString());
    e.dataTransfer.setData("type", "TASK");
  };

  const handleMemberDragStart = (e: React.DragEvent, memberId: number) => {
    e.dataTransfer.setData("memberId", memberId.toString());
    e.dataTransfer.setData("type", "MEMBER");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const dataType = e.dataTransfer.getData("type");
    if (dataType === "MEMBER" || dataType === "TASK" || dataType === "FRIEND") {
      e.dataTransfer.dropEffect = "move";
    }
  };

  // Task 상태 변경 (셀에 드롭 시)
  const handleDrop = (e: React.DragEvent, roleId: number, status: string) => {
    e.preventDefault();
    const dataType = e.dataTransfer.getData("type");

    if (dataType === "TASK") {
      const taskId = Number(e.dataTransfer.getData("taskId"));
      if (!isNaN(taskId)) {
        onUpdateTaskStatus(taskId, status);
      }
    }
  };

  // 역할(컬럼) 헤더에 멤버/친구 드롭 시
  const handleDropMemberOnRoleHeader = (e: React.DragEvent, roleId: number) => {
    e.preventDefault();
    const dataType = e.dataTransfer.getData("type");

    if (dataType === "MEMBER") {
      const memberId = Number(e.dataTransfer.getData("memberId"));
      if (!isNaN(memberId)) {
        onAddMemberToColumn(roleId, memberId);
      }
    } else if (dataType === "FRIEND") {
      const friendId = e.dataTransfer.getData("friendId");
      const friendName = e.dataTransfer.getData("friendName");
      if (friendId && friendName) {
        onInviteFriend(roleId, friendId, friendName);
      }
    }
  };

  // Task Card에 멤버 할당
  const handleDropMemberOnTaskCard = (e: React.DragEvent, taskId: number) => {
    e.preventDefault();
    const memberIdStr = e.dataTransfer.getData("memberId");
    const memberId = Number(memberIdStr);

    if (memberId && !isNaN(memberId)) {
      onAssignMemberToTask(taskId, memberId);
    }
  };

  const handleAddRoleClick = () => {
    const roleName = prompt("새로운 역할(팀) 이름을 입력하세요.");
    if (roleName) onAddColumn(roleName);
  };

  return (
    <div className="swimlane-wrapper">
      <div className="swimlane-container">
        <div className="swimlane-header">
          <div className="header-cell role-header">역할 / 상태</div>
          {STATUSES.map((status) => (
            <div key={status.key} className="header-cell status-header">
              <span
                className="status-dot"
                style={{ background: status.color }}
              />
              {status.label}
            </div>
          ))}
        </div>
      </div>
      <div className="swimlane-body">
        {columns.map((role) => {
          const assignedMembersInRole = tasks
            .filter((t) => t.columnId === role.id)
            .flatMap((t) => t.members)
            .filter((v, i, a) => a.indexOf(v) === i);

          return (
            <div key={role.id} className="swimlane-row">
              {/* 역할 헤더 (드롭 존) */}
              <div
                className="row-header role-delete-area"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropMemberOnRoleHeader(e, role.id)}
              >
                <span className="role-name">{role.name}</span>
                <span className="role-count">
                  배정: {assignedMembersInRole.length}명
                </span>

                {/* 역할별 멤버 아바타 표시 (이미지처럼 동그라미 아이콘) */}
                <div className="role-member-avatars">
                  {assignedMembersInRole.map((name) => {
                    const member = getMemberByName(name);
                    if (!member) return null;
                    return (
                      <div
                        key={name}
                        className="member-avatar-mini"
                        title={name}
                        draggable="true"
                        onDragStart={(e) => handleMemberDragStart(e, member.id)}
                      >
                        {member.name.charAt(0)}
                        {/* 멤버 상태 표시 (온라인/오프라인 등) - CSS로 위치 조정됨 */}
                        {/* <div className="member-status-dot" style={{ backgroundColor: member.isOnline ? '#10B981' : '#9CA3AF' }} /> */}
                      </div>
                    );
                  })}
                </div>

                <button
                  className="delete-role-btn"
                  onClick={() => onDeleteColumn(role.id)}
                >
                  ✕
                </button>
              </div>

              {/* 상태별 셀 */}
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
                      const assigneeNames = task.members;
                      return (
                        <div
                          key={task.id}
                          className="task-card-mini"
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => onSelectTask(task.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropMemberOnTaskCard(e, task.id)}
                        >
                          <div className="task-title">{task.title}</div>
                          
                          {/* 🔥 [수정] 할 일 카드 내 멤버 아이콘 표시 */}
                          {assigneeNames.length > 0 && (
                            <div className="role-member-avatars" style={{ marginTop: '8px' }}> 
                              {/* role-member-avatars 클래스 재사용 (CSS에 정의됨) */}
                              {assigneeNames.map((name) => (
                                <div
                                  key={name}
                                  className="member-avatar-mini" // member-avatar-mini 클래스 재사용
                                  title={name}
                                  style={{ backgroundColor: "#4f46e5", color: "white" }} // 카드 내에서는 보라색 배경
                                >
                                  {name.charAt(0)}
                                </div>
                              ))}
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
                        + 추가
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
        <button className="add-role-btn-large" onClick={handleAddRoleClick}>
          + 역할/상태 추가
        </button>
      </div>
    </div>
  );
};

export default TaskBoard;