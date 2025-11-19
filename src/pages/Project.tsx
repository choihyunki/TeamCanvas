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

import "../styles/Project.css"; // CSS import

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
  const [tasks, setTasks] = useState<Task[]>([]);
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
  // const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false); // 필요시 사용
  const isRightSidebarCollapsed = false; // 지금은 항상 열림으로 둠

  const [activeTab, setActiveTab] = useState("taskBoard");

  const toggleLeftSidebar = () =>
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen);

  // ... (핸들러 함수들은 이전과 동일하므로 생략하거나,
  //      아까 보내주신 코드에서 로직 부분만 그대로 유지해주세요.
  //      여기서는 CSS 적용을 위한 return 부분 위주로 보여드립니다.)

  // (핸들러 로직 생략: handleAddMember, handleDeleteMember, handleAddColumn 등...
  //  위에서 완성해드린 로직 그대로 사용하시면 됩니다.)

  // 👇 간략화를 위해 핸들러 로직 부분은 "..." 으로 표시했습니다.
  // 실제 파일엔 아까 수정한 로직을 그대로 두세요!
  const handleAddMember = () => {
    /* ... */
  };
  const handleDeleteMember = (id: number) => {
    /* ... */
  };
  const handleAddColumn = (name: string) => {
    /* ... */
  };
  const handleDeleteColumn = (id: number) => {
    /* ... */
  };
  const handleAddMemberToColumn = (cid: number, mid: number) => {
    /* ... */
  };
  const handleDeleteMemberFromColumn = (cid: number, mid: number) => {
    /* ... */
  };
  const handleInviteFriendToColumn = (
    cid: number,
    fid: string,
    fname: string
  ) => {
    /* ... */
  };
  const handleMoveMemberBetweenColumns = (
    mid: number,
    from: number,
    to: number
  ) => {
    /* ... */
  };
  const handleUpdateMemberStatus = (cid: number, mid: number, st: string) => {
    /* ... */
  };
  const handleUpdateMemberMemo = (cid: number, mid: number, memo: string) => {
    /* ... */
  };
  const handleAddTask = (cid: number, title: string) => {
    /* ... */
  };
  const handleSelectTask = (tid: number) => {
    setSelectedTaskId(tid);
    setActiveTab("taskDetails");
  };
  const handleUpdateTask = (t: Task) => {
    setTasks((prev) => prev.map((tk) => (tk.id === t.id ? t : tk)));
  };

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
        if (columns.length === 0) {
          // 초기화 방지용 체크
          setColumns([
            { id: 101, name: "기획", members: [] },
            { id: 102, name: "개발", members: [] },
            { id: 103, name: "테스트", members: [] },
          ]);
        }
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
        style={{ marginLeft: isSlideoutOpen ? 280 : 0 }} // Slideout은 transform이라 마진 조정 필요
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
