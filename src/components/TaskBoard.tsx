import React, { useState } from "react";

const TaskBoard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const handleAddProject = () => {
    if (projectName.trim() === "") {
      setError("프로젝트 명을 입력해주세요!");
      return;
    }

    console.log("새 프로젝트:", projectName); // DB 연동 자리
    setProjectName("");
    setError("");
    setShowModal(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 상단 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          borderBottom: "1px solid #ddd",
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

      {/* 실제 작업 보드 내용 */}
      <div style={{ flex: 1, padding: "10px" }}>
        <p style={{ color: "#888" }}>아직 프로젝트가 없습니다.</p>
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
                setError(""); // 입력 중이면 에러 메시지 지움
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
            {/* 에러 메시지 */}
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
