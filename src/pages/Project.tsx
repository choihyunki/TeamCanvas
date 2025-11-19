// src/pages/Project.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import TaskDetails from "../components/TaskDetails";
import Schedule from "../components/Schedule";
import SlideoutSidebar from "../components/SlideoutSidebar";
import ProgressBar from "../components/ProgressBar";
import ChatBox from "../components/ChatBox"; // ChatBox import 추가

import { Member } from "../types/Member";
import { RoleColumn, ProjectMember } from "../types/Project";
import { Task } from "../types/Task";

import { useAuth } from "../context/AuthContext";
import {
  getProjectsForUser,
  getProjectById,
  ProjectRecord,
  addMemberToProject,
  removeMemberFromProject,
} from "../data/mockDb";

interface Friend {
  id: number;
  name: string;
  avatarInitial: string;
}

const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const numericProjectId = projectId ? Number(projectId) : null;

  const { token } = useAuth(); // username
  const [currentProject, setCurrentProject] = useState<ProjectRecord | null>(
    null
  );

  // --- 상태 관리 ---
  const [members, setMembers] = useState<Member[]>([]);
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [friends, setFriends] = useState<Friend[]>([
    { id: 201, name: "김유신", avatarInitial: "김" },
    { id: 202, name: "이순신", avatarInitial: "이" },
  ]);

  const [myProjects, setMyProjects] = useState<{ id: number; name: string }[]>(
    []
  );
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("taskBoard");

  const navigate = useNavigate();

  // --- Sidebar toggles
  const toggleLeftSidebar = () =>
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleRightSidebar = () =>
    setIsRightSidebarCollapsed(!isRightSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen);

  // 1. 전체 프로젝트 멤버 추가
  const handleAddMember = () => {
    const name = prompt("추가할 멤버 이름:");
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    const newMember: Member = {
      id: Date.now(),
      name: trimmed,
      isOnline: true,
    };

    setMembers((prev) => [...prev, newMember]);
    if (numericProjectId !== null) {
      addMemberToProject(numericProjectId, trimmed);
    }
  };
  // 2. 전체 프로젝트 멤버 삭제
  const handleDeleteMember = (memberId: number) => {
    if (!window.confirm("이 멤버를 프로젝트에서 제거할까요?")) return;
    const target = members.find((m) => m.id === memberId);
    if (target && numericProjectId !== null) {
      removeMemberFromProject(numericProjectId, target.name);
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // 3. 컬럼 추가/삭제
  const handleAddColumn = (name: string) => {
    const newColumn: RoleColumn = {
      id: columns.length ? Math.max(...columns.map((c) => c.id)) + 1 : 101,
      name,
      members: [],
    };
    setColumns((prev) => [...prev, newColumn]);
  };

  const handleDeleteColumn = (columnId: number) => {
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
  };

  // 4. 컬럼에 멤버 배정
  const handleAddMemberToColumn = (columnId: number, memberId: number) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column) return;
    if (column.members.some((m) => m.id === memberId)) {
      alert("이미 이 역할에 배정된 멤버입니다.");
      return;
    }
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId
          ? {
              ...c,
              members: [...c.members, { id: memberId, status: "작업전" }],
            }
          : c
      )
    );
  };

  // 5. 👇 [수정] 누락되었던 함수 구현 (컬럼 내 멤버 삭제)
  const handleDeleteMemberFromColumn = (columnId: number, memberId: number) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, members: col.members.filter((m) => m.id !== memberId) }
          : col
      )
    );
  };

  // 6. 친구 초대 -> 컬럼 배정
  const handleInviteFriendToColumn = (
    columnId: number,
    friendId: string,
    friendName: string
  ) => {
    const id = parseInt(friendId, 10);
    const isAlreadyMember = members.some((m) => m.id === id);
    const col = columns.find((c) => c.id === columnId);
    const isInThisColumn = col?.members.some((m) => m.id === id);

    if (isInThisColumn) {
      alert("이미 이 역할에 등록된 멤버입니다.");
      return;
    }

    if (window.confirm(`${friendName}님을 이 역할에 초대하시겠습니까?`)) {
      // 프로젝트 멤버가 아니면 추가
      if (!isAlreadyMember) {
        const newMember: Member = { id, name: friendName, isOnline: false };
        setMembers((prev) => [...prev, newMember]);
      }
      // mockDb 업데이트
      if (numericProjectId !== null) {
        addMemberToProject(numericProjectId, friendName);
      }
      // 컬럼에 추가
      setColumns((prev) =>
        prev.map((colItem) =>
          colItem.id === columnId
            ? {
                ...colItem,
                members: [...colItem.members, { id, status: "작업전" }],
              }
            : colItem
        )
      );
    }
  };

  // 7. 멤버 이동 / 상태 변경 / 메모 변경
  const handleMoveMemberBetweenColumns = (
    memberId: number,
    sourceColumnId: number,
    targetColumnId: number
  ) => {
    if (sourceColumnId === targetColumnId) return;
    let moved: ProjectMember | undefined;
    const removed = columns.map((col) => {
      if (col.id === sourceColumnId) {
        moved = col.members.find((m) => m.id === memberId);
        return {
          ...col,
          members: col.members.filter((m) => m.id !== memberId),
        };
      }
      return col;
    });
    if (!moved) return;
    const added = removed.map((col) =>
      col.id === targetColumnId
        ? { ...col, members: [...col.members, moved!] }
        : col
    );
    setColumns(added);
  };

  const handleUpdateMemberStatus = (
    columnId: number,
    memberId: number,
    status: string
  ) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              members: col.members.map((m) =>
                m.id === memberId ? { ...m, status } : m
              ),
            }
          : col
      )
    );
  };

  const handleUpdateMemberMemo = (
    columnId: number,
    memberId: number,
    memo: string
  ) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              members: col.members.map((m) =>
                m.id === memberId ? { ...m, memo } : m
              ),
            }
          : col
      )
    );
  };

  // 8. 작업(Task) 관리
  const handleAddTask = (columnId: number, title: string) => {
    const newTask: Task = {
      id: Date.now(),
      title,
      description: "",
      columnId,
      members: [],
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // --- Handler: 작업 선택
  const handleSelectTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setActiveTab("taskDetails");
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  // --- Initial load effect
  useEffect(() => {
    if (!token) return;

    const myList = getProjectsForUser(token);
    setMyProjects(myList.map((p) => ({ id: p.id, name: p.name })));

    if (numericProjectId !== null) {
      const record = getProjectById(numericProjectId);
      if (record) {
        setCurrentProject(record);
        setMembers(
          record.members.map((name, idx) => ({
            id: idx + 1,
            name,
            isOnline: true,
          }))
        );
        // 기본 칼럼 세팅
        setColumns([
          { id: 101, name: "백엔드 개발", members: [] },
          { id: 102, name: "프론트엔드 개발", members: [] },
          { id: 103, name: "디자인", members: [] },
        ]);
        setTasks([]); // 새 프로젝트이거나 초기화
        setSelectedTaskId(null);
      }
    }
  }, [token, numericProjectId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header onMenuClick={toggleSlideout} />

      <SlideoutSidebar
        isOpen={isSlideoutOpen}
        onClose={toggleSlideout}
        projects={myProjects}
        friends={friends}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          marginLeft: isSlideoutOpen ? 280 : 0,
          transition: "margin-left 0.3s",
        }}
      >
        {/* 왼쪽: 멤버 리스트 */}
        <aside
          style={{
            width: isLeftSidebarCollapsed ? 0 : 220,
            padding: isLeftSidebarCollapsed ? 0 : 10,
            borderRight: isLeftSidebarCollapsed ? "none" : "1px solid #ddd",
            transition: "width 0.3s",
            overflow: "auto",
          }}
        >
          {!isLeftSidebarCollapsed && (
            <MemberList
              members={members}
              onAddMemberClick={handleAddMember}
              onDeleteMember={handleDeleteMember}
            />
          )}
        </aside>

        {/* 중앙: 메인 컨텐츠 */}
        <main
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 왼쪽 토글 버튼 */}
          <button
            onClick={toggleLeftSidebar}
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "#eee",
              border: "1px solid #ccc",
            }}
          >
            {isLeftSidebarCollapsed ? "▶" : "◀"}
          </button>

          {/* 상단 탭 */}
          <div style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            {[
              { key: "taskBoard", label: "작업 보드" },
              { key: "taskDetails", label: "세부 작업 내용" },
              { key: "schedule", label: "작업 일정" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderBottom:
                    activeTab === tab.key
                      ? "3px solid #4f46e5"
                      : "3px solid transparent",
                  cursor: "pointer",
                  background: "transparent",
                  fontWeight: activeTab === tab.key ? "bold" : "normal",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ProgressBar tasks={tasks} />

          {/* 탭 내용 영역 */}
          <div style={{ flex: 1, overflow: "auto", background: "#f4f7f6" }}>
            {activeTab === "taskBoard" && (
              <TaskBoard
                columns={columns}
                members={members}
                tasks={tasks}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
                onAddMemberToColumn={handleAddMemberToColumn}
                onMoveMember={handleMoveMemberBetweenColumns}
                onUpdateStatus={handleUpdateMemberStatus}
                onDeleteMember={handleDeleteMemberFromColumn} // ✅ 구현한 함수 전달
                onUpdateMemberMemo={handleUpdateMemberMemo}
                onInviteFriend={handleInviteFriendToColumn}
                onAddTask={handleAddTask}
                onSelectTask={handleSelectTask}
              />
            )}
            {activeTab === "taskDetails" && (
              <TaskDetails
                columns={columns}
                members={members}
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onUpdateTask={handleUpdateTask} // ✅ 필수 prop 전달
              />
            )}
            {activeTab === "schedule" && (
              <Schedule tasks={tasks} onUpdateTask={handleUpdateTask} />
            )}
          </div>
        </main>

        {/* 오른쪽: 채팅 */}
        <aside
          style={{
            width: isRightSidebarCollapsed ? 0 : 300,
            borderLeft: isRightSidebarCollapsed ? "none" : "1px solid #ddd",
            transition: "width 0.3s",
            background: "#fff",
          }}
        >
          <ChatBox projectId={numericProjectId} />
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Project;
