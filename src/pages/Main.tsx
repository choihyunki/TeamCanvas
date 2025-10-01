import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import ChatBox from "../components/ChatBox";
import { Member } from "../types/Member";

interface Project {
  id: number;
  name: string;
  members: { id: number; status: string }[]; // ✅ 상태 포함
}

const Main: React.FC = () => {
  const [members] = useState<Member[]>([
    { id: 1, name: "홍길동", isOnline: true, role: "프론트엔드" },
    { id: 2, name: "김철수", isOnline: false, role: "백엔드" },
    { id: 3, name: "이영희", isOnline: true, role: "디자인" },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    { id: 101, name: "프로젝트 A", members: [] },
    { id: 102, name: "프로젝트 B", members: [] },
  ]);

  const handleAddMemberToProject = (projectId: number, memberId: number) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId && !proj.members.find((m) => m.id === memberId)
          ? {
              ...proj,
              members: [...proj.members, { id: memberId, status: "작업전" }],
            } // 기본값 "작업전"
          : proj
      )
    );
  };

  const handleUpdateMemberStatus = (
    projectId: number,
    memberId: number,
    status: string
  ) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              members: proj.members.map((m) =>
                m.id === memberId ? { ...m, status } : m
              ),
            }
          : proj
      )
    );
  };

  const handleDeleteProject = (projectId: number) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== projectId));
  };

        const handleAddProject = (projectName: string) => {
    // 새로운 프로젝트 아이디 생성 (예: 현재 프로젝트 갯수 + 1)
    const newProject: Project = {
      id: projects.length > 0 ? projects[projects.length - 1].id + 1 : 1,
      name: projectName,
      members: [],
    };

    setProjects([...projects, newProject]);
  };


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Header onMenuClick={() => console.log("Menu clicked")} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside
          style={{
            width: "20%",
            borderRight: "1px solid #ddd",
            padding: "10px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <MemberList members={members} />
        </aside>

        <main
          style={{
            flex: 1,
            padding: "10px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <TaskBoard
            projects={projects}
            members={members}
            onAddMember={handleAddMemberToProject}
            onUpdateStatus={handleUpdateMemberStatus}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
          />
        </main>

        <aside
          style={{
            width: "25%",
            borderLeft: "1px solid #ddd",
            padding: "10px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <ChatBox />
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Main;
