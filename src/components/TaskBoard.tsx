import React, { useState, useRef, useEffect } from "react";
import MemberCard from "./MemberCard";
import ProgressBar from "./ProgressBar";
import { Member } from "../types/Member";
import { RoleColumn } from "../pages/Project";
import axiosInstance from "../api/AxiosInstance";
import "../styles/TaskBoard.css";

interface Props {
  columns: RoleColumn[];
  members: Member[];
  projectId: number; // ✅ 현재 프로젝트 id 추가 (API 호출용)
  refreshColumns: () => void; // ✅ 부모에서 재로드 요청
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
  projectId,
  refreshColumns,
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

  // --- 팝오버 외부 클릭시 닫기 ---
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

  // --- 역할(컬럼) 추가 ---
  const handleAddColumn = async () => {
    if (columnName.trim() === "") {
      setError("역할 이름을 입력해주세요!");
      return;
    }
    try {
      await axiosInstance.post(`/api/tasks/columns`, {
        name: columnName.trim(),
        projectId,
      });
      setColumnName("");
      setError("");
      setShowModal(false);
      refreshColumns(); // ✅ 새로고침
    } catch (err) {
      console.error("역할 추가 실패:", err);
      setError("서버 오류가 발생했습니다.");
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
    const memberId = parseInt(e.dataTransfer.getData("memberId"), 10);
    const sourceColumnIdStr = e.dataTransfer.getData("sourceColumnId");
    if (isNaN(memberId)) return;

    try {
      if (sourceColumnIdStr) {
        const sourceId = parseInt(sourceColumnIdStr, 10);
        // ✅ 이동 요청
        await axiosInstance.put(
          `/api/tasks/columns/${sourceId}/move/${destinationColumnId}/${memberId}`
        );
      } else {
        // ✅ 신규 배정 요청
        await axiosInstance.post(
          `/api/tasks/columns/${destinationColumnId}/members/${memberId}`
        );
      }
      refreshColumns();
    } catch (err) {
      console.error("드래그 이동 실패:", err);
    }
  };

  // --- 팝오버 열기 ---
  const handleOpenMemberEdit = (
    e: React.MouseEvent,
    columnId: number,
    memberId: number
  ) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setEditingMember({
      columnId,
      memberId,
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
  };

  // --- 멤버 삭제 ---
  const handleDeleteMember = async (columnId: number, memberId: number) => {
    try {
      await axiosInstance.delete(
        `/api/tasks/columns/${columnId}/members/${memberId}`
      );
      refreshColumns();
    } catch (err) {
      console.error("멤버 삭제 실패:", err);
    }
  };

  // --- 멤버 상태 변경 ---
  const handleStatusChange = async (
    columnId: number,
    memberId: number,
    newStatus: string
  ) => {
    try {
      await axiosInstance.put(`/api/tasks/${memberId}/status`, {
        status: newStatus,
      });
      refreshColumns();
      setEditingMember(null);
    } catch (err) {
      console.error("상태 업데이트 실패:", err);
    }
  };

  return (
    <div className="taskboard">
      {/* 상단 헤더 */}
      <div className="taskboard-header">
        <h3>역할 기반 작업 보드</h3>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          +
        </button>
      </div>

      {/* 칸반 보드 */}
      <div className="columns-container">
        {Array.isArray(columns) && columns.length > 0 ? (
          columns.map((col) => {
            const completed = col.members.filter(
              (m) => m.status === "작업완료"
            ).length;
            const progress =
              col.members.length > 0
                ? (completed / col.members.length) * 100
                : 0;

            return (
              <div
                key={col.id}
                className="column"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(col.id, e)}
              >
                <div className="column-header">
                  <h4>
                    {col.name} ({col.members.length})
                  </h4>
                  <button
                    className="delete-col-btn"
                    onClick={() => {
                      setColumnToDelete(col);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    ×
                  </button>
                </div>

                <ProgressBar value={progress} />

                <div className="column-body">
                  {col.members.length > 0 ? (
                    col.members.map((m) => {
                      const member = members.find((mem) => mem.id === m.id);
                      if (!member) return null;
                      return (
                        <div
                          key={m.id}
                          className="member-card-wrapper"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("memberId", m.id.toString());
                            e.dataTransfer.setData(
                              "sourceColumnId",
                              col.id.toString()
                            );
                          }}
                        >
                          <MemberCard member={member}>
                            <button
                              className="edit-btn"
                              onClick={(e) =>
                                handleOpenMemberEdit(e, col.id, m.id)
                              }
                            >
                              ▼
                            </button>
                          </MemberCard>
                          <button
                            className="delete-member-btn"
                            onClick={() => handleDeleteMember(col.id, m.id)}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-column">
                      멤버를 드래그하여
                      <br />
                      역할에 배정하세요.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="empty-column">등록된 역할이 없습니다.</p>
        )}
      </div>

      {/* 새 역할 추가 모달 */}
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
          className="popover"
          style={{ top: editingMember.top, left: editingMember.left }}
        >
          {(() => {
            const memberInfo = members.find(
              (m) => m.id === editingMember.memberId
            );
            const projectMemberInfo = columns
              .find((c) => c.id === editingMember.columnId)
              ?.members.find((m) => m.id === editingMember.memberId);
            if (!memberInfo || !projectMemberInfo) return null;
            return (
              <>
                <h5>{memberInfo.name}</h5>
                <p>
                  <strong>역할:</strong> {memberInfo.role || "미지정"}
                </p>
                <label>상태 변경:</label>
                <select
                  value={projectMemberInfo.status}
                  onChange={(e) =>
                    handleStatusChange(
                      editingMember.columnId,
                      editingMember.memberId,
                      e.target.value
                    )
                  }
                >
                  <option value="작업전">작업전</option>
                  <option value="작업중">작업중</option>
                  <option value="작업완료">작업완료</option>
                </select>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
