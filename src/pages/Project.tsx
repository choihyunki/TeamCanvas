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
import ChatBox from "../components/ChatBox";

import { Member } from "../types/Member";
// 🔥 [수정 1] SubTask 타입 import 추가
import { RoleColumn, ProjectMember, SubTask } from "../types/Project";
import { Task } from "../types/Task";

import { useAuth } from "../context/AuthContext";
import {
  getProjectsForUser,
  getProjectById,
  ProjectRecord,
  addMemberToProject,
  removeMemberFromProject,
} from "../data/mockDb";

import "../styles/Project.css";

interface Friend {
  id: number;
  name: string;
  avatarInitial: string;
}

const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const numericProjectId = projectId ? Number(projectId) : null;

  const { token } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setCurrentProject] = useState<ProjectRecord | null>(null);

  // --- 상태 관리 ---
  const [members, setMembers] = useState<Member[]>([]);
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]); // (구) 태스크 - 에러 방지용 유지
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [friends] = useState<Friend[]>([
    { id: 201, name: "김유신", avatarInitial: "김" },
    { id: 202, name: "이순신", avatarInitial: "이" },
  ]);

  const [myProjects, setMyProjects] = useState<{ id: number; name: string }[]>(
    []
  );
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const isRightSidebarCollapsed = false;

  const [activeTab, setActiveTab] = useState("taskBoard");

  const toggleLeftSidebar = () =>
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen);

  // --- Handlers ---

  // 🔥 [수정 2] 멤버를 '컬럼(작업 보드)'에 드롭했을 때 (subTasks 초기화 추가)
  const handleDropMemberOnColumn = (columnId: number, memberId: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const targetColumn = columns.find((col) => col.id === columnId);
    if (!targetColumn) return;

    if (targetColumn.members.some((m) => m.id === memberId)) {
      alert(`${member.name}님은 이미 이 작업 보드에 배정되어 있습니다.`);
      return;
    }

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              // 🔥 subTasks: [] 추가
              members: [
                ...col.members,
                { id: memberId, status: "작업전", subTasks: [] },
              ],
            }
          : col
      )
    );
  };

  // 🔥 세부 작업 추가 핸들러
  const handleAddSubTask = (
    columnId: number,
    memberId: number,
    content: string
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          members: col.members.map((m) => {
            if (m.id !== memberId) return m;
            const newSubTask: SubTask = {
              id: Date.now(),
              content,
              completed: false,
            };
            const currentSubTasks = m.subTasks || [];
            return { ...m, subTasks: [...currentSubTasks, newSubTask] };
          }),
        };
      })
    );
  };

  // 🔥 세부 작업 완료 토글 핸들러
  const handleToggleSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          members: col.members.map((m) => {
            if (m.id !== memberId) return m;
            return {
              ...m,
              subTasks: m.subTasks.map((t) =>
                t.id === subTaskId ? { ...t, completed: !t.completed } : t
              ),
            };
          }),
        };
      })
    );
  };

  // 🔥 세부 작업 삭제 핸들러
  const handleDeleteSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          members: col.members.map((m) => {
            if (m.id !== memberId) return m;
            return {
              ...m,
              subTasks: m.subTasks.filter((t) => t.id !== subTaskId),
            };
          }),
        };
      })
    );
  };

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
            ? // 🔥 subTasks: [] 추가
              {
                ...col,
                members: [
                  ...col.members,
                  { id, status: "작업전", subTasks: [] },
                ],
              }
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

    if (numericProjectId !== null) {
      addMemberToProject(numericProjectId, trimmed);
    }
  };

  const handleDeleteMember = (memberId: number) => {
    if (!window.confirm("정말로 이 멤버를 삭제하시겠습니까?")) return;

    const target = members.find((m) => m.id === memberId);
    if (target && numericProjectId !== null) {
      removeMemberFromProject(numericProjectId, target.name);
    }

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
              // 🔥 subTasks: [] 추가
              members: [
                ...col.members,
                { id: memberId, status: "작업전", subTasks: [] },
              ],
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

  const handleSelectTask = (tid: number) => {
    setSelectedTaskId(tid);
    setActiveTab("taskDetails");
  };

  const handleUpdateTask = (t: Task) => {
    setTasks((prev) => prev.map((tk) => (tk.id === t.id ? t : tk)));
  };

  // --- 초기 데이터 로드 ---
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
            id: idx + 1000,
            name,
            isOnline: true,
          }))
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, numericProjectId]);

  return (
    <div className="project-layout">
      <Header onMenuClick={toggleSlideout} />

      <SlideoutSidebar
        isOpen={isSlideoutOpen}
        onClose={toggleSlideout}
        projects={myProjects}
        friends={friends}
      />

      <div
        className="workspace-container"
        style={{ marginLeft: isSlideoutOpen ? 280 : 0 }}
      >
        {/* 왼쪽 사이드바 */}
        <aside
          className={`left-sidebar ${
            isLeftSidebarCollapsed ? "collapsed" : ""
          }`}
        >
          <MemberList
            members={members}
            onAddMemberClick={handleAddMember}
            onDeleteMember={handleDeleteMember}
          />
        </aside>

        {/* 메인 영역 */}
        <main className="project-main">
          {/* 왼쪽 토글 버튼 */}
          <button className="toggle-btn left" onClick={toggleLeftSidebar}>
            {isLeftSidebarCollapsed ? "▶" : "◀"}
          </button>

          {/* 탭 헤더 */}
          <div className="tabs-container">
            {[
              { key: "taskBoard", label: "작업 보드" },
              { key: "taskDetails", label: "세부 작업 내용" },
              { key: "schedule", label: "작업 일정" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ProgressBar tasks={tasks} />

          {/* 탭 내용 */}
          <div className="tab-content-area">
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
                onDeleteMember={handleDeleteMemberFromColumn}
                onUpdateMemberMemo={handleUpdateMemberMemo}
                onInviteFriend={handleInviteFriendToColumn}
                onAddTask={handleAddTask}
                onSelectTask={handleSelectTask}
                onDropMemberOnColumn={handleDropMemberOnColumn}
              />
            )}
            {activeTab === "taskDetails" && (
              <TaskDetails
                columns={columns}
                members={members}
                // 🔥 [수정 3] TaskDetails에 불필요한 props 제거
                onAddSubTask={handleAddSubTask}
                onToggleSubTask={handleToggleSubTask}
                onDeleteSubTask={handleDeleteSubTask}
              />
            )}
            {activeTab === "schedule" && (
              <Schedule tasks={tasks} onUpdateTask={handleUpdateTask} />
            )}
          </div>
        </main>

        {/* 오른쪽 채팅 사이드바 */}
        <aside
          className={`right-sidebar ${
            isRightSidebarCollapsed ? "collapsed" : ""
          }`}
        >
          <ChatBox projectId={numericProjectId} />
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Project;
