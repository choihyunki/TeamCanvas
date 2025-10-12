import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TaskBoard from "../components/TaskBoard";
import ChatBox from "../components/ChatBox";
import TaskDetails from "../components/TaskDetails";
import Schedule from "../components/Schedule";
import axiosInstance from "../api/AxiosInstance";
import { Member } from "../types/Member";

export interface ProjectMember {
  id: number;
  status: string;
}

export interface RoleColumn {
  id: number;
  name: string;
  members: ProjectMember[];
}

interface ProjectInfo {
  id: number;
  name: string;
  chatRoomId?: number;
  description?: string;
  members?: Member[];
}

const Project: React.FC = () => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(
    null
  );
  const [members, setMembers] = useState<Member[]>([]);
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [activeTab, setActiveTab] = useState("taskBoard");
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  /** ✅ 내 프로젝트 목록 불러오기 */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get("/api/projects/my");
        const projectList = res.data || [];
        setProjects(projectList);
        if (projectList.length > 0) setSelectedProject(projectList[0]);
      } catch (err) {
        console.error("❌ 프로젝트 목록 불러오기 실패:", err);
      }
    };
    fetchProjects();
  }, []);

  /** ✅ 선택된 프로젝트의 세부정보(팀원, 컬럼 등) 불러오기 */
  useEffect(() => {
    if (!selectedProject) return;

    const fetchData = async () => {
      try {
        // 📌 프로젝트 멤버 + 컬럼 불러오기
        const [membersRes, columnsRes] = await Promise.all([
          axiosInstance.get(`/api/projects/${selectedProject.id}/members`),
          axiosInstance.get(`/api/tasks/columns/${selectedProject.id}`),
        ]);
        setMembers(membersRes.data || []);
        setColumns(columnsRes.data || []);
      } catch (err) {
        console.error("❌ 프로젝트 세부정보 불러오기 실패:", err);
      }
    };

    fetchData();
  }, [selectedProject]);

  /** ✅ TaskBoard 새로고침용 */
  const fetchColumns = async (projectId: number) => {
    try {
      const [membersRes, columnsRes] = await Promise.all([
        axiosInstance.get(`/api/projects/${projectId}/members`),
        axiosInstance.get(`/api/tasks/columns/${projectId}`),
      ]);

      setMembers(membersRes.data || []);
      setColumns(Array.isArray(columnsRes.data) ? columnsRes.data : []);
    } catch (err) {
      console.error("프로젝트 세부정보 불러오기 실패:", err);
      setColumns([]);
    }
  };

  /** ✅ 사이드바 토글 */
  const toggleLeftSidebar = () =>
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleRightSidebar = () =>
    setIsRightSidebarCollapsed(!isRightSidebarCollapsed);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "#f4f7f6",
      }}
    >
      <Header onMenuClick={() => console.log("프로젝트 목록 열기")} />

      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ✅ 왼쪽 — 팀원(친구) 리스트 */}
        <aside
          style={{
            width: isLeftSidebarCollapsed ? "0px" : "15%",
            minWidth: isLeftSidebarCollapsed ? "0px" : "220px",
            padding: isLeftSidebarCollapsed ? "0" : "10px",
            borderRight: isLeftSidebarCollapsed ? "none" : "1px solid #ddd",
            transition: "all 0.3s ease-in-out",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <h3>팀원 목록</h3>
          {members.length === 0 ? (
            <p style={{ color: "#777", marginTop: "10px" }}>팀원이 없습니다.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {members.map((m) => (
                <li
                  key={m.id}
                  style={{
                    padding: "10px",
                    marginBottom: "6px",
                    borderRadius: "8px",
                    background: "#f5f6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                >
                  <strong>{m.name || "이름없음"}</strong>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* ✅ 중앙 — 탭별 메인 콘텐츠 */}
        <main style={{ flex: 1, overflow: "auto", background: "#f7f7f7" }}>
          {selectedProject && (
            <>
              <div
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "10px",
                  background: "#fff",
                }}
              >
                <h2>{selectedProject.name}</h2>
                <p style={{ color: "#777" }}>
                  {selectedProject.description || "설명 없음"}
                </p>

                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => setActiveTab("taskBoard")}>
                    작업 보드
                  </button>
                  <button onClick={() => setActiveTab("taskDetails")}>
                    세부 작업
                  </button>
                  <button onClick={() => setActiveTab("schedule")}>
                    작업 일정
                  </button>
                </div>
              </div>

              {activeTab === "taskBoard" && (
                <TaskBoard
                  columns={columns}
                  members={members}
                  projectId={selectedProject.id}
                  refreshColumns={() => fetchColumns(selectedProject.id)}
                />
              )}
              {activeTab === "taskDetails" && <TaskDetails />}
              {activeTab === "schedule" && <Schedule />}
            </>
          )}

          {!selectedProject && (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#666",
              }}
            >
              참여 중인 프로젝트를 선택하세요.
            </div>
          )}
        </main>

        {/* ✅ 오른쪽 — 채팅 영역 */}
        <aside
          style={{
            width: isRightSidebarCollapsed ? "0px" : "20%",
            minWidth: "280px",
            borderLeft: "1px solid #ddd",
            background: "#fff",
            transition: "all 0.3s ease-in-out",
          }}
        >
          {selectedProject?.chatRoomId ? (
            <ChatBox roomId={selectedProject.chatRoomId} />
          ) : (
            <p style={{ padding: "20px" }}>채팅방이 없습니다.</p>
          )}
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Project;
