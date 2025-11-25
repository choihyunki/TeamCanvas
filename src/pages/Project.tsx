import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import TaskDetails from "../components/TaskDetails";
import Schedule from "../components/Schedule";
import SlideoutSidebar from "../components/SlideoutSidebar";
import ProgressBar from "../components/ProgressBar";
import ChatBox from "../components/ChatBox";

<<<<<<< HEAD
// 인앱 툴 관련 import
=======
// 실시간 커서
import LiveCursors from "../components/LiveCursors";
import { useLiveCursors } from "../hooks/useLiveCursors";

// 인앱 툴
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
import {
  Calculator,
  MemoPad,
  Timer,
  YouTubePlayer,
  CodeReviewer,
} from "../components/InAppTools";
import { AppWindow, ToolType } from "../types/InApp";
import "../styles/InApp.css";

<<<<<<< HEAD
import { Member } from "../types/Member";
// 🔥 SubTask 타입 import (에러 해결)
import { RoleColumn, ProjectMember, SubTask } from "../types/Project";
=======
// 타입 (Project.ts 수정 필수!)
import { Member } from "../types/Member";
import { RoleColumn, SubTask } from "../types/Project";
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
import { Task } from "../types/Task";

import { useAuth } from "../context/AuthContext";
import {
  getProjectsForUser,
  getProjectById,
  ProjectRecord,
  addMemberToProject,
  removeMemberFromProject,
  getFriends,
} from "../data/mockDb";

import "../styles/Project.css";

interface Friend {
  id: number;
  name: string;
  avatarInitial: string;
}

const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const numericProjectId = projectId ? Number(projectId) : null;
  const { token } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setCurrentProject] = useState<ProjectRecord | null>(null);

<<<<<<< HEAD
  // --- 인앱 툴(창) 상태 관리 ---
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);

  // 🔥 드래그 상태 저장을 위한 Ref (창 이동용)
=======
  // 🔥 [수정] 훅 이름 매칭 (useLiveCursors 반환값 확인 필요, 여기선 handleLiveMouseMove로 가정)
  const { cursors, handleMouseMove: handleLiveMouseMove } = useLiveCursors(
    token || "Anonymous"
  );

  // --- 인앱 툴(창) 상태 ---
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
  const dragItem = useRef<{
    id: number;
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
  } | null>(null);
<<<<<<< HEAD
  // 🔥 리사이즈 상태 저장을 위한 Ref (창 크기 조절용)
=======
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD
      defaultW = 600;
=======
      defaultW = 700;
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
      defaultH = 500;
    }

    const newWindow: AppWindow = {
      id: Date.now(),
      type,
      title,
<<<<<<< HEAD
      x: 150 + windows.length * 40,
      y: 100 + windows.length * 40,
=======
      x: 150 + windows.length * 30,
      y: 100 + windows.length * 30,
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
      zIndex: windows.length + 100,
      minimized: false,
      width: defaultW,
      height: defaultH,
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
  };

<<<<<<< HEAD
  const closeWindow = (id: number) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

=======
  const closeWindow = (id: number) =>
    setWindows(windows.filter((w) => w.id !== id));
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
  const bringToFront = (id: number) => {
    setActiveWindowId(id);
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 100);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  };

<<<<<<< HEAD
  // --- 🖱️ 마우스 이벤트 핸들러 (창 이동 & 리사이즈) ---
=======
  // 마우스 핸들러
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD

=======
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD

  const handleMouseMove = (e: React.MouseEvent) => {
=======
  const handleWindowMouseMove = (e: React.MouseEvent) => {
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD
                width: Math.max(200, initialWidth + dx),
                height: Math.max(150, initialHeight + dy),
=======
                width: Math.max(300, initialWidth + dx),
                height: Math.max(200, initialHeight + dy),
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD

=======
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
  const handleMouseUp = () => {
    dragItem.current = null;
    resizeItem.current = null;
  };

<<<<<<< HEAD
  // --- 기존 프로젝트 로직 ---
  const [members, setMembers] = useState<Member[]>([]);
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]); // (구) 태스크 - 에러 방지용 유지
=======
  // --- 프로젝트 상태 ---
  const [members, setMembers] = useState<Member[]>([]);
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myProjects, setMyProjects] = useState<{ id: number; name: string }[]>(
    []
  );
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const isRightSidebarCollapsed = false;
  const [activeTab, setActiveTab] = useState("taskBoard");

  const toggleLeftSidebar = () =>
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen);

<<<<<<< HEAD
  // --- Handlers ---

  // 🔥 [핵심] 멤버를 '컬럼(작업 보드)'에 드롭했을 때 (subTasks 초기화 추가)
  const handleDropMemberOnColumn = (columnId: number, memberId: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const targetColumn = columns.find((col) => col.id === columnId);
    if (!targetColumn) return;

    if (targetColumn.members.some((m) => m.id === memberId)) {
      alert(`${member.name}님은 이미 이 작업 보드에 배정되어 있습니다.`);
      return;
    }

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              // 🔥 subTasks: [] 필수 추가 (에러 해결)
              members: [
                ...col.members,
                { id: memberId, status: "작업전", subTasks: [] },
              ],
            }
          : col
      )
    );
  };

  // 🔥 세부 작업 추가 핸들러
  const handleAddSubTask = (
    columnId: number,
    memberId: number,
    content: string
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
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
      })
    );
  };

  // 🔥 세부 작업 완료 토글 핸들러
  const handleToggleSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          members: col.members.map((m) => {
            if (m.id !== memberId) return m;
            return {
              ...m,
              subTasks: m.subTasks.map((t) =>
                t.id === subTaskId ? { ...t, completed: !t.completed } : t
              ),
            };
          }),
        };
      })
    );
  };

  // 🔥 세부 작업 삭제 핸들러
  const handleDeleteSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          members: col.members.map((m) => {
            if (m.id !== memberId) return m;
            return {
              ...m,
              subTasks: m.subTasks.filter((t) => t.id !== subTaskId),
            };
          }),
        };
      })
    );
  };

  const handleInviteFriendToColumn = (
    columnId: number,
    friendId: string,
    friendName: string
  ) => {
    const id = parseInt(friendId, 10);
    const isAlreadyMember = members.some((member) => member.id === id);
    const targetColumn = columns.find((col) => col.id === columnId);
    const isAlreadyInThisColumn = targetColumn?.members.some(
      (m) => m.id === id
    );

    if (isAlreadyInThisColumn) {
      alert("이 역할에는 이미 배정된 멤버입니다.");
      return;
    }

    if (window.confirm(`${friendName}님을 이 역할에 초대하시겠습니까?`)) {
      if (!isAlreadyMember) {
        const newMember: Member = {
          id,
          name: friendName,
          isOnline: false,
          role: "팀원",
        };
        setMembers((prev) => [...prev, newMember]);
      }
      if (numericProjectId !== null) {
        addMemberToProject(numericProjectId, friendName);
      }

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? // 🔥 subTasks: [] 추가
              {
                ...col,
                members: [
                  ...col.members,
                  { id, status: "작업전", subTasks: [] },
                ],
              }
            : col
        )
      );
    }
  };

  const handleAddMember = () => {
    const newName = prompt("새 멤버의 이름을 입력하세요:");
    if (!newName) return;
    const trimmed = newName.trim();
    if (!trimmed) return;
    const newMember: Member = {
      id: new Date().getTime(),
      name: trimmed,
      isOnline: true,
    };
    setMembers((prevMembers) => [...prevMembers, newMember]);
    if (numericProjectId !== null)
      addMemberToProject(numericProjectId, trimmed);
  };

  const handleDeleteMember = (memberId: number) => {
    if (!window.confirm("정말로 이 멤버를 삭제하시겠습니까?")) return;
    const target = members.find((m) => m.id === memberId);
    if (target && numericProjectId !== null)
      removeMemberFromProject(numericProjectId, target.name);
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.id !== memberId)
=======
  // --- 핸들러 ---
  const handleAddMemberFromFriend = (friendId: number, friendName: string) => {
    if (members.some((m) => m.id === friendId)) {
      alert("이미 존재");
      return;
    }
    setMembers((prev) => [
      ...prev,
      { id: friendId, name: friendName, isOnline: true },
    ]);
  };
  const handleAddMember = () => {
    const newName = prompt("이름 입력:");
    if (!newName?.trim()) return;
    setMembers((prev) => [
      ...prev,
      { id: Date.now(), name: newName.trim(), isOnline: true },
    ]);
  };
  const handleDeleteMember = (id: number) => {
    if (!window.confirm("삭제?")) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        members: col.members.filter((m) => m.id !== id),
      }))
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
    );
  };

  const handleAddColumn = (name: string) => {
<<<<<<< HEAD
    const newColumn: RoleColumn = {
      id: columns.length > 0 ? Math.max(...columns.map((c) => c.id)) + 1 : 101,
      name,
      members: [],
    };
    setColumns([...columns, newColumn]);
=======
    setColumns((prev) => [...prev, { id: Date.now(), name, members: [] }]);
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
  };
  const handleDeleteColumn = (columnId: number) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  };
  const handleAddMemberToColumn = (columnId: number, memberId: number) => {
<<<<<<< HEAD
    const destinationColumn = columns.find((col) => col.id === columnId);
    if (!destinationColumn) return;
    if (destinationColumn.members.some((m) => m.id === memberId)) {
      alert("이 역할에는 이미 배정된 멤버입니다.");
      return;
    }
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? // 🔥 subTasks: [] 추가
            {
              ...col,
              members: [
                ...col.members,
                { id: memberId, status: "작업전", subTasks: [] },
              ],
            }
          : col
      )
    );
  };

  const handleMoveMemberBetweenColumns = (
    mid: number,
    from: number,
    to: number
  ) => {
    /* ... */
  };
  const handleUpdateMemberStatus = (cid: number, mid: number, st: string) => {
    /* ... */
  };

  const handleDeleteMemberFromColumn = (columnId: number, memberId: number) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, members: col.members.filter((m) => m.id !== memberId) }
          : col
      )
    );
  };

  const handleUpdateMemberMemo = (cid: number, mid: number, memo: string) => {
    /* ... */
  };
  const handleAddTask = (cid: number, title: string) => {
    /* ... */
  };
=======
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              members: [
                ...col.members,
                { id: memberId, status: "작업전", subTasks: [] },
              ],
            } // 🔥 subTasks 초기화 필수
          : col
      )
    );
  };

  // 🔥 드래그 앤 드롭 핸들러
  const handleDropMemberOnColumn = (columnId: number, memberId: number) => {
    const targetColumn = columns.find((c) => c.id === columnId);
    if (targetColumn?.members.some((m) => m.id === memberId)) {
      alert("이미 배정된 멤버입니다.");
      return;
    }
    handleAddMemberToColumn(columnId, memberId);
  };

  // 🔥 SubTask 핸들러들
  const handleAddSubTask = (
    columnId: number,
    memberId: number,
    content: string
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          members: col.members.map((m) => {
            if (m.id !== memberId) return m;
            const newSub: SubTask = {
              id: Date.now(),
              content,
              completed: false,
            };
            return { ...m, subTasks: [...(m.subTasks || []), newSub] };
          }),
        };
      })
    );
  };

  const handleToggleSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
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
      })
    );
  };

  const handleDeleteSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
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
      })
    );
  };

  // 더미 핸들러 (에러 방지)
  const handleMoveMemberBetweenColumns = () => {};
  const handleUpdateMemberStatus = () => {};
  const handleUpdateMemberMemo = () => {};
  const handleAddTask = () => {};
  const handleInviteFriendToColumn = () => {};
  const handleDeleteMemberFromColumn = (cid: number, mid: number) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === cid
          ? { ...col, members: col.members.filter((m) => m.id !== mid) }
          : col
      )
    );
  };
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
  const handleSelectTask = (tid: number) => {
    setSelectedTaskId(tid);
    setActiveTab("taskDetails");
  };
  const handleUpdateTask = (t: Task) => {
    setTasks((prev) => prev.map((tk) => (tk.id === t.id ? t : tk)));
  };

  useEffect(() => {
    if (!token) return;
    const myList = getProjectsForUser(token);
    setMyProjects(myList.map((p) => ({ id: p.id, name: p.name })));
<<<<<<< HEAD
=======
    setFriends(getFriends());
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
    if (numericProjectId !== null) {
      const record = getProjectById(numericProjectId);
      if (record) {
        setCurrentProject(record);
        setMembers(
          record.members.map((name, idx) => ({
            id: idx + 1000,
            name,
            isOnline: true,
          }))
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, numericProjectId]);

  return (
    <div
      className="project-layout"
<<<<<<< HEAD
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Header onMenuClick={toggleSlideout} />
=======
      onMouseMove={(e) => {
        handleWindowMouseMove(e);
        handleLiveMouseMove(e);
      }}
      onMouseUp={handleMouseUp}
    >
      <LiveCursors cursors={cursors} />
      <Header onMenuClick={toggleSlideout} onOpenWindow={openWindow} />
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544

      <SlideoutSidebar
        isOpen={isSlideoutOpen}
        onClose={toggleSlideout}
        projects={myProjects}
        friends={friends}
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
<<<<<<< HEAD
          {/* 🔹 [인앱 툴 렌더링 영역] */}
=======
          {/* 창 렌더링 */}
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
<<<<<<< HEAD
                style={{ width: "100%", height: "100%", overflow: "auto" }}
=======
                style={{ width: "100%", height: "100%", overflow: "hidden" }}
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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

<<<<<<< HEAD
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

=======
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
                // 🔥 [수정 완료] TaskBoard Props 일치
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
                onAddMemberToColumn={handleAddMemberToColumn}
                onMoveMember={handleMoveMemberBetweenColumns}
                onUpdateStatus={handleUpdateMemberStatus}
                onDeleteMember={(colId, memId) =>
                  handleDeleteMemberFromColumn(colId, memId)
                }
                onUpdateMemberMemo={handleUpdateMemberMemo}
                onInviteFriend={handleInviteFriendToColumn}
                onAddTask={handleAddTask}
                onSelectTask={handleSelectTask}
                onDropMemberOnColumn={handleDropMemberOnColumn}
              />
            )}
            {activeTab === "taskDetails" && (
              <TaskDetails
                columns={columns}
                members={members}
<<<<<<< HEAD
=======
                // 🔥 [수정 완료] TaskDetails Props 일치
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
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
          <ChatBox projectId={numericProjectId} />
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default Project;
