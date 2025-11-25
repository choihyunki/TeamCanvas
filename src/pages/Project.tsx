import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { RoleColumn } from "../types/Project";
import { Task } from "../types/Task";

import { useAuth } from "../context/AuthContext";
import {
  getProjectsForUser,
  getProjectById,
  ProjectRecord, // [FIXED 1] ProjectRecord 임포트 추가
  getFriends,
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

  const [members, setMembers] = useState<Member[]>([]);
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);

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

  // --- 핸들러 로직 ---

  const handleAddMemberFromFriend = (friendId: number, friendName: string) => {
    if (members.some((m) => m.id === friendId)) {
      alert(`${friendName} 님은 이미 프로젝트 멤버입니다.`);
      return;
    }

    const newMember: Member = {
      id: friendId,
      name: friendName,
      isOnline: true,
    };
    setMembers((prev) => [...prev, newMember]);

    alert(`${friendName} 님을 멤버 목록에 추가했습니다!`);
  };

  const handleAddMember = () => {
    const newMemberName = prompt("추가할 멤버의 이름을 입력하세요.");

    if (newMemberName && newMemberName.trim()) {
      const trimmedName = newMemberName.trim();

      if (members.some((m) => m.name === trimmedName)) {
        alert(`${trimmedName} 님은 이미 프로젝트 멤버입니다.`);
        return;
      }

      const newMember: Member = {
        id: Date.now(),
        name: trimmedName,
        isOnline: true,
      };

      setMembers((prev) => [...prev, newMember]);
      alert(`${trimmedName} 님이 프로젝트에 추가되었습니다.`);
    } else if (newMemberName !== null) {
      alert("유효한 멤버 이름을 입력해주세요.");
    }
  };

  const handleDeleteMember = (id: number) => {
    if (window.confirm("멤버를 삭제하시겠습니까?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          members: col.members.filter((pm) => pm.id !== id),
        }))
      );
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          members: t.members.filter((name) => {
            const member = members.find((m) => m.id === id);
            return member ? name !== member.name : true;
          }),
        }))
      );
    }
  };

  const handleDeleteRoleColumn = (roleId: number) => {
    if (
      window.confirm(
        "경고: 해당 역할(로우)을 삭제하면 관련된 모든 태스크가 영구적으로 삭제됩니다. 계속하시겠습니까?"
      )
    ) {
      setColumns((prev) => prev.filter((col) => col.id !== roleId));
      setTasks((prev) => prev.filter((t) => t.columnId !== roleId));
    }
  };

  const handleAddRoleColumn = (name: string) => {
    const newRole: RoleColumn = {
      id: Date.now(),
      name: name,
      members: [],
    };
    setColumns((prev) => [...prev, newRole]);
  };

  const handleUpdateMemberStatusInRole = (
    roleId: number,
    memberId: number,
    newStatus: string
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === roleId) {
          const updatedMembers = col.members.map((pm) =>
            pm.id === memberId ? { ...pm, status: newStatus } : pm
          );
          return { ...col, members: updatedMembers };
        }
        return col;
      })
    );
  };

  const handleAddMemberToRole = (roleId: number, memberId: number) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === roleId) {
          if (col.members.some((m) => m.id === memberId)) {
            return col;
          }
          return {
            ...col,
            members: [
              ...col.members,
              { id: memberId, status: "TODO", memo: "" },
            ],
          };
        }
        return col;
      })
    );
  };

  const handleAssignMemberToTask = (taskId: number, memberId: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const memberData = members.find((m) => m.id === memberId);
          if (!memberData) return t;

          const memberName = memberData.name;

          if (t.members.includes(memberName)) {
            return {
              ...t,
              members: t.members.filter((name) => name !== memberName),
            };
          } else {
            return {
              ...t,
              members: [...t.members, memberName],
            };
          }
        }
        return t;
      })
    );
  };

  const handleAddTask = (roleId: number, status: string) => {
    const inputTitle = prompt("할 일을 입력하세요");
    if (!inputTitle) return;

    const newTask: Task = {
      id: Date.now(),
      columnId: roleId,
      status: status,
      title: inputTitle,
      members: [],
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("삭제하시겠습니까?")) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleUpdateTask = (t: Task) => {
    setTasks((prev) => prev.map((tk) => (tk.id === t.id ? t : tk)));
  };

  const handleSelectTask = (tid: number) => {
    setSelectedTaskId(tid);
    setActiveTab("taskDetails");
  };

  useEffect(() => {
    if (!token) return;
    const myList = getProjectsForUser(token);
    setMyProjects(myList.map((p) => ({ id: p.id, name: p.name })));

    setFriends(getFriends());

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
          setColumns([
            { id: 101, name: "기획팀", members: [] },
            { id: 102, name: "디자인팀", members: [] },
            { id: 103, name: "개발팀", members: [] },
          ]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, numericProjectId]);

  return (
    <div className="project-layout">
      <SlideoutSidebar
        isOpen={isSlideoutOpen}
        onClose={toggleSlideout}
        projects={myProjects}
        friends={friends}
      />

      <div
        style={{
          marginLeft: isSlideoutOpen ? "280px" : "0px",
          width: isSlideoutOpen ? "calc(100% - 280px)" : "100%",
          transition: "all 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Header onMenuClick={toggleSlideout} />

        <div className="workspace-container">
          <aside
            className={`left-sidebar ${
              isLeftSidebarCollapsed ? "collapsed" : ""
            }`}
          >
            <MemberList
              members={members}
              onAddMemberClick={handleAddMember}
              onDeleteMember={handleDeleteMember}
              onAddMemberFromFriend={handleAddMemberFromFriend}
            />
          </aside>

          <main className="project-main">
            <button className="toggle-btn left" onClick={toggleLeftSidebar}>
              {isLeftSidebarCollapsed ? "▶" : "◀"}
            </button>

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

            <div className="tab-content-area">
              {activeTab === "taskBoard" && (
                <TaskBoard
                  columns={columns}
                  tasks={tasks}
                  members={members}
                  onAddTask={handleAddTask} // [FIXED 2] handleAddTask로 수정
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onDeleteTask={handleDeleteTask}
                  onSelectTask={handleSelectTask}
                  onAddRoleColumn={handleAddRoleColumn}
                  // [REMOVED] onAddMemberToRole 제거
                  onDeleteRoleColumn={handleDeleteRoleColumn}
                  // [REMOVED] onUpdateMemberStatusInRole 제거
                  onAssignMemberToTask={handleAssignMemberToTask}
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
    </div>
  );
};

export default Project;
