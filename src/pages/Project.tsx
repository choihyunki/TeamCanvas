import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import TaskDetails from "../components/TaskDetails";
import Schedule from "../components/Schedule";
import SlideoutSidebar from "../components/SlideoutSidebar";
import ProgressBar from "../components/ProgressBar";
import ChatBox from "../components/ChatBox";
import UserService from "../services/UserService";

// 실시간 커서
import LiveCursors from "../components/LiveCursors";
import { useLiveCursors } from "../hooks/useLiveCursors";

// 인앱 툴
import {
  Calculator,
  MemoPad,
  Timer,
  YouTubePlayer,
  CodeReviewer,
} from "../components/InAppTools";
import { AppWindow, ToolType } from "../types/InApp";
import "../styles/InApp.css";

import { Member } from "../types/Member";
import { RoleColumn, SubTask } from "../types/Project";
import { Task } from "../types/Task";

import { useAuth } from "../context/AuthContext";

import ProjectService from "../services/ProjectService";

import "../styles/Project.css";

interface Friend {
  username: string;
  name: string;
  avatarInitial: string;
}

const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const currentProjectId = projectId || null;
  const numericProjectId = projectId ? Number(projectId) : null;

  const { token } = useAuth();

  const { cursors, handleMouseMove: handleLiveMouseMove } = useLiveCursors(
    token || "Anonymous"
  );

  // --- 인앱 툴(창) 상태 관리 ---
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);

  const dragItem = useRef<{
    id: number;
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
  } | null>(null);

  const resizeItem = useRef<{
    id: number;
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  // 창 열기
  const openWindow = (type: ToolType, title: string) => {
    let defaultW = 300;
    let defaultH = 400;
    if (type === "calculator") {
      defaultW = 220;
      defaultH = 320;
    }
    if (type === "timer") {
      defaultW = 200;
      defaultH = 150;
    }
    if (type === "youtube") {
      defaultW = 340;
      defaultH = 240;
    }
    if (type === "code-review") {
      defaultW = 700;
      defaultH = 500;
    }

    const newWindow: AppWindow = {
      id: Date.now(),
      type,
      title,
      x: 150 + windows.length * 30,
      y: 100 + windows.length * 30,
      zIndex: windows.length + 100,
      minimized: false,
      width: defaultW,
      height: defaultH,
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const closeWindow = (id: number) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  const bringToFront = (id: number) => {
    setActiveWindowId(id);
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 100);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  };

  // --- 🖱️ 마우스 이벤트 핸들러 (창 이동 & 리사이즈) ---
  const handleMouseDownHeader = (
    e: React.MouseEvent,
    id: number,
    x: number,
    y: number
  ) => {
    e.stopPropagation();
    bringToFront(id);
    dragItem.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: x,
      initialTop: y,
    };
  };

  const handleMouseDownResize = (
    e: React.MouseEvent,
    id: number,
    w: number,
    h: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    bringToFront(id);
    resizeItem.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: w,
      initialHeight: h,
    };
  };

  const handleWindowMouseMove = (e: React.MouseEvent) => {
    if (resizeItem.current) {
      const { id, startX, startY, initialWidth, initialHeight } =
        resizeItem.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      setWindows((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                width: Math.max(300, initialWidth + dx),
                height: Math.max(200, initialHeight + dy),
              }
            : w
        )
      );
      return;
    }
    if (dragItem.current) {
      const { id, startX, startY, initialLeft, initialTop } = dragItem.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, x: initialLeft + dx, y: initialTop + dy } : w
        )
      );
    }
  };

  const handleMouseUp = () => {
    dragItem.current = null;
    resizeItem.current = null;
  };

  // --- 프로젝트 상태 ---
  const [members, setMembers] = useState<Member[]>([]);
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myProjects, setMyProjects] = useState<{ id: string; name: string }[]>(
    []
  );
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const isRightSidebarCollapsed = false;
  const [activeTab, setActiveTab] = useState("taskBoard");

  const toggleLeftSidebar = () =>
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen);

  // 🔥 [핵심 함수] 변경사항 생길 때마다 서버에 저장하는 함수
  const saveToServer = async (
    newColumns: RoleColumn[],
    newMembers: Member[]
  ) => {
    if (!currentProjectId) return;
    try {
      await ProjectService.saveProjectState(
        currentProjectId,
        newColumns,
        newMembers
      );
    } catch (e) {
      console.error("저장 실패", e);
    }
  };

  // --- Handlers (Member/Role/SubTask) ---

  const handleAddMemberFromFriend = (friendId: number, friendName: string) => {
    if (members.some((m) => m.id === friendId)) {
      alert("이미 존재");
      return;
    }
    const newMember: Member = {
      id: friendId,
      name: friendName,
      isOnline: true,
      role: "팀원",
    };
    const newMembers = [...members, newMember];

    setMembers(newMembers);
    saveToServer(columns, newMembers);
  };

  const handleAddMember = () => {
    const newName = prompt("새 멤버의 이름을 입력하세요:");
    if (!newName?.trim()) return;
    const trimmed = newName.trim();

    const newMember: Member = { id: Date.now(), name: trimmed, isOnline: true };
    const newMembers = [...members, newMember];

    setMembers(newMembers);
    saveToServer(columns, newMembers);
  };

  const handleDeleteMember = (memberId: number) => {
    if (!window.confirm("정말로 이 멤버를 삭제하시겠습니까?")) return;

    const newMembers = members.filter((member) => member.id !== memberId);
    const newColumns = columns.map((col) => ({
      ...col,
      members: col.members.filter((m) => m.id !== memberId),
    }));

    // Task의 담당자에서도 제거
    const memberName = members.find((m) => m.id === memberId)?.name;
    const newTasks = tasks.map((t) => ({
      ...t,
      members: t.members.filter((name) => name !== memberName),
    }));

    setMembers(newMembers);
    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, newMembers);
  };

  // RoleColumn 관리 핸들러 (TaskBoard에서 onAddColumn, onDeleteColumn으로 사용됨)
  const handleAddRoleColumn = (name: string) => {
    const newColumn: RoleColumn = {
      id: Date.now(),
      name,
      members: [],
    };
    const newColumns = [...columns, newColumn];
    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  const handleDeleteRoleColumn = (columnId: number) => {
    const newColumns = columns.filter((col) => col.id !== columnId);
    // 해당 Column ID를 가진 Task도 모두 삭제
    const newTasks = tasks.filter((t) => t.columnId !== columnId);

    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, members);
  };

  const handleAddMemberToColumn = (columnId: number, memberId: number) => {
    // TaskBoard1에서 사용되던 Role에 멤버를 직접 추가하는 로직 (현재 TaskBoard2에서는 사용되지 않음)
    const destinationColumn = columns.find((col) => col.id === columnId);
    if (!destinationColumn) return;

    if (destinationColumn.members.some((m) => m.id === memberId)) {
      alert("이 역할에는 이미 배정된 멤버입니다.");
      return;
    }

    const memberInfo = members.find((m) => m.id === memberId);
    if (!memberInfo) return;

    const newColumns = columns.map((col) =>
      col.id === columnId
        ? {
            ...col,
            members: [
              ...col.members,
              { ...memberInfo, status: "작업전", subTasks: [] },
            ],
          }
        : col
    );

    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  const handleDropMemberOnColumn = (columnId: number, memberId: number) => {
    handleAddMemberToColumn(columnId, memberId);
  };

  // SubTask 핸들러들 (TaskDetails용)
  const handleAddSubTask = (
    columnId: number,
    memberId: number,
    content: string
  ) => {
    const newColumns = columns.map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        members: col.members.map((m) => {
          if (m.id !== memberId) return m;
          const newSubTask: SubTask = {
            id: Date.now(),
            content,
            completed: false,
          };
          const currentSubTasks = m.subTasks || [];
          return { ...m, subTasks: [...currentSubTasks, newSubTask] };
        }),
      };
    });
    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  const handleToggleSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    const newColumns = columns.map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        members: col.members.map((m) => {
          if (m.id !== memberId) return m;
          return {
            ...m,
            subTasks: m.subTasks?.map((t) =>
              t.id === subTaskId ? { ...t, completed: !t.completed } : t
            ),
          };
        }),
      };
    });
    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  const handleDeleteSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    const newColumns = columns.map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        members: col.members.map((m) => {
          if (m.id !== memberId) return m;
          return {
            ...m,
            subTasks: m.subTasks?.filter((t) => t.id !== subTaskId),
          };
        }),
      };
    });
    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  const handleDeleteMemberFromColumn = (columnId: number, memberId: number) => {
    const newColumns = columns.map((col) =>
      col.id === columnId
        ? { ...col, members: col.members.filter((m) => m.id !== memberId) }
        : col
    );
    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  const handleInviteFriendToColumn = (
    columnId: number,
    friendId: string,
    friendName: string
  ) => {
    const id = parseInt(friendId, 10);
    const isAlreadyMember = members.some((member) => member.id === id);

    if (window.confirm(`${friendName}님을 이 역할에 초대하시겠습니까?`)) {
      let newMembers = [...members];
      if (!isAlreadyMember) {
        newMembers.push({
          id,
          name: friendName,
          isOnline: false,
          role: "팀원",
        });
        setMembers(newMembers);
      }

      const newColumns = columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              members: [
                ...col.members,
                { id, name: friendName, status: "작업전", subTasks: [] },
              ],
            }
          : col
      );

      setColumns(newColumns);
      saveToServer(newColumns, newMembers);
    }
  };

  // --- Handlers (TaskBoard용, Task 상태 및 할당 관리) ---

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("태스크를 삭제하시겠습니까?")) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleAssignMemberToTask = (taskId: number, memberId: number) => {
    const memberData = members.find((m) => m.id === memberId);
    if (!memberData) return;

    const memberName = memberData.name;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          // 이미 배정되어 있다면 제거, 아니면 추가 (토글)
          if (t.members.includes(memberName)) {
            return {
              ...t,
              members: t.members.filter((name) => name !== memberName),
            };
          } else {
            return {
              ...t,
              members: [...t.members, memberName],
            };
          }
        }
        return t;
      })
    );
  };

  const handleSelectTask = (tid: number) => {
    setSelectedTaskId(tid);
    setActiveTab("taskDetails");
  };

  const handleUpdateTask = (t: Task) => {
    setTasks((prev) => prev.map((tk) => (tk.id === t.id ? t : tk)));
  };
  // 1. [누락된 함수] 멤버 상태 변경 (작업전 -> 완료 등)
  const handleUpdateMemberStatus = (
    columnId: number,
    memberId: number,
    status: string
  ) => {
    const newColumns = columns.map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        members: col.members.map((m) =>
          m.id === memberId ? { ...m, status } : m
        ),
      };
    });
    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  // 2. [누락된 함수] 멤버 메모 수정
  const handleUpdateMemberMemo = (
    columnId: number,
    memberId: number,
    memo: string
  ) => {
    const newColumns = columns.map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        members: col.members.map((m) =>
          m.id === memberId ? { ...m, memo } : m
        ),
      };
    });
    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  // 3. [누락된 함수] 멤버 이동 (드래그 앤 드롭으로 컬럼 이동)
  const handleMoveMemberBetweenColumns = (
    memberId: number,
    sourceColId: number,
    destColId: number
  ) => {
    // 출발 컬럼 찾기
    const sourceCol = columns.find((c) => c.id === sourceColId);
    // 이동할 멤버 정보 찾기
    const memberToMove = sourceCol?.members.find((m) => m.id === memberId);

    if (!sourceCol || !memberToMove) return;

    // 컬럼 업데이트
    const newColumns = columns.map((col) => {
      // 원래 있던 곳에서 삭제
      if (col.id === sourceColId) {
        return {
          ...col,
          members: col.members.filter((m) => m.id !== memberId),
        };
      }
      // 새로운 곳에 추가
      if (col.id === destColId) {
        // 중복 방지
        if (col.members.some((m) => m.id === memberId)) return col;
        return { ...col, members: [...col.members, memberToMove] };
      }
      return col;
    });

    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  const handleAddTask = (columnId: number, status: string) => {
    const title = prompt("새로운 할 일을 입력하세요:");
    if (!title) return;

    const newTask: Task = {
      id: Date.now(),
      columnId, // 어느 컬럼에 추가할지
      title,
      status, // "TODO", "IN_PROGRESS" 등
      members: [],
    };

    // 화면에 즉시 반영
    setTasks((prev) => [...prev, newTask]);

    // (참고: 현재 saveToServer는 columns/members만 저장하므로,
    // 나중에 tasks도 저장하도록 saveToServer 수정이 필요할 수 있습니다.)
  };

  const loadData = async () => {
    if (!token) return;
    try {
      const myList = await ProjectService.getMyProjects(token);
      setMyProjects(myList.map((p: any) => ({ id: p._id, name: p.name }))); // _id -> id

      const myFriends = await UserService.getFriends(token);
      setFriends(myFriends);

      if (currentProjectId) {
        const projectData = await ProjectService.getProject(currentProjectId);
        if (projectData) {
          setColumns(projectData.columns || []);
          // 멤버 로직 등...
        }
      }
    } catch (e) {
      console.error("데이터 로드 실패", e);
    }
  };

  // 🔥 [수정 3] 데이터 로드 (ProjectService 사용)
  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token, currentProjectId]);

  return (
    <div
      className="project-layout"
      onMouseMove={(e) => {
        handleWindowMouseMove(e);
        handleLiveMouseMove(e);
      }}
      onMouseUp={handleMouseUp}
    >
      <LiveCursors cursors={cursors} />
      <Header onMenuClick={toggleSlideout} />

      <SlideoutSidebar
        isOpen={isSlideoutOpen}
        onClose={toggleSlideout}
        projects={myProjects}
        friends={friends}
        onRefreshFriends={loadData} // 🔥 새로고침 연결
      />

      <div
        className="workspace-container"
        style={{ marginLeft: isSlideoutOpen ? 280 : 0 }}
      >
        <aside
          className={`left-sidebar ${
            isLeftSidebarCollapsed ? "collapsed" : ""
          }`}
        >
          <MemberList
            members={members}
            onAddMemberClick={handleAddMember}
            onDeleteMember={handleDeleteMember}
            onAddMemberFromFriend={handleAddMemberFromFriend}
          />
        </aside>

        <main className="project-main" style={{ position: "relative" }}>
          {/* 🔹 [인앱 툴 렌더링 영역] */}
          {windows.map((win) => (
            <div
              key={win.id}
              className="window-frame"
              style={{
                left: win.x,
                top: win.y,
                width: win.width,
                height: win.height,
                zIndex: win.zIndex,
                border:
                  activeWindowId === win.id
                    ? "1px solid #4f46e5"
                    : "1px solid #ccc",
                boxShadow:
                  activeWindowId === win.id
                    ? "0 10px 30px rgba(79, 70, 229, 0.2)"
                    : "0 5px 15px rgba(0,0,0,0.1)",
              }}
              onMouseDown={() => bringToFront(win.id)}
            >
              <div
                className="window-header"
                onMouseDown={(e) =>
                  handleMouseDownHeader(e, win.id, win.x, win.y)
                }
              >
                <span className="window-title">{win.title}</span>
                <div className="window-controls">
                  <button
                    className="btn-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(win.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div
                className="window-body"
                style={{ width: "100%", height: "100%", overflow: "hidden" }}
              >
                {win.type === "calculator" && <Calculator />}
                {win.type === "memo" && <MemoPad />}
                {win.type === "timer" && <Timer />}
                {win.type === "youtube" && <YouTubePlayer />}
                {win.type === "code-review" && <CodeReviewer />}
              </div>
              <div
                className="resize-handle"
                onMouseDown={(e) =>
                  handleMouseDownResize(e, win.id, win.width, win.height)
                }
              />
            </div>
          ))}

          {/* 🔹 [하단 독 Dock] */}
          <div className="in-app-dock">
            <div
              className="dock-icon"
              onClick={() => openWindow("calculator", "계산기")}
            >
              <div className="icon-box">🧮</div>
              <span>계산기</span>
            </div>
            <div
              className="dock-icon"
              onClick={() => openWindow("memo", "메모장")}
            >
              <div className="icon-box">📝</div>
              <span>메모장</span>
            </div>
            <div
              className="dock-icon"
              onClick={() => openWindow("timer", "타이머")}
            >
              <div className="icon-box">⏱️</div>
              <span>타이머</span>
            </div>
            <div
              className="dock-icon"
              onClick={() => openWindow("youtube", "유튜브")}
            >
              <div
                className="icon-box"
                style={{ background: "#ffcccc", color: "red" }}
              >
                ▶️
              </div>
              <span>유튜브</span>
            </div>
            <div
              className="dock-icon"
              onClick={() => openWindow("code-review", "코드 리뷰")}
            >
              <div
                className="icon-box"
                style={{ background: "#1e1e1e", color: "#00bcd4" }}
              >
                💻
              </div>
              <span>코드리뷰</span>
            </div>
          </div>

          <button className="toggle-btn left" onClick={toggleLeftSidebar}>
            {isLeftSidebarCollapsed ? "▶" : "◀"}
          </button>

          <div className="tabs-container">
            {[
              { key: "taskBoard", label: "작업 보드" },
              { key: "taskDetails", label: "세부 작업 내용" },
              { key: "schedule", label: "작업 일정" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ProgressBar tasks={tasks} />

          <div className="tab-content-area">
            {activeTab === "taskBoard" && (
              <TaskBoard
                columns={columns}
                members={members}
                tasks={tasks}
                // --- Role/Column 관리 핸들러 ---
                onAddColumn={handleAddRoleColumn}
                onDeleteColumn={handleDeleteRoleColumn}
                // --- TaskBoard1의 Legacy props (더미 또는 기존 로직) ---
                onAddMemberToColumn={handleAddMemberToColumn}
                onMoveMember={handleMoveMemberBetweenColumns}
                onUpdateStatus={handleUpdateMemberStatus}
                onDeleteMember={(colId, memId) =>
                  handleDeleteMemberFromColumn(colId, memId)
                }
                onUpdateMemberMemo={handleUpdateMemberMemo}
                onInviteFriend={handleInviteFriendToColumn}
                onDropMemberOnColumn={handleDropMemberOnColumn}
                // --- TaskBoard2의 필수 Task 핸들러 (추가됨) ---
                onAddTask={handleAddTask}
                onUpdateTaskStatus={handleUpdateTaskStatus} // ✨ 추가
                onDeleteTask={handleDeleteTask} // ✨ 추가
                onAssignMemberToTask={handleAssignMemberToTask} // ✨ 추가
                onSelectTask={handleSelectTask}
              />
            )}
            {activeTab === "taskDetails" && (
              <TaskDetails
                columns={columns}
                members={members}
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onAddSubTask={handleAddSubTask}
                onToggleSubTask={handleToggleSubTask}
                onDeleteSubTask={handleDeleteSubTask}
              />
            )}
            {activeTab === "schedule" && (
              <Schedule tasks={tasks} onUpdateTask={handleUpdateTask} />
            )}
          </div>
        </main>

        <aside
          className={`right-sidebar ${
            isRightSidebarCollapsed ? "collapsed" : ""
          }`}
        >
          <ChatBox projectId={currentProjectId} />
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default Project;
