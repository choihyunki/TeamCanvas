import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  getProjectsForUser,
  createProjectForUser,
  ProjectRecord,
} from "../data/mockDb";

type Project = ProjectRecord;

const Main: React.FC = () => {
  const { logout, token } = useAuth(); // 🔹 token 추가
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [error, setError] = useState("");

  const handleNavigateToProject = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  // ✅ 로그인한 유저의 프로젝트를 가짜 DB에서 가져오기
  useEffect(() => {
    if (!token) return;
    const list = getProjectsForUser(token);
    setProjects(list);
    setSelectedProject(list[0] ?? null);
  }, [token]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCreateProject = () => {
    if (newProjectName.trim() === "") {
      setError("프로젝트 이름을 입력해주세요!");
      return;
    }

    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/");
      return;
    }

    // 🔹 mockDb에 실제로 프로젝트 생성
    const newProject = createProjectForUser(
      token,
      newProjectName.trim(),
      "새로 생성된 프로젝트입니다."
    );

      // ✅ 새 프로젝트 자동 반영 및 선택
      setProjects((prev) => [...prev, created]);
      setSelectedProject(created);

      // ✅ UI 정리
      setNewProjectName("");
      setError("");
      setShowModal(false);
    } catch (err) {
      console.error("❌ 프로젝트 생성 실패:", err);
      setError("프로젝트 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      <Header onMenuClick={() => console.log("Menu clicked")} />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 20px",
          fontSize: "14px",
        }}
      >
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          로그아웃
        </button>
      </div>

      <main
        style={{
          flex: 1,
          display: "flex",
          padding: "20px",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ✅ 왼쪽 프로젝트 리스트 */}
        <aside
          style={{
            width: "25%",
            minWidth: "250px",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h3 style={{ margin: 0, fontWeight: "bold" }}>내 프로젝트</h3>
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "none",
                background: "#4f46e5",
                color: "#fff",
                fontSize: "20px",
                lineHeight: "1",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>

          {projects.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#666", marginTop: "20px" }}
            >
              <p>현재 참여 중인 프로젝트가 없습니다.</p>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  marginTop: "10px",
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ➕ 새 프로젝트 만들기
              </button>
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleSelectProject(proj)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border:
                    selectedProject?.id === proj.id
                      ? "2px solid #4f46e5"
                      : "1px solid #ddd",
                  background:
                    selectedProject?.id === proj.id ? "#eef2ff" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <strong>{proj.name}</strong>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  {proj.description || "설명이 없습니다."}
                </p>
              </div>
            ))
          )}
        </aside>

        {/* ✅ 오른쪽 프로젝트 상세 */}
        <section
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            padding: "20px",
          }}
        >
          {selectedProject ? (
            <>
              <h2 style={{ marginTop: 0 }}>{selectedProject.name}</h2>
              <p style={{ color: "#555", marginBottom: "20px" }}>
                {selectedProject.description}
              </p>
              <div>
                <h4 style={{ marginBottom: "10px" }}>팀원</h4>
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {selectedProject.members.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleNavigateToProject(selectedProject.id)}
                style={{
                  marginTop: "30px",
                  padding: "12px 24px",
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                상세 페이지로 이동 →
              </button>
            </>
          ) : (
            <p>왼쪽에서 프로젝트를 선택하세요.</p>
          )}
        </section>
      </main>

      {/* 모달: 새 프로젝트 만들기 */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "25px",
              width: "320px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h3>새 프로젝트 만들기</h3>
            <input
              type="text"
              placeholder="프로젝트 이름을 입력하세요"
              value={newProjectName}
              onChange={(e) => {
                setNewProjectName(e.target.value);
                setError("");
              }}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginRight: "8px",
                  background: "#f3f4f6",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={handleCreateProject}
                style={{
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Main;
