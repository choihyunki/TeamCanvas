import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  getProjectsForUser,
  createProjectForUser,
  ProjectRecord,
} from "../data/mockDb";
import "../styles/Main.css"; // CSS import

const Main: React.FC = () => {
  const { token, logout } = useAuth(); // token = username
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const list = getProjectsForUser(token);
    setProjects(list);
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEnterProject = (id: number) => {
    navigate(`/project/${id}`);
  };

  const handleCreateProject = () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    const name = newProjectName.trim();
    if (!name) {
      alert("프로젝트 이름을 입력해주세요.");
      return;
    }

    const created = createProjectForUser(token, name, newProjectDesc.trim());
    setProjects((prev) => [...prev, created]);

    setNewProjectName("");
    setNewProjectDesc("");
    navigate(`/project/${created.id}`);
  };

  return (
    <div className="main-container">
      <Header onMenuClick={() => {}} />

      <main className="main-content">
        {/* 왼쪽 영역: 유저 정보 및 생성 */}
        <section className="profile-section">
          <div>
            <h2 className="welcome-title">환영합니다 👋</h2>
            <p className="user-info-text">
              계정: <strong>{token}</strong>
            </p>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            로그아웃
          </button>

          <hr className="divider" />

          <div>
            <h3 className="new-project-title">새 프로젝트 만들기</h3>
            <input
              className="input-field"
              placeholder="프로젝트 이름"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <textarea
              className="textarea-field"
              placeholder="프로젝트 설명 (선택)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />
            <button onClick={handleCreateProject} className="create-btn">
              + 프로젝트 생성
            </button>
          </div>
        </section>

        {/* 오른쪽 영역: 프로젝트 목록 */}
        <section className="projects-section">
          <div className="projects-header">
            <h2 className="projects-title">내 프로젝트</h2>
            <span className="projects-count">총 {projects.length}개</span>
          </div>

          {projects.length === 0 ? (
            <p className="empty-msg">
              아직 생성된 프로젝트가 없습니다. 왼쪽에서 새 프로젝트를
              만들어보세요.
            </p>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => (
                <div key={p.id} className="project-card">
                  <div>
                    <h3 className="card-title">{p.name}</h3>
                    <p className="card-desc">{p.description || "설명 없음"}</p>
                    <p className="card-meta">
                      멤버: {p.members?.length ?? 0}명
                    </p>
                  </div>

                  <button
                    onClick={() => handleEnterProject(p.id)}
                    className="enter-project-btn"
                  >
                    프로젝트 들어가기
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Main;
