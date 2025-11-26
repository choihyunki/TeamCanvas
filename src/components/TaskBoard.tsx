// src/components/TaskBoard.tsx (Task/Swimlane 기반으로 완전히 재구성)

import React, { useState } from "react";
import { Member } from "../types/Member";
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";
import "../styles/TaskBoard.css"; // TaskBoard2.tsx 스타일 기반

interface Props {
  columns: RoleColumn[];
  tasks: Task[]; // TaskBoard2.tsx에서 필요
  members: Member[];
  
  // 🔥 [Project.tsx와 TaskBoard2.tsx에서 모두 사용]: 역할(Role/Column) 관리
  onAddColumn: (name: string) => void;
  onDeleteColumn: (columnId: number) => void; 
  
  // 🔥 [TaskBoard2.tsx의 핵심 기능]: Task 관리 핸들러
  onAddTask: (roleId: number, status: string) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: string) => void;
  onDeleteTask: (taskId: number) => void;
  onSelectTask: (taskId: number) => void;
  onAssignMemberToTask: (taskId: number, memberId: number) => void;

  // ⚠️ [TaskBoard1의 멤버 중심 로직은 제거되거나 더미화]: TaskBoard2 구조에 불필요
  // onAddMemberToColumn, onDeleteMember, onDropMemberOnColumn 등은 제거합니다.
  onAddMemberToColumn: (columnId: number, memberId: number) => void;
  onDeleteMember: (columnId: number, memberId: number) => void;
  onDropMemberOnColumn: (columnId: number, memberId: number) => void;
  onMoveMember: (memberId: number, from: number, to: number) => void;
  onUpdateStatus: (columnId: number, memberId: number, status: string) => void;
  onUpdateMemberMemo: (columnId: number, memberId: number, memo: string) => void;
  onInviteFriend: (columnId: number, friendId: string, friendName: string) => void;
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
  // ⚠️ TaskBoard2 구조에 불필요하지만 Project.tsx에서 에러가 날 경우를 대비해 더미로 유지합니다.
  onAddMemberToColumn: _onAddMemberToColumn, 
  onDeleteMember: _onDeleteMember,
  onDropMemberOnColumn: _onDropMemberOnColumn,
  onMoveMember: _onMoveMember,
  onUpdateStatus: _onUpdateStatus,
  onUpdateMemberMemo: _onUpdateMemberMemo,
  onInviteFriend: _onInviteFriend,
}) => {
  const [newColumnName, setNewColumnName] = useState("");

  // TaskBoard2.tsx 로직
  const getMemberByName = (name: string) => members.find((m) => m.name === name);

  // --- 드래그 핸들러 (Task) ---
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("taskId", taskId.toString());
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
  const handleMemberDragStart = (e: React.DragEvent, memberId: number) => {
    e.dataTransfer.setData("memberId", memberId.toString());
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
  
  // 역할 추가 핸들러 (TaskBoard1의 로직을 이름만 통일하여 사용)
  const handleAddColumnClick = () => {
    if (!newColumnName.trim()) return;
    onAddColumn(newColumnName.trim());
    setNewColumnName("");
  };

  // TaskBoard2의 역할 추가 프롬프트 버전
  const handleAddRoleClick = () => {
    const roleName = prompt("새로운 역할(팀) 이름을 입력하세요.");
    if (roleName) onAddColumn(roleName); // onAddColumn 사용
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
          // 이 역할(로우)에 속한 모든 태스크에 배정된 멤버 이름 목록을 추출
          const assignedMembersInRole = tasks
            .filter((t) => t.columnId === role.id)
            .flatMap((t) => t.members)
            .filter((v, i, a) => a.indexOf(v) === i); // 중복 제거

          return (
            <div key={role.id} className="swimlane-row">
              {/* 2-1. 역할 이름 (왼쪽 헤더) - 멤버 목록 표시 */}
              <div
                className="row-header role-delete-area"
                onDragOver={handleDragOver}
              >
                <span className="role-name">{role.name}</span>
                <span className="role-count">
                  배정된 멤버: {assignedMembersInRole.length}명
                </span>

                {/* Task에 배정된 멤버들을 아바타로 표시 */}
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
                        onDragEnd={handleMemberDragEnd}
                      >
                        {member.name.charAt(0)}
                      </div>
                    );
                  })}
                </div>

                <button
                  className="delete-role-btn"
                  onClick={() => onDeleteColumn(role.id)} // onDeleteColumn 사용
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

                          {/* 다중 담당자 아바타 표시 */}
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
        <button className="add-role-btn-large" onClick={handleAddRoleClick}>
          + 역할/상태 추가
        </button>
      </div>
    </div>
  );
};

export default TaskBoard;