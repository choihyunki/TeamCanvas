import React, { useState } from "react";
import { RoleColumn } from "../types/Project";
import { Member } from "../types/Member";
import { Task } from "../types/Task";
import "../styles/TaskBoard.css";

interface TaskBoardProps {
  columns: RoleColumn[];
  members: Member[];
  tasks: Task[];

  onAddColumn: (name: string) => void;
  onDeleteColumn: (columnId: number) => void;

  // 멤버 관련
  onAddMemberToColumn: (columnId: number, memberId: number) => void;
  onDeleteMember: (columnId: number, memberId: number) => void;
  onMoveMember: (
    memberId: number,
    sourceColId: number,
    destColId: number
  ) => void;
  onUpdateStatus: (columnId: number, memberId: number, status: string) => void;
  onUpdateMemberMemo: (
    columnId: number,
    memberId: number,
    memo: string
  ) => void;

  // 기타 기능
  onInviteFriend: (
    columnId: number,
    friendId: string,
    friendName: string
  ) => void;
  onAddTask: (columnId: number, status: string) => void;
  onSelectTask: (taskId: number) => void;

  // 드래그 앤 드롭
  onDropMemberOnColumn: (columnId: number, memberId: number) => void;

  // 태스크 관련
  onUpdateTaskStatus: (taskId: number, newStatus: string) => void;
  onDeleteTask: (taskId: number) => void;
  onAssignMemberToTask: (taskId: number, memberId: number) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  columns,
  members,
  tasks,
  onAddColumn,
  onDeleteColumn,
  onDeleteMember,
  // onUpdateStatus,
  // onUpdateMemberMemo,
  onInviteFriend,
  onDropMemberOnColumn,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
}) => {
  const [newRoleName, setNewRoleName] = useState("");

  // 고정된 상태값
  const statuses = [
    { key: "TODO", label: "할 일", color: "#EF4444" },
    { key: "IN_PROGRESS", label: "진행 중", color: "#F59E0B" },
    { key: "DONE", label: "완료", color: "#10B981" },
  ];

  const handleAddRoleClick = () => {
    const name = prompt("새 역할(팀) 이름을 입력하세요:");
    if (name?.trim()) {
      onAddColumn(name);
    }
  };

  // --- 드래그 앤 드롭 ---
  const handleDragStartMember = (e: React.DragEvent, memberId: number) => {
    e.dataTransfer.setData("type", "MEMBER");
    e.dataTransfer.setData("memberId", memberId.toString());
  };

  const handleDragStartTask = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("type", "TASK");
    e.dataTransfer.setData("taskId", taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent,
    roleId: number,
    statusKey?: string
  ) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");

    // 1. 친구 초대
    if (type === "FRIEND") {
      const friendId = e.dataTransfer.getData("friendId");
      const friendName = e.dataTransfer.getData("friendName");
      if (friendId && friendName) {
        onInviteFriend(roleId, friendId, friendName);
      }
      return;
    }

    // 2. 멤버 이동
    if (type === "MEMBER") {
      const memberIdStr = e.dataTransfer.getData("memberId");
      if (memberIdStr) {
        onDropMemberOnColumn(roleId, parseInt(memberIdStr, 10));
      }
      return;
    }

    // 3. 태스크 이동
    if (type === "TASK" && statusKey) {
      const taskIdStr = e.dataTransfer.getData("taskId");
      if (taskIdStr) {
        onUpdateTaskStatus(parseInt(taskIdStr, 10), statusKey);
      }
    }
  };

  return (
    <div className="swimlane-wrapper">
      <div className="swimlane-container">
        {/* 헤더 */}
        <div className="swimlane-header">
          <div className="header-cell role-header">역할 / 상태</div>
          {statuses.map((status) => (
            <div key={status.key} className="header-cell">
              <span
                className="status-dot"
                style={{ backgroundColor: status.color }}
              />
              {status.label}
            </div>
          ))}
        </div>

        <div className="swimlane-body">
          {columns.map((role) => (
            <div key={role.id} className="swimlane-row">
              {/* 좌측: 역할 헤더 */}
              <div
                className="row-header"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, role.id)}
              >
                <div className="role-name">{role.name}</div>
                <div className="role-count">{role.members.length}명</div>

                <div className="role-member-avatars">
                  {role.members.map((pm) => {
                    // 🔥 [수정] 전체 멤버 목록(members)에서 정보 찾기
                    const fullMember = members.find((m) => m.id === pm.id);
                    const name = fullMember?.name || `User ${pm.id}`;
                    const isOnline = fullMember?.isOnline ?? false;

                    return (
                      <div
                        key={pm.id}
                        className="member-avatar-mini"
                        draggable
                        onDragStart={(e) => handleDragStartMember(e, pm.id)}
                        title={name} // 수정된 name 사용
                      >
                        {name[0]}
                        <span
                          className="member-status-dot"
                          // 수정된 isOnline 사용
                          style={{
                            backgroundColor: isOnline ? "#10B981" : "#9CA3AF",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  className="delete-role-btn"
                  onClick={() => onDeleteColumn(role.id)}
                  title="역할 삭제"
                >
                  ×
                </button>
              </div>

              {/* 우측: 태스크 셀 */}
              {statuses.map((status) => {
                const cellTasks = tasks.filter(
                  (t) => t.columnId === role.id && t.status === status.key
                );

                return (
                  <div
                    key={status.key}
                    className="swimlane-cell"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, role.id, status.key)}
                  >
                    {cellTasks.map((task) => (
                      <div
                        key={task.id}
                        className="task-card-mini"
                        draggable
                        onDragStart={(e) => handleDragStartTask(e, task.id)}
                      >
                        {task.title}
                        <button
                          className="task-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <button
                      className="add-task-btn-mini"
                      onClick={() => onAddTask(role.id, status.key)}
                    >
                      + 추가
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="add-role-area">
          <button className="add-role-btn-large" onClick={handleAddRoleClick}>
            + 새로운 역할 그룹 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
