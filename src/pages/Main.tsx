import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import ChatBox from "../components/ChatBox";
import { Member } from "../types/Member";

// ... (ProjectMember, Project 인터페이스 정의는 이전과 동일)
interface ProjectMember {
  id: number;
  status: string;
}

interface Project {
  id: number;
  name: string;
  members: ProjectMember[];
}

const Main: React.FC = () => {
  // ... (members, projects useState는 이전과 동일)
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "홍길동", isOnline: true, role: "프론트엔드" },
    { id: 2, name: "김철수", isOnline: false, role: "백엔드" },
    { id: 3, name: "이영희", isOnline: true, role: "디자인" },
    { id: 4, name: "박지성", isOnline: true, role: "기획" },
  ]);
  const [projects, setProjects] = useState<Project[]>([
    { id: 101, name: "프로젝트 A", members: [] },
    { id: 102, name: "프로젝트 B", members: [] },
  ]);

  // ✅ 1. 접이식 사이드바를 위한 상태 추가
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  const toggleLeftSidebar = () => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleRightSidebar = () => setIsRightSidebarCollapsed(!isRightSidebarCollapsed);


  // ... (handleAddMember, handleDeleteMember 핸들러는 이전과 동일)
  const handleAddMember = () => {
    const newName = prompt("새 멤버의 이름을 입력하세요:");
    if (!newName) return;
    const newRole = prompt("새 멤버의 역할을 입력하세요:");
    if (!newRole) return;
    const newMember: Member = {
      id: new Date().getTime(), name: newName, role: newRole, isOnline: true,
    };
    setMembers((prevMembers) => [...prevMembers, newMember]);
  };
  const handleDeleteMember = (memberId: number) => {
    if (window.confirm("정말로 이 멤버를 삭제하시겠습니까?")) {
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberId));
    }
  };


  // ... (프로젝트 관련 핸들러들은 이전과 동일)
  const handleAddMemberToProject = (projectId: number, memberId: number) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId && !proj.members.find((m) => m.id === memberId)
          ? { ...proj, members: [...proj.members, { id: memberId, status: "작업전" }] }
          : proj
      )
    );
  };
  const handleUpdateMemberStatus = (projectId: number, memberId: number, status: string) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId
          ? { ...proj, members: proj.members.map((m) => (m.id === memberId ? { ...m, status } : m)) }
          : proj
      )
    );
  };
  const handleDeleteProject = (projectId: number) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== projectId));
  };
  const handleAddProject = (projectName: string) => {
    const newProject: Project = {
      id: projects.length > 0 ? projects.reduce((maxId, p) => Math.max(p.id, maxId), 0) + 1 : 101,
      name: projectName,
      members: [],
    };
    setProjects([...projects, newProject]);
  };

  // ✅ 2. 프로젝트에서 멤버를 삭제하는 핸들러 추가
  const handleDeleteMemberFromProject = (projectId: number, memberId: number) => {
    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === projectId) {
          return {
            ...proj,
            members: proj.members.filter(member => member.id !== memberId),
          };
        }
        return proj;
      })
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: '#f4f7f6' }}>
      <Header onMenuClick={() => console.log("Menu clicked")} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: 'relative' }}>
        {/* 멤버 리스트 영역 */}
        <aside
          style={{
            // ✅ 3. 사이드바 접힘 상태에 따라 스타일 동적 변경
            width: isLeftSidebarCollapsed ? "0px" : "15%",
            minWidth: isLeftSidebarCollapsed ? "0px" : "220px",
            padding: isLeftSidebarCollapsed ? "0" : "10px",
            borderRight: isLeftSidebarCollapsed ? "none" : "1px solid #ddd",
            transition: 'all 0.3s ease-in-out',
            overflow: 'hidden', // 내용이 삐져나오지 않도록
            boxSizing: "border-box",
            background: '#fff'
          }}
        >
          <MemberList
            members={members}
            onAddMemberClick={handleAddMember}
            onDeleteMember={handleDeleteMember}
          />
        </aside>

        {/* 중앙 작업 보드 영역 */}
        <main style={{ flex: 1, padding: "10px", boxSizing: "border-box", overflow: "hidden", position: 'relative' }}>
           {/* ✅ 4. 사이드바 토글 버튼 추가 */}
          <button onClick={toggleLeftSidebar} style={{ position: 'absolute', left: isLeftSidebarCollapsed ? 10 : -10, top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {isLeftSidebarCollapsed ? '›' : '‹'}
          </button>

          <TaskBoard
            projects={projects}
            members={members}
            onAddMember={handleAddMemberToProject}
            onUpdateStatus={handleUpdateMemberStatus}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            onDeleteMember={handleDeleteMemberFromProject} // ✅ 5. prop 전달
          />
          
          <button onClick={toggleRightSidebar} style={{ position: 'absolute', right: isRightSidebarCollapsed ? 10 : -10, top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {isRightSidebarCollapsed ? '‹' : '›'}
          </button>
        </main>

        {/* 채팅 영역 */}
        <aside
          style={{
            // ✅ 3. 사이드바 접힘 상태에 따라 스타일 동적 변경
            width: isRightSidebarCollapsed ? "0px" : "20%",
            minWidth: isRightSidebarCollapsed ? "0px" : "280px",
            padding: isRightSidebarCollapsed ? "0" : "10px",
            borderLeft: isRightSidebarCollapsed ? "none" : "1px solid #ddd",
            transition: 'all 0.3s ease-in-out',
            overflow: 'hidden',
            boxSizing: "border-box",
            background: '#fff'
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