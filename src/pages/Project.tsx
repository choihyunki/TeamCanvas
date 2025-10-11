import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import { RoleColumn, ProjectMember } from "../types/Project";
import ChatBox from "../components/ChatBox";
import { Member } from "../types/Member";
import TaskDetails from "../components/TaskDetails";
import Schedule from "../components/Schedule";
import SlideoutSidebar from "../components/SlideoutSidebar"; // ✅ 1. 슬라이드 바 임포트

// ✅ 2. 친구 데이터 타입을 추가합니다.
interface Friend {
  id: number;
  name: string;
  avatarInitial: string;
}

const Project: React.FC = () => {
  // --- 상태 관리 (State) ---
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "홍길동", isOnline: true, role: "프론트엔드" },
    { id: 4, name: "박지성", isOnline: true, role: "기획" },
  ]);

  const [columns, setColumns] = useState<RoleColumn[]>([
    { id: 101, name: "백엔드 개발", members: [] },
    { id: 102, name: "프론트엔드 개발", members: [] },
    { id: 103, name: "디자인", members: [] },
  ]);

  // ✅ 3. 친구, 프로젝트, 슬라이드 바 관련 상태 추가
  const [friends, setFriends] = useState<Friend[]>([
    { id: 201, name: "김유신", avatarInitial: '김' },
    { id: 202, name: "이순신", avatarInitial: '이' },
  ]);
  const [myProjects, setMyProjects] = useState([
    { id: 1, name: "TeamCanvas 개발" },
    { id: 2, name: "사이드 프로젝트" },
  ]);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isDraggingOverInviteArea, setIsDraggingOverInviteArea] = useState(false);
  
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('taskBoard');

  // --- 이벤트 핸들러 ---
  const toggleLeftSidebar = () => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleRightSidebar = () => setIsRightSidebarCollapsed(!isRightSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen); // ✅ 슬라이드 바 토글 함수

  // ✅ 4. 친구 초대 관련 핸들러 추가
  const handleInviteFriend = (friendId: string, friendName: string) => {
    const id = parseInt(friendId, 10);
    if (members.some(member => member.id === id)) {
      alert("이미 프로젝트에 참여 중인 멤버입니다.");
      return;
    }
    if (window.confirm(`${friendName}님을 이 프로젝트에 초대하시겠습니까?`)) {
      const newMember: Member = {
        id: id,
        name: friendName,
        isOnline: false,
        role: "팀원",
      };
      setMembers(prev => [...prev, newMember]);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // 친구 ID가 있을 때만 드롭 존 활성화
    if (e.dataTransfer.types.includes("friendid")) {
      setIsDraggingOverInviteArea(true);
    }
  };
  const handleDragLeave = () => setIsDraggingOverInviteArea(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverInviteArea(false);
    const friendId = e.dataTransfer.getData("friendId");
    const friendName = e.dataTransfer.getData("friendName");
    if (friendId && friendName) {
      handleInviteFriend(friendId, friendName);
    }
  };

  // ... (기존의 모든 핸들러 함수들은 그대로 유지)
  const handleAddMember = () => { /* 이전과 동일 */ };
  const handleDeleteMember = (memberId: number) => { /* 이전과 동일 */ };
  const handleAddColumn = (columnName: string) => { /* 이전과 동일 */ };
  const handleDeleteColumn = (columnId: number) => { /* 이전과 동일 */ };
  const handleAddMemberToColumn = (columnId: number, memberId: number) => { /* 이전과 동일 */ };
  const handleMoveMemberBetweenColumns = (memberId: number, sourceColumnId: number, destinationColumnId: number) => { /* 이전과 동일 */ };
  const handleUpdateMemberStatus = (columnId: number, memberId: number, status: string) => { /* 이전과 동일 */ };
  const handleDeleteMemberFromColumn = (columnId: number, memberId: number) => { /* 이전과 동일 */ };
  const handleUpdateMemberMemo = (columnId: number, memberId: number, memo: string) => { /* 이전과 동일 */ };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f4f7f6" }}>
      {/* ✅ Header에 onMenuClick 연결 */}
      <Header onMenuClick={toggleSlideout} />
      
      {/* ✅ SlideoutSidebar 렌더링 */}
      <SlideoutSidebar 
        isOpen={isSlideoutOpen} 
        onClose={toggleSlideout}
        projects={myProjects}
        friends={friends}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* ... (왼쪽 MemberList 사이드바는 이전과 동일) ... */}
        <aside style={{ width: isLeftSidebarCollapsed ? "0px" : "15%", minWidth: isLeftSidebarCollapsed ? "0px" : "220px", padding: isLeftSidebarCollapsed ? "0" : "10px", borderRight: isLeftSidebarCollapsed ? "none" : "1px solid #ddd", transition: "all 0.3s ease-in-out", overflow: "hidden", boxSizing: "border-box", background: "#fff" }}>
          <MemberList
            members={members}
            onAddMemberClick={handleAddMember}
            onDeleteMember={handleDeleteMember}
          />
        </aside>

        {/* ✅ 중앙 컨텐츠 영역에 드래그 앤 드롭 핸들러 및 스타일 추가 */}
        <main
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            flex: 1,
            boxSizing: "border-box",
            overflow: "hidden",
            position: "relative",
            display: 'flex',
            flexDirection: 'column',
            border: isDraggingOverInviteArea ? '3px dashed #4f46e5' : '3px dashed transparent',
            borderRadius: '10px',
            transition: 'border 0.2s ease-in-out',
          }}
        >
          {/* ... (나머지 코드는 모두 동일) ... */}
           <button onClick={toggleLeftSidebar} style={{ position: "absolute", left: isLeftSidebarCollapsed ? 10 : -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            {isLeftSidebarCollapsed ? "›" : "‹"}
          </button>
          <button onClick={toggleRightSidebar} style={{ position: "absolute", right: isRightSidebarCollapsed ? 10 : -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            {isRightSidebarCollapsed ? "‹" : "›"}
          </button>

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
                onUpdateMemberMemo={handleUpdateMemberMemo}
              />
            )}
            {activeTab === 'taskDetails' && <TaskDetails />}
            {activeTab === 'schedule' && <Schedule />}
          </div>
        </main>
        
        {/* ... (오른쪽 ChatBox 사이드바는 이전과 동일) ... */}
        <aside style={{ width: isRightSidebarCollapsed ? "0px" : "20%", minWidth: isRightSidebarCollapsed ? "0px" : "280px", padding: isRightSidebarCollapsed ? "0" : "10px", borderLeft: isRightSidebarCollapsed ? "none" : "1px solid #ddd", transition: "all 0.3s ease-in-out", overflow: "hidden", boxSizing: "border-box", background: "#fff" }}>
          <ChatBox />
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Project;