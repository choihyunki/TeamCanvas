import React, { useState, useRef, useEffect } from "react";
import MemberCard from "./MemberCard";
import ProgressBar from "./ProgressBar";
import { Member } from "../types/Member";

// ... (interface 정의들은 이전과 동일)
interface ProjectMember {
  id: number;
  status: string;
}
interface Project {
  id: number;
  name: string;
  members: ProjectMember[];
}
interface Props {
  projects: Project[];
  members: Member[];
  onAddMember: (projectId: number, memberId: number) => void;
  onUpdateStatus: (projectId: number, memberId: number, status: string) => void;
  onAddProject: (projectName: string) => void;
  onDeleteProject: (projectId: number) => void;
  onDeleteMember: (projectId: number, memberId: number) => void; // 이전 요청에서 추가된 prop
}
interface EditingMemberInfo {
  projectId: number;
  memberId: number;
  top: number;
  left: number;
}


const TaskBoard: React.FC<Props> = ({
  projects,
  members,
  onAddMember,
  onUpdateStatus,
  onAddProject,
  onDeleteProject,
  onDeleteMember, // 이전 요청에서 추가된 prop
}) => {
  // ... (useState, useEffect, 핸들러 함수들은 이전과 동일)
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const [editingMember, setEditingMember] = useState<EditingMemberInfo | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setEditingMember(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddProject = () => {
    if (projectName.trim() === "") {
      setError("프로젝트 명을 입력해주세요!");
      return;
    }
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

  const handleOpenMemberEdit = (
    e: React.MouseEvent,
    projectId: number,
    memberId: number
  ) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setEditingMember({
      projectId,
      memberId,
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX - 180,
    });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* ... (상단 헤더는 이전과 동일) ... */}
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #ddd", flexShrink: 0 }}>
        <h3 style={{ margin: 0 }}>작업 보드</h3>
        <button onClick={() => setShowModal(true)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#4f46e5", color: "#fff", border: "none", fontSize: "20px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          +
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px", boxSizing: "border-box" }}>
        {projects.length === 0 ? (
          <p style={{ color: "#888", textAlign: 'center', marginTop: '50px' }}>
            <span style={{ fontSize: '24px' }}>&#x1F6C7;</span><br />
            아직 프로젝트가 없습니다. '+' 버튼을 눌러 새 프로젝트를 시작하세요.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
            {projects.map((proj) => {
              const completedMembers = proj.members.filter((m) => m.status === "작업완료").length;
              const progress = proj.members.length > 0 ? (completedMembers / proj.members.length) * 100 : 0;

              return (
                <div key={proj.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(proj.id, e)} style={{ minHeight: "250px", background: "#ffffff", borderRadius: "12px", border: "1px solid #ddd", display: "flex", flexDirection: "column", padding: "15px", boxSizing: "border-box", boxShadow: "0 4px 8px rgba(0,0,0,0.05)", transition: "border-color 0.2s" }} onDragEnter={(e) => (e.currentTarget.style.borderColor = "#4f46e5")} onDragLeave={(e) => (e.currentTarget.style.borderColor = "#ddd")}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontWeight: "bold", fontSize: '16px' }}>{proj.name}</h4>
                    <span style={{ fontSize: '14px', color: '#4f46e5', fontWeight: '600' }}>{proj.members.length}명 참여</span>
                  </div>
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ProgressBar value={progress} />
                    <span style={{ fontSize: '12px', color: '#666', flexShrink: 0 }}>{Math.round(progress)}%</span>
                  </div>
                  
                  <div style={{ flex: 1, display: "flex", flexDirection: 'column', gap: "8px", overflowY: 'auto', padding: '5px' }}>
                    {/* ✅ 멤버 목록 렌더링 부분 수정 */}
                    {proj.members.length > 0 ? (
                      proj.members.map((m) => {
                        const member = members.find((mem) => mem.id === m.id);
                        if (!member) return null;
                        return (
                          <MemberCard key={m.id} member={member}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <button onClick={(e) => handleOpenMemberEdit(e, proj.id, m.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                                ⚙️
                              </button>
                              <button onClick={() => onDeleteMember(proj.id, m.id)} title={`${member.name}님을 프로젝트에서 제외`} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#aaa', padding: '0 5px', lineHeight: 1 }} onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')} onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')} >
                                &times;
                              </button>
                            </div>
                          </MemberCard>
                        );
                      })
                    ) : (
                      // ✅ 멤버가 없을 때 보여줄 안내 메시지 (Empty State)
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        color: '#aaa',
                        border: '2px dashed #e0e0e0',
                        borderRadius: '8px',
                        padding: '10px',
                        marginTop: '10px',
                      }}>
                        왼쪽 목록에서 멤버를<br />드래그하여 여기에 추가하세요.
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => openDeleteConfirm(proj)} style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer", marginTop: '10px', alignSelf: 'flex-end', fontWeight: '500', fontSize: '13px' }}>
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ... (모달, 팝업 창들은 이전과 동일) ... */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", width: "300px", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>새 프로젝트 만들기</h4>
            <input type="text" placeholder="프로젝트 이름" value={projectName} onChange={(e) => { setProjectName(e.target.value); setError(""); }} style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", marginBottom: "12px", boxSizing: "border-box" }} onKeyDown={(e) => e.key === 'Enter' && handleAddProject()} />
            {error && <div style={{ color: "red", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setShowModal(false)} style={{ marginRight: "8px", padding: "8px 16px", border: "1px solid #ccc", borderRadius: "6px", background: "#f5f5f5", cursor: "pointer" }}>취소</button>
              <button onClick={handleAddProject} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#4f46e5", color: "#fff", cursor: "pointer", fontWeight: '600' }}>확인</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && projectToDelete && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", width: "350px", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginTop: 0, color: '#ef4444', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>삭제 확인</h4>
            <p style={{ marginBottom: '20px' }}>정말로 프로젝트 <strong>[{projectToDelete.name}]</strong>을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ marginRight: "10px", padding: "8px 16px", border: "1px solid #ccc", borderRadius: "6px", background: "#f5f5f5", cursor: "pointer" }}>취소</button>
              <button onClick={handleConfirmDelete} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: '600' }}>영구 삭제</button>
            </div>
          </div>
        </div>
      )}
      {editingMember && (
        <div ref={popoverRef} style={{ position: 'absolute', top: `${editingMember.top}px`, left: `${editingMember.left}px`, background: 'white', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 3000, width: '200px' }}>
          {(() => {
            const memberInfo = members.find(m => m.id === editingMember.memberId);
            const projectMemberInfo = projects.find(p => p.id === editingMember.projectId)?.members.find(m => m.id === editingMember.memberId);
            
            if (!memberInfo || !projectMemberInfo) return null;

            return (
              <>
                <h5 style={{ marginTop: 0, marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>{memberInfo.name}</h5>
                <p style={{ fontSize: '14px', margin: '0 0 12px 0' }}><strong>역할:</strong> {memberInfo.role || '미지정'}</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '13px', marginBottom: '4px' }}>상태 변경:</label>
                  <select value={projectMemberInfo.status} onChange={(e) => { onUpdateStatus(editingMember.projectId, editingMember.memberId, e.target.value); setEditingMember(null); }} style={{ padding: '6px', borderRadius: '6px' }}>
                    <option value="작업전">작업전</option>
                    <option value="작업중">작업중</option>
                    <option value="작업완료">작업완료</option>
                  </select>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;