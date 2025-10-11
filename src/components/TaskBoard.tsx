import React, { useState, useRef, useEffect } from "react";
import MemberCard from "./MemberCard";
import ProgressBar from "./ProgressBar";
import { Member } from "../types/Member";
import { RoleColumn, ProjectMember } from "../types/Project";

// --- 타입 정의 ---
interface Props {
  columns: RoleColumn[];
  members: Member[];
  onAddMemberToColumn: (columnId: number, memberId: number) => void;
  onMoveMember: (memberId: number, sourceColumnId: number, destinationColumnId: number) => void;
  onUpdateStatus: (columnId: number, memberId: number, status: string) => void;
  onUpdateMemberMemo: (columnId: number, memberId: number, memo: string) => void;
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
  onUpdateMemberMemo,
  onAddColumn,
  onDeleteColumn,
  onDeleteMember,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<RoleColumn | null>(null);
  const [columnName, setColumnName] = useState("");
  const [error, setError] = useState("");
  const [editingMember, setEditingMember] = useState<EditingMemberInfo | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const taskBoardRef = useRef<HTMLDivElement>(null);

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
      if (sourceColumnIdStr) {
        onMoveMember(memberId, parseInt(sourceColumnIdStr, 10), destinationColumnId);
      } else {
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
    if (!taskBoardRef.current) return;

    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = taskBoardRef.current.getBoundingClientRect(); // 컨테이너의 좌표
    const popoverWidth = 220;

    setEditingMember({
      columnId,
      memberId,
      // (버튼의 top 좌표 - 컨테이너의 top 좌표) = 컨테이너 내부에서의 상대적 top
      top: buttonRect.bottom - containerRect.top + 5,
      // (버튼의 left 좌표 - 컨테이너의 left 좌표) 로 상대적 위치를 잡고 중앙 정렬
      left: (buttonRect.left - containerRect.left) + (buttonRect.width / 2) - (popoverWidth / 2),
    });
  };

  return (
    <div ref={taskBoardRef} style={{ height: "100%", display: "flex", flexDirection: "column", position: 'relative' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #ddd", flexShrink: 0 }}>
        <h3 style={{ margin: 0 }}>역할 기반 작업 보드</h3>
        <button onClick={() => setShowModal(true)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#4f46e5", color: "#fff", border: "none", fontSize: "20px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          +
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {columns.length === 0 ? (
          <p style={{ color: "#888", textAlign: 'center', marginTop: '50px' }}>
            <span style={{ fontSize: '24px' }}>&#x1F6C7;</span><br />
            아직 역할이 없습니다. '+' 버튼을 눌러 새 역할을 추가하세요.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "15px" }}>
            {columns.map((col) => {
              const completedMembers = col.members.filter((m) => m.status === "작업완료").length;
              const progress = col.members.length > 0 ? (completedMembers / col.members.length) * 100 : 0;
              return (
                <div key={col.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(col.id, e)} style={{ minHeight: "300px", background: "#f1f3f5", borderRadius: "12px", display: "flex", flexDirection: "column", padding: "10px", border: "1px solid #ddd" }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 5px' }}>
                    <h4 style={{ margin: 0 }}>{col.name} ({col.members.length})</h4>
                    <button onClick={() => openDeleteConfirm(col)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#aaa' }}>&times;</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#555', fontWeight: 500, flexShrink: 0, width: '55px' }}>진행률:</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <ProgressBar value={progress} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#333', fontWeight: '600', width: '40px', textAlign: 'right', flexShrink: 0 }}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: 'column', gap: "8px", overflowY: 'auto', padding: '5px' }}>
                    {col.members.length > 0 ? (
                      col.members.map((m) => {
                        const member = members.find((mem) => mem.id === m.id);
                        if (!member) return null;
                        return (
                          <div key={m.id} draggable onDragStart={(e) => handleMemberDragStart(e, m.id, col.id)}>
                            <MemberCard member={member} memo={m.memo}>
                              <button
                                onClick={(e) => handleOpenMemberEdit(e, col.id, m.id)}
                                title="메모 및 상태 수정"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 5px' }}
                              >
                                ▼
                              </button>
                              <button
                                onClick={() => onDeleteMember(col.id, m.id)}
                                title={`${member.name}님을 역할에서 제외`}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#aaa', padding: '0 5px', lineHeight: 1 }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}
                              >
                                &times;
                              </button>
                            </MemberCard>
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
        )}
      </div>

      {/* ✅ 2. 누락되었던 모달 JSX 코드 전체 복원 */}
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
        <div ref={popoverRef} style={{ position: 'absolute', top: `${editingMember.top}px`, left: `${editingMember.left}px`, background: 'white', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 3000, width: '220px' }}>
          {(() => {
            const memberInfo = members.find(m => m.id === editingMember.memberId);
            const columnMemberInfo = columns.find(c => c.id === editingMember.columnId)?.members.find(m => m.id === editingMember.memberId);
            if (!memberInfo || !columnMemberInfo) return null;

            const handleStatusClick = (status: string) => {
              onUpdateStatus(editingMember.columnId, editingMember.memberId, status);
              setEditingMember(null);
            };

            const statuses = ["작업전", "작업중", "작업완료"];

            return (
              <>
                <h5 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>{memberInfo.name}</h5>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '5px', display: 'block' }}>
                    메모하기
                  </label>
                  <input
                    type="text"
                    placeholder="작업 내용 메모 (10자 이내)"
                    maxLength={10}
                    defaultValue={columnMemberInfo.memo || ''}
                    onBlur={(e) => onUpdateMemberMemo(editingMember.columnId, editingMember.memberId, e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '5px', display: 'block' }}>
                    상태변경
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
                    {statuses.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusClick(status)}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          border: '1px solid',
                          borderColor: columnMemberInfo.status === status ? '#4f46e5' : '#ccc',
                          background: columnMemberInfo.status === status ? '#4f46e5' : '#fff',
                          color: columnMemberInfo.status === status ? '#fff' : '#333',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'all 0.2s',
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
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