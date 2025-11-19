import React, { useState, useRef, useEffect } from "react";
import MemberCard from "./MemberCard";
import ProgressBar from "./ProgressBar";
// ✅ 1. 각 타입을 올바른 파일 경로에서 가져오도록 수정합니다.
import { Member } from "../types/Member";
import { RoleColumn, ProjectMember } from "../types/Project";

// ✅ 2. 이 파일 내에 있던 중복 타입 정의를 모두 삭제했습니다.

// --- Props 타입 정의 ---
interface Props {
  columns: RoleColumn[];
  members: Member[];
  onAddMemberToColumn: (columnId: number, memberId: number) => void;
  onMoveMember: (
    memberId: number,
    sourceColumnId: number,
    destinationColumnId: number
  ) => void;
  onUpdateStatus: (columnId: number, memberId: number, status: string) => void;
  onUpdateMemberMemo: (
    columnId: number,
    memberId: number,
    memo: string
  ) => void;
  onAddColumn: (columnName: string) => void;
  onDeleteColumn: (columnId: number) => void;
  onDeleteMember: (columnId: number, memberId: number) => void;
  onInviteFriend: (
    columnId: number,
    friendId: string,
    friendName: string
  ) => void;
}

interface EditingMemberInfo {
  columnId: number;
  memberId: number;
  top: number;
  left: number;
}

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
  onInviteFriend,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<RoleColumn | null>(null);
  const [columnName, setColumnName] = useState("");
  const [error, setError] = useState("");
  const [editingMember, setEditingMember] = useState<EditingMemberInfo | null>(
    null
  );
  const popoverRef = useRef<HTMLDivElement>(null);
  const taskBoardRef = useRef<HTMLDivElement>(null);
  const [draggedOverColumnId, setDraggedOverColumnId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setEditingMember(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // --- 역할(컬럼) 삭제 ---
  const handleConfirmDelete = async () => {
    if (!columnToDelete) return;
    try {
      await axiosInstance.delete(`/api/tasks/columns/${columnToDelete.id}`);
      setColumnToDelete(null);
      setShowDeleteConfirm(false);
      refreshColumns();
    } catch (err) {
      console.error("컬럼 삭제 실패:", err);
    }
  };

  // --- 드래그 앤 드롭 ---
  const handleDrop = async (
    destinationColumnId: number,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setDraggedOverColumnId(null);

    const memberId = e.dataTransfer.getData("memberId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
    const friendId = e.dataTransfer.getData("friendId");
    const friendName = e.dataTransfer.getData("friendName");

    if (sourceColumnId && memberId) {
      onMoveMember(
        parseInt(memberId, 10),
        parseInt(sourceColumnId, 10),
        destinationColumnId
      );
    } else if (friendId && friendName) {
      onInviteFriend(destinationColumnId, friendId, friendName);
    } else if (memberId) {
      onAddMemberToColumn(destinationColumnId, parseInt(memberId, 10));
    }
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    columnId: number
  ) => {
    e.preventDefault();
    setDraggedOverColumnId(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumnId(null);
  };

  const handleMemberDragStart = (
    e: React.DragEvent,
    memberId: number,
    sourceColumnId: number
  ) => {
    e.dataTransfer.setData("memberId", memberId.toString());
    e.dataTransfer.setData("sourceColumnId", sourceColumnId.toString());
  };

  const handleOpenMemberEdit = (
    e: React.MouseEvent,
    columnId: number,
    memberId: number
  ) => {
    e.stopPropagation();
    if (!taskBoardRef.current) return;

    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = taskBoardRef.current.getBoundingClientRect();
    const popoverWidth = 220;

    setEditingMember({
      columnId,
      memberId,
      top: buttonRect.bottom - containerRect.top + 5,
      left:
        buttonRect.left -
        containerRect.left +
        buttonRect.width / 2 -
        popoverWidth / 2,
    });
  };

  return (
    <div
      ref={taskBoardRef}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
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
        <h3 style={{ margin: 0 }}>역할 기반 작업 보드</h3>
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

      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {columns.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center", marginTop: "50px" }}>
            <span style={{ fontSize: "24px" }}>&#x1F6C7;</span>
            <br />
            아직 역할이 없습니다. '+' 버튼을 눌러 새 역할을 추가하세요.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "15px",
            }}
          >
            {columns.map((col) => {
              const completedMembers = col.members.filter(
                (m) => m.status === "작업완료"
              ).length;
              const progress =
                col.members.length > 0
                  ? (completedMembers / col.members.length) * 100
                  : 0;
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(col.id, e)}
                  style={{
                    minHeight: "300px",
                    background: "#f1f3f5",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px",
                    border:
                      draggedOverColumnId === col.id
                        ? "2px dashed #4f46e5"
                        : "1px solid #ddd",
                    transition: "border 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                      padding: "0 5px",
                    }}
                  >
                    <h4 style={{ margin: 0 }}>
                      {col.name} ({col.members.length})
                    </h4>
                    <button
                      onClick={() => openDeleteConfirm(col)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "22px",
                        color: "#aaa",
                      }}
                    >
                      &times;
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#555",
                        fontWeight: 500,
                        flexShrink: 0,
                        width: "55px",
                      }}
                    >
                      진행률:
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <ProgressBar value={progress} />
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#333",
                        fontWeight: "600",
                        width: "40px",
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      overflowY: "auto",
                      padding: "5px",
                    }}
                  >
                    {col.members.length > 0 ? (
                      col.members.map((m) => {
                        const member = members.find((mem) => mem.id === m.id);
                        if (!member) return null;
                        return (
                          <div
                            key={m.id}
                            draggable
                            onDragStart={(e) =>
                              handleMemberDragStart(e, m.id, col.id)
                            }
                          >
                            <MemberCard member={member} memo={m.memo}>
                              <button
                                onClick={(e) =>
                                  handleOpenMemberEdit(e, col.id, m.id)
                                }
                                title="메모 및 상태 수정"
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  padding: "0 5px",
                                }}
                              >
                                ▼
                              </button>
                              <button
                                onClick={() => onDeleteMember(col.id, m.id)}
                                title={`${member.name}님을 역할에서 제외`}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "22px",
                                  color: "#aaa",
                                  padding: "0 5px",
                                  lineHeight: 1,
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "#ef4444")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "#aaa")
                                }
                              >
                                &times;
                              </button>
                            </MemberCard>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          color: "#aaa",
                          border: "2px dashed #e0e0e0",
                          borderRadius: "8px",
                          padding: "10px",
                        }}
                      >
                        멤버나 친구를 드래그하여
                        <br />
                        역할에 배정하세요.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>새 역할 추가</h4>
            <input
              type="text"
              placeholder="역할 이름 (예: 데이터 분석)"
              value={columnName}
              onChange={(e) => {
                setColumnName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
            />
            {error && <div className="error-text">{error}</div>}
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                취소
              </button>
              <button className="confirm-btn" onClick={handleAddColumn}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 역할 삭제 확인 모달 */}
      {showDeleteConfirm && columnToDelete && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="modal warning" onClick={(e) => e.stopPropagation()}>
            <h4>역할 삭제 확인</h4>
            <p>
              정말로 <strong>[{columnToDelete.name}]</strong> 역할을
              삭제하시겠습니까?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </button>
              <button className="delete-btn" onClick={handleConfirmDelete}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 상태 편집 팝오버 */}
      {editingMember && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: `${editingMember.top}px`,
            left: `${editingMember.left}px`,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 3000,
            width: "220px",
          }}
        >
          {(() => {
            const memberInfo = members.find(
              (m) => m.id === editingMember.memberId
            );
            const columnMemberInfo = columns
              .find((c) => c.id === editingMember.columnId)
              ?.members.find((m) => m.id === editingMember.memberId);
            if (!memberInfo || !columnMemberInfo) return null;

            const handleStatusClick = (status: string) => {
              onUpdateStatus(
                editingMember.columnId,
                editingMember.memberId,
                status
              );
              setEditingMember(null);
            };

            const statuses = ["작업전", "작업중", "작업완료"];

            return (
              <>
                <h5
                  style={{
                    marginTop: 0,
                    marginBottom: "15px",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "8px",
                  }}
                >
                  {memberInfo.name}
                </h5>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#333",
                      marginBottom: "5px",
                      display: "block",
                    }}
                  >
                    메모하기
                  </label>
                  <input
                    type="text"
                    placeholder="작업 내용 메모 (10자 이내)"
                    maxLength={10}
                    defaultValue={columnMemberInfo.memo || ""}
                    onBlur={(e) =>
                      onUpdateMemberMemo(
                        editingMember.columnId,
                        editingMember.memberId,
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#333",
                      marginBottom: "5px",
                      display: "block",
                    }}
                  >
                    상태변경
                  </label>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "5px",
                    }}
                  >
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusClick(status)}
                        style={{
                          flex: 1,
                          padding: "8px 4px",
                          border: "1px solid",
                          borderColor:
                            columnMemberInfo.status === status
                              ? "#4f46e5"
                              : "#ccc",
                          background:
                            columnMemberInfo.status === status
                              ? "#4f46e5"
                              : "#fff",
                          color:
                            columnMemberInfo.status === status
                              ? "#fff"
                              : "#333",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          transition: "all 0.2s",
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
