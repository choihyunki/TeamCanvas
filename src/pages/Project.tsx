import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TaskBoard from "../components/TaskBoard";
import ChatBox from "../components/ChatBox";
import TaskDetails from "../components/TaskDetails";
import Schedule from "../components/Schedule";
import SlideoutSidebar from "../components/SlideoutSidebar";
import { Member } from "../types/Member";
import { RoleColumn, ProjectMember } from "../types/Project";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getProjectsForUser,
  ProjectRecord,
  addMemberToProject,
  removeMemberFromProject,
} from "../data/mockDb";

// --- 타입 정의 ---
interface Friend {
  id: number;
  name: string;
  avatarInitial: string;
}

// --- 메인 프로젝트 컴포넌트 ---
const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth(); // username
  const [currentProject, setCurrentProject] = useState<ProjectRecord | null>(
    null
  );
  const numericProjectId = projectId ? Number(projectId) : null;

  // --- 상태 관리 ---
  const [members, setMembers] = useState<Member[]>([]);
  const [columns, setColumns] = useState<RoleColumn[]>([]);
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

  // --- 이벤트 핸들러 ---
  const toggleLeftSidebar = () =>
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleRightSidebar = () =>
    setIsRightSidebarCollapsed(!isRightSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen);

  const handleInviteFriendToColumn = (
    columnId: number,
    friendId: string,
    friendName: string
  ) => {
    const id = parseInt(friendId, 10);
    const isAlreadyMember = members.some((member) => member.id === id);
    const targetColumn = columns.find((col) => col.id === columnId);
    const isAlreadyInThisColumn = targetColumn?.members.some(
      (m) => m.id === id
    );

    if (isAlreadyInThisColumn) {
      alert("이 역할에는 이미 배정된 멤버입니다.");
      return;
    }

    if (window.confirm(`${friendName}님을 이 역할에 초대하시겠습니까?`)) {
      if (!isAlreadyMember) {
        const newMember: Member = {
          id,
          name: friendName,
          isOnline: false,
          role: "팀원",
        };
        setMembers((prev) => [...prev, newMember]);
      }
      if (numericProjectId !== null) {
        addMemberToProject(numericProjectId, friendName);
      }

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, members: [...col.members, { id, status: "작업전" }] }
            : col
        )
      );
    }
  };

  const handleAddMember = () => {
    const newName = prompt("새 멤버의 이름을 입력하세요:");
    if (!newName) return;

    const trimmed = newName.trim();
    if (!trimmed) return;

    const newMember: Member = {
      id: new Date().getTime(),
      name: trimmed,
      isOnline: true,
    };

    setMembers((prevMembers) => [...prevMembers, newMember]);

    // 🔹 가짜 DB에도 멤버 추가
    if (numericProjectId !== null) {
      addMemberToProject(numericProjectId, trimmed);
    }
  };

  const handleDeleteMember = (memberId: number) => {
    if (!window.confirm("정말로 이 멤버를 삭제하시겠습니까?")) return;

    // 🔹 DB에서 제거할 이름 찾기
    const target = members.find((m) => m.id === memberId);
    if (target && numericProjectId !== null) {
      removeMemberFromProject(numericProjectId, target.name);
    }

    // 🔹 화면 상태에서도 제거
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.id !== memberId)
    );
  };

  const handleAddColumn = (columnName: string) => {
    const newColumn: RoleColumn = {
      id: columns.length > 0 ? Math.max(...columns.map((c) => c.id)) + 1 : 101,
      name: columnName,
      members: [],
    };
    setColumns([...columns, newColumn]);
  };

  const handleDeleteColumn = (columnId: number) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  const handleAddMemberToColumn = (columnId: number, memberId: number) => {
    const destinationColumn = columns.find((col) => col.id === columnId);
    if (!destinationColumn) return;
    const isAlreadyInThisColumn = destinationColumn.members.some(
      (m) => m.id === memberId
    );
    if (isAlreadyInThisColumn) {
      alert("이 역할에는 이미 배정된 멤버입니다.");
      return;
    }
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              members: [...col.members, { id: memberId, status: "작업전" }],
            }
          : col
      )
    );
  };

  const handleMoveMemberBetweenColumns = (
    memberId: number,
    sourceColumnId: number,
    destinationColumnId: number
  ) => {
    if (sourceColumnId === destinationColumnId) return;
    let memberToMove: ProjectMember | undefined;
    const columnsAfterRemoval = columns.map((col) => {
      if (col.id === sourceColumnId) {
        memberToMove = col.members.find((m) => m.id === memberId);
        return {
          ...col,
          members: col.members.filter((m) => m.id !== memberId),
        };
      }
      return col;
    });
    if (memberToMove) {
      const columnsAfterAddition = columnsAfterRemoval.map((col) => {
        if (col.id === destinationColumnId) {
          return { ...col, members: [...col.members, memberToMove!] };
        }
        return col;
      });
      setColumns(columnsAfterAddition);
    }
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

  const handleDeleteMemberFromColumn = (columnId: number, memberId: number) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, members: col.members.filter((m) => m.id !== memberId) }
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

  // 🔹 로그인한 유저의 프로젝트 목록 + 현재 프로젝트 세팅
  useEffect(() => {
    if (!token) return;

    // 1) 이 유저의 프로젝트 목록을 mockDb에서 조회
    const list = getProjectsForUser(token);

    // SlideoutSidebar에 줄 "내 프로젝트" 목록
    setMyProjects(
      list.map((p) => ({
        id: p.id,
        name: p.name,
      }))
    );

    // 2) 현재 URL에서 projectId 읽어서 해당 프로젝트 찾기
    let current = list[0]; // 기본값: 첫 번째 프로젝트
    if (projectId) {
      const idNum = Number(projectId);
      const matched = list.find((p) => p.id === idNum);
      if (matched) {
        current = matched;
      }
    }

    if (!current) return;

    setCurrentProject(current);

    // 3) 프로젝트 멤버 이름 배열 → Member[]로 변환
    const mappedMembers: Member[] = current.members.map((name, idx) => ({
      id: idx + 1,
      name,
      isOnline: true,
      role: undefined,
    }));

    setMembers(mappedMembers);
  }, [token, projectId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "#f4f7f6",
      }}
    >
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
          overflow: "hidden",
          position: "relative",
          marginLeft: isSlideoutOpen ? "280px" : "0px",
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        <aside
          style={{
            width: isLeftSidebarCollapsed ? "0px" : "15%",
            minWidth: isLeftSidebarCollapsed ? "0px" : "220px",
            padding: isLeftSidebarCollapsed ? "0" : "10px",
            borderRight: isLeftSidebarCollapsed ? "none" : "1px solid #ddd",
            transition: "all 0.3s ease-in-out",
            overflow: "hidden",
            boxSizing: "border-box",
            background: "#fff",
          }}
        >
          <MemberList
            members={members}
            onAddMemberClick={handleAddMember}
            onDeleteMember={handleDeleteMember}
          />
        </aside>

        <main
          style={{
            flex: 1,
            boxSizing: "border-box",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            onClick={toggleLeftSidebar}
            style={{
              position: "absolute",
              left: isLeftSidebarCollapsed ? 10 : -10,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {isLeftSidebarCollapsed ? "›" : "‹"}
          </button>
          <button
            onClick={toggleRightSidebar}
            style={{
              position: "absolute",
              right: isRightSidebarCollapsed ? 10 : -10,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {isRightSidebarCollapsed ? "‹" : "›"}
          </button>

          <div
            style={{
              padding: "10px 10px 0 10px",
              borderBottom: "1px solid #ddd",
              flexShrink: 0,
              background: "#fff",
            }}
          >
            {/* 🔹 현재 프로젝트 정보 헤더 */}
            {currentProject ? (
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {currentProject.name}
                  </h2>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "420px",
                    }}
                    title={currentProject.description || ""}
                  >
                    {currentProject.description || "프로젝트 설명이 없습니다."}
                  </p>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    color: "#6b7280",
                    minWidth: "140px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    멤버 {currentProject.members.length}명
                  </div>
                  <div
                    style={{
                      maxWidth: "220px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={currentProject.members.join(", ")}
                  >
                    {currentProject.members.join(", ")}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: "8px",
                  fontSize: "13px",
                  color: "#9ca3af",
                }}
              >
                프로젝트 정보를 불러오는 중입니다...
              </div>
            )}

            {/* 🔹 탭 버튼들 */}
            <button
              onClick={() => setActiveTab("taskBoard")}
              style={{
                padding: "10px 15px",
                border: "none",
                borderBottom:
                  activeTab === "taskBoard"
                    ? "3px solid #4f46e5"
                    : "3px solid transparent",
                background: "transparent",
                cursor: "pointer",
                fontWeight: activeTab === "taskBoard" ? "bold" : "normal",
                color: activeTab === "taskBoard" ? "#4f46e5" : "#333",
              }}
            >
              작업 보드
            </button>
            <button
              onClick={() => setActiveTab("taskDetails")}
              style={{
                padding: "10px 15px",
                border: "none",
                borderBottom:
                  activeTab === "taskDetails"
                    ? "3px solid #4f46e5"
                    : "3px solid transparent",
                background: "transparent",
                cursor: "pointer",
                fontWeight: activeTab === "taskDetails" ? "bold" : "normal",
                color: activeTab === "taskDetails" ? "#4f46e5" : "#333",
              }}
            >
              세부 작업 내용
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              style={{
                padding: "10px 15px",
                border: "none",
                borderBottom:
                  activeTab === "schedule"
                    ? "3px solid #4f46e5"
                    : "3px solid transparent",
                background: "transparent",
                cursor: "pointer",
                fontWeight: activeTab === "schedule" ? "bold" : "normal",
                color: activeTab === "schedule" ? "#4f46e5" : "#333",
              }}
            >
              작업 일정
            </button>
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {activeTab === "taskBoard" && (
              <TaskBoard
                columns={columns}
                members={members}
                onAddMemberToColumn={handleAddMemberToColumn}
                onMoveMember={handleMoveMemberBetweenColumns}
                onUpdateStatus={handleUpdateMemberStatus}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
                onDeleteMember={handleDeleteMemberFromColumn}
                onUpdateMemberMemo={handleUpdateMemberMemo}
                onInviteFriend={handleInviteFriendToColumn}
              />
            )}
            {activeTab === "taskDetails" && (
              <TaskDetails
                columns={columns}
                members={members}
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onUpdateTask={handleUpdateTask}
              />
            )}
            {activeTab === "schedule" && <Schedule />}
          </div>
        </main>

        <aside
          style={{
            width: isRightSidebarCollapsed ? "0px" : "20%",
            minWidth: isRightSidebarCollapsed ? "0px" : "280px",
            padding: isRightSidebarCollapsed ? "0" : "10px",
            borderLeft: isRightSidebarCollapsed ? "none" : "1px solid #ddd",
            transition: "all 0.3s ease-in-out",
            overflow: "hidden",
            boxSizing: "border-box",
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
