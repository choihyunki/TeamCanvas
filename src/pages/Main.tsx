// src/pages/Main.tsx

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

const Main: React.FC = () => {
  const { token, logout } = useAuth(); // token = username
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  // 🔹 로그인 안 되어 있으면 로그인 페이지로 보냄
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f9fafb",
      }}
    >
      <Header onMenuClick={() => {}} />

      <main
        style={{
          flex: 1,
          display: "flex",
          padding: "20px",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* 🔹 왼쪽 영역: 유저 정보 / 로그아웃 / 새 프로젝트 생성 */}
        <section
          style={{
            width: "280px",
            padding: "16px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <h2 style={{ marginBottom: "8px", fontSize: "18px" }}>
              환영합니다 👋
            </h2>
            <p style={{ color: "#4b5563", fontSize: "14px" }}>
              로그인 계정: <strong>{token}</strong>
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            로그아웃
          </button>

          <hr />

          <div>
            <h3 style={{ marginBottom: "8px", fontSize: "16px" }}>
              새 프로젝트 만들기
            </h3>

            <input
              placeholder="프로젝트 이름"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            />

            <textarea
              placeholder="프로젝트 설명 (선택)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              style={{
                width: "100%",
                minHeight: "70px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                marginBottom: "8px",
                fontSize: "14px",
                resize: "vertical",
              }}
            />

            <button
              onClick={handleCreateProject}
              style={{
                width: "100%",
                padding: "10px",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + 프로젝트 생성
            </button>
          </div>
        </section>

        {/* 🔹 오른쪽 영역: 내가 참여중인 프로젝트 목록 */}
        <section
          style={{
            flex: 1,
            padding: "16px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ fontSize: "18px" }}>내 프로젝트</h2>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              총 {projects.length}개
            </span>
          </div>

          {projects.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              아직 생성된 프로젝트가 없습니다. 왼쪽에서 새 프로젝트를
              만들어보세요.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {projects.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "120px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        marginBottom: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginBottom: "6px",
                        minHeight: "34px",
                      }}
                    >
                      {p.description || "설명 없음"}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                      }}
                    >
                      멤버: {p.members?.length ?? 0}명
                    </p>
                  </div>

                  <button
                    onClick={() => handleEnterProject(p.id)}
                    style={{
                      marginTop: "10px",
                      padding: "8px",
                      background: "#4f46e5",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
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
