import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProjectForUser, addMemberToProject } from "../data/mockDb";
import { useAuth } from "../context/AuthContext";
import "../styles/SlideoutSidebar.css";

interface Friend {
  id: number;
  name: string;
  avatarInitial: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: { id: number; name: string }[];
  friends: Friend[]; // 친구 데이터 받음
}

const SlideoutSidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  projects,
  friends,
}) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [newProjectName, setNewProjectName] = useState("");
  
  const [dragTargetId, setDragTargetId] = useState<number | null>(null);


  const handleProjectClick = (id: number) => {
    navigate(`/project/${id}`);
    onClose();
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    if (!token) return;

    const project = createProjectForUser(token, newProjectName.trim());
    
    alert("새 프로젝트가 생성되었습니다! 메인에서 목록을 확인하세요.");

    setNewProjectName("");
    navigate(`/project/${project.id}`);
    onClose();
  };

  // 드롭 핸들러: 프로젝트에 친구를 멤버로 추가
  const handleDropFriendOnProject = (e: React.DragEvent, projectId: number) => {
    e.preventDefault();
    setDragTargetId(null); 
    
    const friendName = e.dataTransfer.getData("friendName");
    
    if (friendName) {
      addMemberToProject(projectId, friendName); 
      alert(`${friendName} 님이 프로젝트 [${projectId}]에 추가되었습니다! (새로고침 필요)`);
    }
  };


  return (
    <div
      className="slideout-sidebar"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(-100%)", 
      }}
    >
      <div className="sidebar-header">
        <h3>프로젝트 & 친구</h3>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="sidebar-content">
        {/* 내 프로젝트 목록 (드롭 대상) */}
        <section className="sidebar-section">
          <h4>내 프로젝트</h4>
          {projects.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "14px" }}>프로젝트 없음</p>
          ) : (
            <ul className="sidebar-list">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="sidebar-item project-droppable"
                  onClick={() => handleProjectClick(p.id)}
                  
                  // [D&D TARGET LOGIC]
                  style={{
                      border: dragTargetId === p.id ? '1px solid #3B82F6' : '1px solid transparent',
                      backgroundColor: dragTargetId === p.id ? '#F0F7FF' : 'transparent',
                      transition: 'all 0.1s ease',
                      cursor: 'pointer'
                  }}
                  onDragEnter={() => setDragTargetId(p.id)} 
                  onDragLeave={() => setDragTargetId(null)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy'; 
                  }} 
                  onDrop={(e) => handleDropFriendOnProject(e, p.id)} 
                >
                  📁 {p.name}
                </li>
              ))}
            </ul>
          )}

          {/* 프로젝트 생성 */}
          <div className="create-project-area">
            <input
              placeholder="새 프로젝트 이름"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="sidebar-input"
            />
            <button className="sidebar-btn" onClick={handleCreateProject}>
              + 프로젝트 생성
            </button>
          </div>
        </section>

        {/* 친구 목록 (드래그 소스) */}
        <section className="sidebar-section">
          <h4>친구 목록</h4>
          <ul className="sidebar-list">
            {friends.map((f) => (
              <li 
                key={f.id} 
                className="sidebar-item friend-item"
                draggable="true" 
                // [D&D SOURCE LOGIC]
                onDragStart={(e) => { 
                    e.dataTransfer.setData("friendId", f.id.toString());
                    e.dataTransfer.setData("friendName", f.name); // 이름 문자열 전달
                    e.dataTransfer.effectAllowed = "copy"; 
                }}
              >
                <div className="friend-avatar">{f.avatarInitial}</div>
                <span>{f.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SlideoutSidebar;