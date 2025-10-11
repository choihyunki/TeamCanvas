import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import ChatBox from "../components/ChatBox";
import { Member } from "../types/Member";
import TaskDetails from "../components/TaskDetails";
import Schedule from "../components/Schedule";

// --- 타입 정의 ---
export interface ProjectMember {
  id: number;
  status: string;
}

export interface RoleColumn {
  id: number;
  name: string;
  members: ProjectMember[];
}

// --- 메인 컴포넌트 ---
const Project: React.FC = () => {
  // --- 상태 관리 (State) ---
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "홍길동", isOnline: true, role: "프론트엔드" },
    { id: 2, name: "김철수", isOnline: false, role: "백엔드" },
    { id: 3, name: "이영희", isOnline: true, role: "디자인" },
    { id: 4, name: "박지성", isOnline: true, role: "기획" },
  ]);

  const [columns, setColumns] = useState<RoleColumn[]>([
    { id: 101, name: "백엔드 개발", members: [] },
    { id: 102, name: "프론트엔드 개발", members: [] },
    { id: 103, name: "디자인", members: [] },
  ]);

  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('taskBoard');

  // --- 이벤트 핸들러 ---
  const toggleLeftSidebar = () => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleRightSidebar = () => setIsRightSidebarCollapsed(!isRightSidebarCollapsed);

  // MemberList 관련 핸들러
  const handleAddMember = () => {
    const newName = prompt("새 멤버의 이름을 입력하세요:");
    if (!newName) return;
    const newRole = prompt("새 멤버의 역할을 입력하세요:");
    if (!newRole) return;
    const newMember: Member = {
      id: new Date().getTime(),
      name: newName,
      role: newRole,
      isOnline: true,
    };
    setMembers((prevMembers) => [...prevMembers, newMember]);
  };
  const handleDeleteMember = (memberId: number) => {
    if (window.confirm("정말로 이 멤버를 삭제하시겠습니까?")) {
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );
    }
  };

  // TaskBoard (역할 컬럼) 관련 핸들러
  const handleAddColumn = (columnName: string) => {
    const newColumn: RoleColumn = {
      id: columns.length > 0 ? Math.max(...columns.map(c => c.id)) + 1 : 101,
      name: columnName,
      members: [],
    };
    setColumns([...columns, newColumn]);
  };

  const handleDeleteColumn = (columnId: number) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  const handleAddMemberToColumn = (columnId: number, memberId: number) => {
    const isAlreadyInColumn = columns.some(col => col.members.some(m => m.id === memberId));
    if (isAlreadyInColumn) {
      alert("이미 역할에 배정된 멤버입니다. 카드를 드래그하여 이동시켜주세요.");
      return;
    }
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, members: [...col.members, { id: memberId, status: "작업전" }] }
          : col
      )
    );
  };
  
  const handleMoveMemberBetweenColumns = (memberId: number, sourceColumnId: number, destinationColumnId: number) => {
    if (sourceColumnId === destinationColumnId) return;

    let memberToMove: ProjectMember | undefined;
    
    const columnsAfterRemoval = columns.map(col => {
      if (col.id === sourceColumnId) {
        memberToMove = col.members.find(m => m.id === memberId);
        return { ...col, members: col.members.filter(m => m.id !== memberId) };
      }
      return col;
    });

    if (memberToMove) {
      const columnsAfterAddition = columnsAfterRemoval.map(col => {
        if (col.id === destinationColumnId) {
          return { ...col, members: [...col.members, memberToMove!] };
        }
        return col;
      });
      setColumns(columnsAfterAddition);
    }
  };

  const handleUpdateMemberStatus = (columnId: number, memberId: number, status: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, members: col.members.map((m) => (m.id === memberId ? { ...m, status } : m)) }
          : col
      )
    );
  };

  const handleDeleteMemberFromColumn = (columnId: number, memberId: number) => {
    setColumns(prev =>
      prev.map(col => 
        col.id === columnId
          ? { ...col, members: col.members.filter(m => m.id !== memberId) }
          : col
      )
    );
  };

  // --- 렌더링 ---
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f4f7f6" }}>
      <Header onMenuClick={() => console.log("Menu clicked")} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* 왼쪽 사이드바 (멤버 리스트) */}
        <aside style={{ width: isLeftSidebarCollapsed ? "0px" : "15%", minWidth: isLeftSidebarCollapsed ? "0px" : "220px", padding: isLeftSidebarCollapsed ? "0" : "10px", borderRight: isLeftSidebarCollapsed ? "none" : "1px solid #ddd", transition: "all 0.3s ease-in-out", overflow: "hidden", boxSizing: "border-box", background: "#fff" }}>
          <MemberList
            members={members}
            onAddMemberClick={handleAddMember}
            onDeleteMember={handleDeleteMember}
          />
        </aside>

        {/* 중앙 컨텐츠 영역 */}
        <main style={{ flex: 1, boxSizing: "border-box", overflow: "hidden", position: "relative", display: 'flex', flexDirection: 'column' }}>
          {/* 사이드바 토글 버튼 */}
          <button onClick={toggleLeftSidebar} style={{ position: "absolute", left: isLeftSidebarCollapsed ? 10 : -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            {isLeftSidebarCollapsed ? "›" : "‹"}
          </button>
          <button onClick={toggleRightSidebar} style={{ position: "absolute", right: isRightSidebarCollapsed ? 10 : -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            {isRightSidebarCollapsed ? "‹" : "›"}
          </button>

          {/* 탭 네비게이션 */}
          <div style={{ padding: '10px 10px 0 10px', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
            <button onClick={() => setActiveTab('taskBoard')} style={{ padding: '10px 15px', border: 'none', borderBottom: activeTab === 'taskBoard' ? '3px solid #4f46e5' : '3px solid transparent', background: 'transparent', cursor: 'pointer', fontWeight: activeTab === 'taskBoard' ? 'bold' : 'normal', color: activeTab === 'taskBoard' ? '#4f46e5' : '#333' }}>
              작업 보드
            </button>
            <button onClick={() => setActiveTab('taskDetails')} style={{ padding: '10px 15px', border: 'none', borderBottom: activeTab === 'taskDetails' ? '3px solid #4f46e5' : '3px solid transparent', background: 'transparent', cursor: 'pointer', fontWeight: activeTab === 'taskDetails' ? 'bold' : 'normal', color: activeTab === 'taskDetails' ? '#4f46e5' : '#333' }}>
              세부 작업 내용
            </button>
            <button onClick={() => setActiveTab('schedule')} style={{ padding: '10px 15px', border: 'none', borderBottom: activeTab === 'schedule' ? '3px solid #4f46e5' : '3px solid transparent', background: 'transparent', cursor: 'pointer', fontWeight: activeTab === 'schedule' ? 'bold' : 'normal', color: activeTab === 'schedule' ? '#4f46e5' : '#333' }}>
              작업 일정
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 'taskBoard' && (
              <TaskBoard
                columns={columns}
                members={members}
                onAddMemberToColumn={handleAddMemberToColumn}
                onMoveMember={handleMoveMemberBetweenColumns}
                onUpdateStatus={handleUpdateMemberStatus}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
                onDeleteMember={handleDeleteMemberFromColumn}
              />
            )}
            {activeTab === 'taskDetails' && <TaskDetails />}
            {activeTab === 'schedule' && <Schedule />}
          </div>
        </main>
        
        {/* 오른쪽 사이드바 (채팅) */}
        <aside style={{ width: isRightSidebarCollapsed ? "0px" : "20%", minWidth: isRightSidebarCollapsed ? "0px" : "280px", padding: isRightSidebarCollapsed ? "0" : "10px", borderLeft: isRightSidebarCollapsed ? "none" : "1px solid #ddd", transition: "all 0.3s ease-in-out", overflow: "hidden", boxSizing: "border-box", background: "#fff" }}>
          <ChatBox />
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Project;