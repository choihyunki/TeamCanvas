import React, { useMemo, useState } from "react";
import { RoleColumn, ProjectMember } from "../types/Project";
import { Member } from "../types/Member";

// --- 작업 타입 ---
interface Task {
  id: number;
  text: string;
  completed: boolean;
}

// roleId -> memberId -> Task[]
type TasksByRole = {
  [roleId: number]: {
    [memberId: number]: Task[];
  };
};

interface TaskDetailsProps {
  columns: RoleColumn[];
  members: Member[];
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ columns, members }) => {
  const [tasksByRole, setTasksByRole] = useState<TasksByRole>({});
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [newTaskText, setNewTaskText] = useState("");

  // 🔹 memberId -> Member 매핑
  const memberMap = useMemo(() => {
    const map: Record<number, Member> = {};
    members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [members]);

  // 🔹 현재 선택된 역할에 참여중인 멤버 목록
  const membersInSelectedRole = useMemo(() => {
    if (selectedRoleId == null) return [];
    const col = columns.find((c) => c.id === selectedRoleId);
    if (!col) return [];
    return col.members
      .map((pm: ProjectMember) => memberMap[pm.id])
      .filter((m): m is Member => !!m);
  }, [selectedRoleId, columns, memberMap]);

  // 🔹 선택된 역할+멤버의 작업 리스트
  const currentTasks: Task[] = useMemo(() => {
    if (selectedRoleId == null || selectedMemberId == null) return [];
    return tasksByRole[selectedRoleId]?.[selectedMemberId] ?? [];
  }, [tasksByRole, selectedRoleId, selectedMemberId]);

  const handleChangeRole = (roleId: number) => {
    setSelectedRoleId(roleId);
    const col = columns.find((c) => c.id === roleId);
    if (!col) {
      setSelectedMemberId(null);
      return;
    }
    const firstMember = col.members[0];
    setSelectedMemberId(firstMember ? firstMember.id : null);
  };

  const handleChangeMember = (memberId: number) => {
    setSelectedMemberId(memberId);
  };

  const handleAddTask = () => {
    const text = newTaskText.trim();
    if (!text) return;
    if (selectedRoleId == null || selectedMemberId == null) {
      alert("역할과 팀원을 먼저 선택해주세요.");
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      text,
      completed: false,
    };

    setTasksByRole((prev) => {
      const roleTasks = prev[selectedRoleId] ?? {};
      const memberTasks = roleTasks[selectedMemberId] ?? [];
      return {
        ...prev,
        [selectedRoleId]: {
          ...roleTasks,
          [selectedMemberId]: [...memberTasks, newTask],
        },
      };
    });

    setNewTaskText("");
  };

  const handleToggleTask = (taskId: number) => {
    if (selectedRoleId == null || selectedMemberId == null) return;

    setTasksByRole((prev) => {
      const roleTasks = prev[selectedRoleId] ?? {};
      const memberTasks = roleTasks[selectedMemberId] ?? [];
      const updated = memberTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return {
        ...prev,
        [selectedRoleId]: {
          ...roleTasks,
          [selectedMemberId]: updated,
        },
      };
    });
  };

  const handleDeleteTask = (taskId: number) => {
    if (selectedRoleId == null || selectedMemberId == null) return;

    setTasksByRole((prev) => {
      const roleTasks = prev[selectedRoleId] ?? {};
      const memberTasks = roleTasks[selectedMemberId] ?? [];
      const updated = memberTasks.filter((t) => t.id !== taskId);
      return {
        ...prev,
        [selectedRoleId]: {
          ...roleTasks,
          [selectedMemberId]: updated,
        },
      };
    });
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 700,
          marginBottom: "12px",
          color: "#111827",
        }}
      >
        세부 작업 내용
      </h2>

      {/* 1. 역할 / 팀원 선택 + 작업 추가 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1.5fr 3fr auto",
          gap: "8px",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        {/* 역할 선택 */}
        <div>
          <label
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "4px",
              display: "block",
            }}
          >
            역할 선택
          </label>
          <select
            value={selectedRoleId ?? ""}
            onChange={(e) => handleChangeRole(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "13px",
            }}
          >
            <option value="">역할을 선택하세요</option>
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* 팀원 선택 */}
        <div>
          <label
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "4px",
              display: "block",
            }}
          >
            참여 팀원
          </label>
          <select
            value={selectedMemberId ?? ""}
            onChange={(e) => handleChangeMember(Number(e.target.value))}
            disabled={membersInSelectedRole.length === 0}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "13px",
              backgroundColor:
                membersInSelectedRole.length === 0 ? "#f9fafb" : "white",
            }}
          >
            {membersInSelectedRole.length === 0 ? (
              <option value="">이 역할에 배정된 팀원이 없습니다</option>
            ) : (
              <>
                <option value="">팀원을 선택하세요</option>
                {membersInSelectedRole.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* 작업 입력 */}
        <div>
          <label
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "4px",
              display: "block",
            }}
          >
            세부 작업
          </label>
          <input
            type="text"
            placeholder="예: API 명세서 정리, UI 컴포넌트 리팩토링..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTask();
              }
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "13px",
            }}
          />
        </div>

        <button
          onClick={handleAddTask}
          style={{
            alignSelf: "end",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            background: "#4f46e5",
            color: "white",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          작업 추가
        </button>
      </div>

      {/* 2. 역할별 / 팀원별 세부 작업 표 */}
      {columns.length === 0 ? (
        <div
          style={{
            padding: "16px",
            borderRadius: "8px",
            border: "1px dashed #d1d5db",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          아직 생성된 역할(작업 보드)이 없습니다. 상단의{" "}
          <strong>작업 보드</strong> 탭에서 역할을 추가해 주세요.
        </div>
      ) : (
        <div
          style={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th
                  style={{
                    width: "180px",
                    padding: "10px",
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "left",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  역할 / 팀원
                </th>
                <th
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #e5e7eb",
                    textAlign: "left",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  세부 작업
                </th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => {
                const projectMembers = col.members;
                const visibleMembers = projectMembers
                  .map((pm) => memberMap[pm.id])
                  .filter((m): m is Member => !!m);

                if (visibleMembers.length === 0) {
                  return (
                    <tr key={col.id}>
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f3f4f6",
                          fontWeight: 600,
                          fontSize: "13px",
                          verticalAlign: "top",
                        }}
                      >
                        {col.name}
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "11px",
                            color: "#9ca3af",
                          }}
                        >
                          참여중인 팀원이 없습니다.
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f3f4f6",
                          fontSize: "13px",
                          color: "#9ca3af",
                        }}
                      >
                        세부 작업을 추가하려면 이 역할에 팀원을 배정해 주세요.
                      </td>
                    </tr>
                  );
                }

                return visibleMembers.map((m, idx) => {
                  const memberTasks = tasksByRole[col.id]?.[m.id] ?? [];
                  return (
                    <tr key={`${col.id}-${m.id}`}>
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f3f4f6",
                          fontSize: "13px",
                          verticalAlign: "top",
                          background: idx === 0 ? "#fff" : "#f9fafb",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: "2px",
                          }}
                        >
                          {col.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                          }}
                        >
                          {m.name} · 참여중
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f3f4f6",
                          fontSize: "13px",
                          background: idx === 0 ? "#fff" : "#f9fafb",
                        }}
                      >
                        {memberTasks.length === 0 ? (
                          <span style={{ color: "#9ca3af" }}>
                            아직 등록된 세부 작업이 없습니다.
                          </span>
                        ) : (
                          <ul
                            style={{
                              listStyle: "none",
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            {memberTasks.map((t) => (
                              <li
                                key={t.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: "4px",
                                  gap: "6px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={t.completed}
                                  onChange={() => handleToggleTask(t.id)}
                                />
                                <span
                                  style={{
                                    flex: 1,
                                    textDecoration: t.completed
                                      ? "line-through"
                                      : "none",
                                    color: t.completed ? "#9ca3af" : "#111827",
                                    fontSize: "13px",
                                  }}
                                >
                                  {t.text}
                                </span>
                                <button
                                  onClick={() => handleDeleteTask(t.id)}
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#9ca3af",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                  }}
                                >
                                  삭제
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
