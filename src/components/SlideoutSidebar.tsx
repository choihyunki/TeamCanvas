import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProjectForUser } from "../data/mockDb";
import { useAuth } from "../context/AuthContext";
import "../styles/SlideoutSidebar.css"; // CSS import

interface Friend {
  id: number;
  name: string;
  avatarInitial: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: { id: number; name: string }[];
  friends: Friend[];
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

  const handleProjectClick = (id: number) => {
    navigate(`/project/${id}`);
    onClose();
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    if (!token) return;

    const project = createProjectForUser(token, newProjectName.trim());
    alert("프로젝트가 생성되었습니다!");

    setNewProjectName("");
    navigate(`/project/${project.id}`);
    onClose();
  };

  return (
    <div
      className="slideout-sidebar"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(-100%)", // 동적 스타일 유지
      }}
    >
      <div className="sidebar-header">
        <h3>프로젝트 & 친구</h3>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="sidebar-content">
        {/* 내 프로젝트 목록 */}
        <section className="sidebar-section">
          <h4>내 프로젝트</h4>
          {projects.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "14px" }}>프로젝트 없음</p>
          ) : (
            <ul className="sidebar-list">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="sidebar-item"
                  onClick={() => handleProjectClick(p.id)}
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

        {/* 친구 목록 */}
        <section className="sidebar-section">
          <h4>친구 목록</h4>
          <ul className="sidebar-list">
            {friends.map((f) => (
              <li key={f.id} className="sidebar-item friend-item">
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
