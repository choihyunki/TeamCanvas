import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/AxiosInstance";
import { Navigate, useNavigate } from "react-router-dom";

interface Project {
  id: number;
  name: string;
  chatRoomId?: number;
  members?: string[];
  description?: string;
}

const Main: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [error, setError] = useState("");

  /** ✅ 내 프로젝트 불러오기 */
  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get("/api/projects/my");
      if (Array.isArray(res.data)) {
        setProjects(res.data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("❌ 프로젝트 목록 불러오기 실패:", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /** ✅ 프로젝트 선택 */
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    navigate(`/project/${project.id}`); // ✅ 상세 페이지 이동
  };

  /** ✅ 새 프로젝트 생성 */
  const handleCreateProject = async () => {
    if (newProjectName.trim() === "") {
      setError("프로젝트 이름을 입력해주세요!");
      return;
    }

    try {
      const { data: created } = await axiosInstance.post("/api/projects", {
        name: newProjectName.trim(),
      });

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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>내 프로젝트</h3>
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

          {/* ✅ 프로젝트 리스트 or 안내 메시지 */}
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
              <h2>{selectedProject.name}</h2>
              <p>{selectedProject.description || "설명 없음"}</p>
              <h4>팀원</h4>
              <ul>
                {(selectedProject.members || []).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>왼쪽에서 프로젝트를 선택하세요.</p>
          )}
        </section>
      </main>

      {/* ✅ 프로젝트 생성 모달 */}
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
