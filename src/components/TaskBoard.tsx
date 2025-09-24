import React, { useState } from "react";

interface Member {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  members: { id: number; status: string }[]; // 상태 포함
}

interface Props {
  projects: Project[];
  members: Member[];
  onAddMember: (projectId: number, memberId: number) => void;
  onUpdateStatus: (projectId: number, memberId: number, status: string) => void; // ✅ 추가
  onDeleteProject: (projectId: number) => void; // ✅ 삭제도 props로 받기
}

const TaskBoard: React.FC<Props> = ({
  projects,
  members,
  onAddMember,
  onUpdateStatus,
  onDeleteProject,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const handleAddProject = () => {
    if (projectName.trim() === "") {
      setError("프로젝트 명을 입력해주세요!");
      return;
    }

    // 👉 지금은 단순 알림. 나중에 Main에서 onAddProject 내려주면 거기 연결
    alert(`새 프로젝트 생성: ${projectName}`);
    setProjectName("");
    setError("");
    setShowModal(false);
  };

  const handleDrop = (projId: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const memberId = parseInt(e.dataTransfer.getData("memberId"), 10);
    if (!isNaN(memberId)) {
      onAddMember(projId, memberId);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 상단 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          borderBottom: "1px solid #ddd",
          flexShrink: 0,
        }}
      >
        <h3 style={{ margin: 0 }}>작업 보드</h3>
        <button
          onClick={() => setShowModal(true)}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>

      {/* 카드 목록 (세로 스크롤 영역) */}
      <div
        style={{
          flex: 1,
          overflowY: "auto", // ✅ 세로 스크롤
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        {projects.length === 0 ? (
          <p style={{ color: "#888" }}>아직 프로젝트가 없습니다.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                projects.length === 1 ? "1fr" : "repeat(2, 1fr)", // ✅ 1개면 가운데 크게, 2개 이상이면 2열
              gap: "12px",
            }}
          >
            {projects.map((proj) => (
              <div
                key={proj.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(proj.id, e)}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1", // ✅ 정사각형 유지
                  background: "#f9f9f9",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "12px",
                  boxSizing: "border-box",
                }}
              >
                {/* 프로젝트 이름 */}
                <div style={{ fontWeight: "bold", textAlign: "center" }}>
                  {proj.name}
                </div>

                {/* 프로젝트 멤버 카드 */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  {proj.members.map((m) => {
                    const member = members.find((mem) => mem.id === m.id);
                    if (!member) return null;

                    return (
                      <div
                        key={m.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "8px",
                          borderRadius: "12px",
                          background: "#e0f7fa",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                          width: "100px",
                        }}
                      >
                        {/* 아바타 */}
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "#80deea",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "bold",
                            marginBottom: "6px",
                          }}
                        >
                          {member.name.charAt(0)}
                        </div>

                        {/* 이름 */}
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "4px",
                          }}
                        >
                          {member.name}
                        </div>

                        {/* 상태 드롭다운 */}
                        <select
                          value={m.status}
                          onChange={(e) =>
                            onUpdateStatus(proj.id, m.id, e.target.value)
                          } // ✅ props로 호출
                          style={{
                            fontSize: "12px",
                            padding: "2px 4px",
                            borderRadius: "6px",
                          }}
                        >
                          <option value="작업전">작업전</option>
                          <option value="작업중">작업중</option>
                          <option value="작업후">작업후</option>
                        </select>
                      </div>
                    );
                  })}
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={() =>
                    alert(`${proj.name} 삭제 (Main에서 연결 필요)`)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "red",
                    cursor: "pointer",
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 모달창 */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "300px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ marginTop: 0 }}>새 프로젝트 만들기</h4>
            <input
              type="text"
              placeholder="프로젝트 이름"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setError("");
              }}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                marginBottom: "8px",
                boxSizing: "border-box",
              }}
            />
            {error && (
              <div
                style={{ color: "red", fontSize: "13px", marginBottom: "8px" }}
              >
                {error}
              </div>
            )}
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginRight: "8px",
                  padding: "6px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  background: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={handleAddProject}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#4f46e5",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
