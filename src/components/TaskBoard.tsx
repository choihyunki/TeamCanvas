import React, { useState } from "react";

// Member Type은 부모 컴포넌트나 types 폴더에서 가져왔다고 가정합니다.
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
  onUpdateStatus: (projectId: number, memberId: number, status: string) => void; 
  onAddProject: (projectName: string) => void; // Main에서 내려받는 함수로 변경
  onDeleteProject: (projectId: number) => void; 
}

const TaskBoard: React.FC<Props> = ({
  projects,
  members,
  onAddMember,
  onUpdateStatus,
  onAddProject, // props로 받아 사용
  onDeleteProject, // props로 받아 사용
}) => {
  const [showModal, setShowModal] = useState(false); // 새 프로젝트 모달
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // 삭제 확인 모달
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null); // 삭제할 프로젝트 정보
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const handleAddProject = () => {
    if (projectName.trim() === "") {
      setError("프로젝트 명을 입력해주세요!");
      return;
    }

    // props로 받은 onAddProject 함수 호출
    onAddProject(projectName);
    
    setProjectName("");
    setError("");
    setShowModal(false);
  };

  const openDeleteConfirm = (proj: Project) => {
    setProjectToDelete(proj);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
        onDeleteProject(projectToDelete.id);
        setProjectToDelete(null);
        setShowDeleteConfirm(false);
    }
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
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          +
        </button>
      </div>

      {/* 카드 목록 (세로 스크롤 영역) */}
      <div
        style={{
          flex: 1,
          overflowY: "auto", 
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        {projects.length === 0 ? (
          <p style={{ color: "#888", textAlign: 'center', marginTop: '50px' }}>
            <span style={{ fontSize: '24px' }}>&#x1F6C7;</span>
            <br/>
            아직 프로젝트가 없습니다. '+' 버튼을 눌러 새 프로젝트를 시작하세요.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                projects.length === 1 ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", // 반응형 템플릿
              gap: "15px",
            }}
          >
            {projects.map((proj) => (
              <div
                key={proj.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(proj.id, e)}
                style={{
                  minHeight: "250px", // 최소 높이 설정
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                  display: "flex",
                  flexDirection: "column",
                  padding: "15px",
                  boxSizing: "border-box",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                  transition: "border-color 0.2s",
                }}
                onDragEnter={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
                onDragLeave={(e) => (e.currentTarget.style.borderColor = "#ddd")}
              >
                {/* 프로젝트 이름 및 멤버 수 */}
                <div 
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '10px',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '8px',
                    }}
                >
                  <h4 style={{ margin: 0, fontWeight: "bold", fontSize: '16px' }}>
                    {proj.name}
                  </h4>
                  {/* ✅ 멤버 수 표시 */}
                  <span style={{ fontSize: '14px', color: '#4f46e5', fontWeight: '600' }}>
                    {proj.members.length}명 참여
                  </span>
                </div>
                
                {/* 프로젝트 멤버 카드 컨테이너 */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    overflowY: 'auto', // 멤버가 많아지면 내부 스크롤
                    padding: '5px',
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
                          flexShrink: 0,
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
                            textAlign: 'center',
                          }}
                        >
                          {member.name}
                        </div>

                        {/* 상태 드롭다운 */}
                        <select
                          value={m.status}
                          onChange={(e) =>
                            onUpdateStatus(proj.id, m.id, e.target.value)
                          } 
                          style={{
                            fontSize: "12px",
                            padding: "2px 4px",
                            borderRadius: "6px",
                            border: '1px solid #ccc',
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
                    onClick={() => openDeleteConfirm(proj)} // 커스텀 모달 열기
                    style={{
                        border: "none",
                        background: "transparent",
                        color: "#ef4444", // Tailwind red-500
                        cursor: "pointer",
                        marginTop: '10px',
                        alignSelf: 'flex-end',
                        fontWeight: '500',
                        fontSize: '13px',
                    }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 새 프로젝트 생성 모달창 */}
      {showModal && (
        <div
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
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "300px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>새 프로젝트 만들기</h4>
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
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                marginBottom: "12px",
                boxSizing: "border-box",
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
            />
            {error && (
              <div
                style={{ color: "red", fontSize: "13px", marginBottom: "12px" }}
              >
                {error}
              </div>
            )}
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginRight: "8px",
                  padding: "8px 16px",
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
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#4f46e5",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: '600',
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 삭제 확인 모달 */}
      {showDeleteConfirm && projectToDelete && (
        <div
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
            zIndex: 2000, // 새 프로젝트 모달보다 위에 위치
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              width: "350px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ marginTop: 0, color: '#ef4444', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>삭제 확인</h4>
            <p style={{ marginBottom: '20px' }}>
              정말로 프로젝트 <strong>[{projectToDelete.name}]</strong>을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  marginRight: "10px",
                  padding: "8px 16px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  background: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#ef4444", // 빨간색 버튼 
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: '600',
                }}
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
