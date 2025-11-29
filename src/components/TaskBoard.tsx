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
  // 🔥 [수정] ID 타입을 string으로 변경
  onDeleteColumn: (columnId: number | string) => void;

  onAddTask: (roleId: number | string, status: string) => void;
  onUpdateTaskStatus: (taskId: number | string, newStatus: string) => void;
  onDeleteTask: (taskId: number | string) => void;
  onSelectTask: (taskId: number | string) => void;
  onAssignMemberToTask: (
    taskId: number | string,
    memberId: number | string
  ) => void;

  onAddMemberToColumn: (
    columnId: number | string,
    memberId: number | string
  ) => void;
  onDeleteMember: (
    columnId: number | string,
    memberId: number | string
  ) => void;
  onDropMemberOnColumn: (
    columnId: number | string,
    memberId: number | string
  ) => void;
  onMoveMember: (
    memberId: number | string,
    from: number | string,
    to: number | string
  ) => void;
  onUpdateStatus: (
    columnId: number | string,
    memberId: number | string,
    status: string
  ) => void;
  onUpdateMemberMemo: (
    columnId: number | string,
    memberId: number | string,
    memo: string
  ) => void;
  onInviteFriend: (
    columnId: number | string,
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
  const handleDragStart = (e: React.DragEvent, taskId: number | string) => {
    e.dataTransfer.setData("taskId", String(taskId)); // 🔥 String 변환
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
  const handleMemberDragStart = (
    e: React.DragEvent,
    memberId: number | string
  ) => {
    e.dataTransfer.setData("memberId", String(memberId)); // 🔥 String 변환
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
    // 시각적 강조
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
    roleId: number | string,
    status: string
  ) => {
    e.preventDefault();
    const dataType = e.dataTransfer.getData("type");

    if (dataType === "TASK") {
      const taskId = e.dataTransfer.getData("taskId"); // 🔥 String 그대로 받음
      if (taskId) {
        onUpdateTaskStatus(taskId, status);
      }
    }
  };

  // 역할(컬럼)에 멤버 드롭 시 처리 (Role Header)
  const handleDropMemberOnRoleHeader = (
    e: React.DragEvent,
    roleId: number | string
  ) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";

    const dataType = e.dataTransfer.getData("type");

    if (dataType === "MEMBER") {
      const memberId = e.dataTransfer.getData("memberId"); // 🔥 String 그대로 받음
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
    taskId: number | string
  ) => {
    e.preventDefault();
    const memberId = e.dataTransfer.getData("memberId"); // 🔥 String 그대로 받음

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
          // ID 비교 시 String으로 변환하여 안전하게 비교
          const assignedMembersInRole = tasks
            .filter((t) => String(t.columnId) === String(role.id))
            .flatMap((t) => t.members)
            .filter((v, i, a) => a.indexOf(v) === i);

          return (
            <div key={role.id} className="swimlane-row">
              {/* 역할 이름 (왼쪽 헤더) */}
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

              {/* 상태별 칸 (셀) */}
              {STATUSES.map((status) => {
                const cellTasks = tasks.filter(
                  (t) =>
                    String(t.columnId) === String(role.id) &&
                    t.status === status.key
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
                                // assignee가 없어도 이름만 표시하도록 (안전장치)
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
