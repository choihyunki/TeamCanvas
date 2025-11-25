import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SlideoutSidebar from "../components/SlideoutSidebar";
import { useAuth } from "../context/AuthContext";
import ProjectService from "../services/ProjectService"; // 서비스 사용
import {
  getProjectsForUser,
  createProjectForUser,
  deleteProject,
  ProjectRecord,
  getFriends,
  Friend, // Friend 인터페이스 임포트
} from "../data/mockDb";
import "../styles/Main.css";

// 임시 타입: 프로젝트 데이터에 진행률을 추가합니다.
type ProjectCardData = ProjectRecord & { progressPercent: number };

const Main: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const [friends, setFriends] = useState<Friend[]>([]);

  // [MODIFIED] 프로젝트 데이터를 Mock DB에서 불러와 상태를 업데이트하는 재사용 함수
  const fetchProjects = async () => {
    if (!token) return;
    try {
      // 🔥 mock 함수 대신 Service 호출
      const list = await ProjectService.getMyProjects(token);

      // 진행률 계산 로직 등은 필요하다면 여기서 가공하거나 서버에서 처리
      // 일단 그대로 넣습니다.
      const formattedList = list.map((p: any) => ({
        ...p,
        id: p._id, // MongoDB는 id가 _id로 옴
        progressPercent: 0, // 임시 0% (나중에 로직 추가 가능)
      }));

      setProjects(formattedList);
    } catch (e) {
      console.error("프로젝트 로드 실패", e);
    }
  };

  const handleCreateProject = async () => {
    if (!token) return alert("로그인 필요");
    const name = newProjectName.trim();
    if (!name) return alert("이름 입력 필요");

    try {
      // 🔥 진짜 서버에 생성 요청
      await ProjectService.createProject(token, name, newProjectDesc.trim());

      fetchProjects(); // 목록 새로고침
      setNewProjectName("");
      setNewProjectDesc("");
      alert("생성 완료!");
    } catch (e) {
      alert("생성 실패");
    }
  };

  // [MODIFIED] 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProjects();
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEnterProject = (id: number) => {
    navigate(`/project/${id}`);
  };

  const handleDeleteProject = (id: number) => {
    if (window.confirm("정말 이 프로젝트를 삭제하시겠습니까?")) {
      deleteProject(id);
      fetchProjects();
    }
  };

  return (
    <div className="main-container">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <SlideoutSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        friends={friends}
      />

      <div
        style={{
          marginLeft: isSidebarOpen ? "280px" : "0px",
          width: isSidebarOpen ? "calc(100% - 280px)" : "100%",
          transition: "all 0.3s ease-in-out",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main className="main-content">
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

          {/* 오른쪽 영역 */}
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
                      <p className="card-desc">
                        {p.description || "설명 없음"}
                      </p>

                      <p className="card-meta">
                        멤버: {p.members?.length ?? 0}명
                      </p>

                      <p className="card-progress">
                        진행률 : <strong>{p.progressPercent}%</strong>
                      </p>

                      <div className="progress-track-mini">
                        <div
                          className="progress-fill-mini"
                          style={{ width: `${p.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="card-actions">
                      <button
                        onClick={() => handleEnterProject(p.id)}
                        className="enter-project-btn"
                        title="프로젝트로 이동"
                      >
                        들어가기
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="delete-project-btn"
                        title="프로젝트 영구 삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Main;
