import React, { useState, useRef, useEffect } from "react";
import MemberCard from "./MemberCard";
import ProgressBar from "./ProgressBar";
import { Member } from "../types/Member";
import { RoleColumn } from "../pages/Project"; // Project.tsx에서 export한 타입 가져오기

// --- 타입 정의 ---
interface Props {
  columns: RoleColumn[];
  members: Member[];
  onAddMemberToColumn: (columnId: number, memberId: number) => void;
  onMoveMember: (memberId: number, sourceColumnId: number, destinationColumnId: number) => void;
  onUpdateStatus: (columnId: number, memberId: number, status: string) => void;
  onAddColumn: (columnName: string) => void;
  onDeleteColumn: (columnId: number) => void;
  onDeleteMember: (columnId: number, memberId: number) => void;
}

interface EditingMemberInfo {
  columnId: number;
  memberId: number;
  top: number;
  left: number;
}

// --- 칸반 보드 컴포넌트 ---
const TaskBoard: React.FC<Props> = ({
  columns,
  members,
  onAddMemberToColumn,
  onMoveMember,
  onUpdateStatus,
  onAddColumn,
  onDeleteColumn,
  onDeleteMember,
}) => {
  // --- 상태 관리 (State) ---
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<RoleColumn | null>(null);
  const [columnName, setColumnName] = useState("");
  const [error, setError] = useState("");
  const [editingMember, setEditingMember] = useState<EditingMemberInfo | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // --- useEffect ---
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

  // --- 이벤트 핸들러 ---
  const handleAddColumn = () => {
    if (columnName.trim() === "") {
      setError("역할 이름을 입력해주세요!");
      return;
    }
    onAddColumn(columnName);
    setColumnName("");
    setError("");
    setShowModal(false);
  };
  
  const openDeleteConfirm = (col: RoleColumn) => {
    setColumnToDelete(col);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (columnToDelete) {
      onDeleteColumn(columnToDelete.id);
      setColumnToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleDrop = (destinationColumnId: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const memberId = parseInt(e.dataTransfer.getData("memberId"), 10);
    const sourceColumnIdStr = e.dataTransfer.getData("sourceColumnId");
    if (!isNaN(memberId)) {
      if (sourceColumnIdStr) { // 컬럼 간 멤버 이동
        onMoveMember(memberId, parseInt(sourceColumnIdStr, 10), destinationColumnId);
      } else { // 멤버 리스트에서 새로 추가
        onAddMemberToColumn(destinationColumnId, memberId);
      }
    }
  };
  
  const handleMemberDragStart = (e: React.DragEvent, memberId: number, sourceColumnId: number) => {
    e.dataTransfer.setData("memberId", memberId.toString());
    e.dataTransfer.setData("sourceColumnId", sourceColumnId.toString());
  };
  
  const handleOpenMemberEdit = (e: React.MouseEvent, columnId: number, memberId: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setEditingMember({ columnId, memberId, top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX });
  };

  // --- 렌더링 ---
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #ddd", flexShrink: 0 }}>
        <h3 style={{ margin: 0 }}>역할 기반 작업 보드</h3>
        <button onClick={() => setShowModal(true)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#4f46e5", color: "#fff", border: "none", fontSize: "20px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          +
        </button>
      </div>

      {/* 칸반 보드 영역 */}
      <div style={{ display: "flex", flex: 1, gap: "15px", overflowX: "auto", padding: "10px" }}>
        {columns.map((col) => {
          const completedMembers = col.members.filter((m) => m.status === "작업완료").length;
          const progress = col.members.length > 0 ? (completedMembers / col.members.length) * 100 : 0;
          return (
            <div key={col.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(col.id, e)} style={{ width: "320px", flexShrink: 0, background: "#f1f3f5", borderRadius: "12px", display: "flex", flexDirection: "column", padding: "10px", border: "1px solid #ddd" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 5px' }}>
                <h4 style={{ margin: 0 }}>{col.name} ({col.members.length})</h4>
                <button onClick={() => openDeleteConfirm(col)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#aaa' }}>&times;</button>
              </div>
              <div style={{ marginBottom: '10px' }}><ProgressBar value={progress} /></div>
              <div style={{ flex: 1, display: "flex", flexDirection: 'column', gap: "8px", overflowY: 'auto', padding: '5px' }}>
                {col.members.length > 0 ? (
                  col.members.map((m) => {
                    const member = members.find((mem) => mem.id === m.id);
                    if (!member) return null;
                    return (
                      <div key={m.id} style={{ position: 'relative' }} draggable onDragStart={(e) => handleMemberDragStart(e, m.id, col.id)}>
                        <MemberCard member={member}>
                          <button onClick={(e) => handleOpenMemberEdit(e, col.id, m.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 5px' }}>▼</button>
                        </MemberCard>
                        <button onClick={() => onDeleteMember(col.id, m.id)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#aaa', padding: '0 5px', lineHeight: 1 }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>&times;</button>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#aaa', border: '2px dashed #e0e0e0', borderRadius: '8px', padding: '10px' }}>
                    멤버를 드래그하여<br/>역할에 배정하세요.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 모달 창 */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", width: "300px", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>새 역할 추가</h4>
            <input type="text" placeholder="역할 이름 (예: 데이터 분석)" value={columnName} onChange={(e) => { setColumnName(e.target.value); setError(""); }} style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", marginBottom: "12px", boxSizing: "border-box" }} onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()} />
            {error && <div style={{ color: "red", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setShowModal(false)} style={{ marginRight: "8px", padding: "8px 16px", border: "1px solid #ccc", borderRadius: "6px", background: "#f5f5f5", cursor: "pointer" }}>취소</button>
              <button onClick={handleAddColumn} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#4f46e5", color: "#fff", cursor: "pointer", fontWeight: '600' }}>확인</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && columnToDelete && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", width: "350px", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginTop: 0, color: '#ef4444', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>역할 삭제 확인</h4>
            <p style={{ marginBottom: '20px' }}>정말로 <strong>[{columnToDelete.name}]</strong> 역할을 삭제하시겠습니까?</p>
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ marginRight: "10px", padding: "8px 16px", border: "1px solid #ccc", borderRadius: "6px", background: "#f5f5f5", cursor: "pointer" }}>취소</button>
              <button onClick={handleConfirmDelete} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: '600' }}>삭제</button>
            </div>
          </div>
        </div>
      )}
      {editingMember && (
        <div ref={popoverRef} style={{ position: 'absolute', top: `${editingMember.top}px`, left: `${editingMember.left}px`, background: 'white', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 3000, width: '200px' }}>
          {(() => {
            const memberInfo = members.find(m => m.id === editingMember.memberId);
            const projectMemberInfo = columns.find(c => c.id === editingMember.columnId)?.members.find(m => m.id === editingMember.memberId);
            if (!memberInfo || !projectMemberInfo) return null;
            return (
              <>
                <h5 style={{ marginTop: 0, marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>{memberInfo.name}</h5>
                <p style={{ fontSize: '14px', margin: '0 0 12px 0' }}><strong>역할:</strong> {memberInfo.role || '미지정'}</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '13px', marginBottom: '4px' }}>상태 변경:</label>
                  <select value={projectMemberInfo.status} onChange={(e) => { onUpdateStatus(editingMember.columnId, editingMember.memberId, e.target.value); setEditingMember(null); }} style={{ padding: '6px', borderRadius: '6px' }}>
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