import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import ChatBox from "../components/ChatBox";

interface Member {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  members: { id: number; status: string }[]; // ✅ 상태 포함
}

const Main: React.FC = () => {
  const [members] = useState<Member[]>([
    { id: 1, name: "홍길동" },
    { id: 2, name: "김철수" },
    { id: 3, name: "이영희" },
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
