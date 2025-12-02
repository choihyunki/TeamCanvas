import React, { useState } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
import "../styles/TaskBoard.css";

interface Props {
  columns: RoleColumn[];
  tasks: Task[];
  members: Member[];

  onAddColumn: (name: string) => void;
  // 🔥 [수정] 모든 ID 타입을 string으로 통일
  onDeleteColumn: (columnId: string) => void;

  onAddTask: (roleId: string, status: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onAssignMemberToTask: (taskId: string, memberId: string) => void;

  onAddMemberToColumn: (columnId: string, memberId: string) => void;
  onDeleteMember: (columnId: string, memberId: string) => void;
  onDropMemberOnColumn: (columnId: string, memberId: string) => void;
  onMoveMember: (memberId: string, from: string, to: string) => void;
  onUpdateStatus: (columnId: string, memberId: string, status: string) => void;
  onUpdateMemberMemo: (
    columnId: string,
    memberId: string,
    memo: string
  ) => void;
  onInviteFriend: (
    columnId: string,
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

  // --- 드래그 핸들러 (Task) ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    // 🔥 string
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("type", "TASK");
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.style.visibility = "hidden";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.visibility = "visible";
  };

  // --- 드래그 핸들러 (Member) ---
  const handleMemberDragStart = (e: React.DragEvent, memberId: string) => {
    // 🔥 string
    e.dataTransfer.setData("memberId", memberId);
    e.dataTransfer.setData("type", "MEMBER");

    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.style.visibility = "hidden";
    }, 0);
  };

  const handleMemberDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.visibility = "visible";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const dataType = e.dataTransfer.getData("type");
    if (dataType === "MEMBER" || dataType === "TASK" || dataType === "FRIEND") {
      e.dataTransfer.dropEffect = "move";
    }
    if (
      (e.currentTarget as HTMLElement).classList.contains("role-delete-area")
    ) {
      if (dataType === "MEMBER") {
        (e.currentTarget as HTMLElement).style.backgroundColor = "#e0f7ff";
      }
    }
  };

  // Task Status 변경 드롭 핸들러
  const handleDrop = (
    e: React.DragEvent,
    roleId: string, // 🔥 string
    status: string
  ) => {
    e.preventDefault();
    const dataType = e.dataTransfer.getData("type");

    if (dataType === "TASK") {
      const taskId = e.dataTransfer.getData("taskId");
      if (taskId) {
        onUpdateTaskStatus(taskId, status);
      }
    }
  };

  // 역할(컬럼)에 멤버 드롭 시 처리 (Role Header)
  const handleDropMemberOnRoleHeader = (
    e: React.DragEvent,
    roleId: string // 🔥 string
  ) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";

    const dataType = e.dataTransfer.getData("type");

    if (dataType === "MEMBER") {
      const memberId = e.dataTransfer.getData("memberId");
      if (memberId) {
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

  const handleDragLeave = (e: React.DragEvent) => {
    if (
      (e.currentTarget as HTMLElement).classList.contains("role-delete-area")
    ) {
      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
    }
  };

  // Task Card에 멤버 드롭 시 담당자 할당
  const handleDropMemberOnTaskCard = (
    e: React.DragEvent,
    taskId: string // 🔥 string
  ) => {
    e.preventDefault();
    const memberId = e.dataTransfer.getData("memberId");

    if (memberId) {
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
              <div
                className="row-header role-delete-area"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropMemberOnRoleHeader(e, role.id)}
              >
                <span className="role-name">{role.name}</span>
                <span className="role-count">
                  배정된 멤버: {assignedMembersInRole.length}명
                </span>

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
                        onDragOver={(e) => e.stopPropagation()}
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
                  onClick={() => onDeleteColumn(role.id)}
                >
                  ✕
                </button>
              </div>

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
                          onDragEnd={handleDragEnd}
                          onClick={() => onSelectTask(task.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropMemberOnTaskCard(e, task.id)}
                        >
                          <div className="task-title">{task.title}</div>

                          {assigneeNames.length > 0 && (
                            <div className="task-assignee-container">
                              {assigneeNames.map((name) => {
                                const assignee = getMemberByName(name);
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

export default React.memo(TaskBoard);
