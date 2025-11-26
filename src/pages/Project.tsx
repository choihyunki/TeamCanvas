import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client"; // 소켓 사용

import Header from "../components/Header";
import Footer from "../components/Footer";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import TaskDetails from "../components/TaskDetails";
import Schedule from "../components/Schedule";
import SlideoutSidebar from "../components/SlideoutSidebar";
import ProgressBar from "../components/ProgressBar";
import ChatBox from "../components/ChatBox";

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
import UserService from "../services/UserService"; // 친구 목록 로드용

import "../styles/Project.css";

// 친구 인터페이스 (DB와 맞춤)
interface Friend {
  username: string;
  name: string;
  avatarInitial: string;
}

const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const currentProjectId = projectId || null; // MongoDB ID는 문자열

  const { token } = useAuth();

  // 실시간 커서
  const { cursors, handleMouseMove: handleLiveMouseMove } = useLiveCursors(
    token || "Anonymous"
  );

  // --- [1] 인앱 툴(창) 상태 관리 (보내주신 코드의 드래그 로직 적용) ---
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
      defaultW = 600;
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

  // 마우스 이벤트 핸들러 (창 이동 & 리사이즈)
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

  // --- [2] 프로젝트 데이터 상태 ---
  const [members, setMembers] = useState<Member[]>([]);
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [myProjects, setMyProjects] = useState<{ id: string; name: string }[]>(
    []
  );

  // 사이드바 UI 상태
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const isRightSidebarCollapsed = false;
  const [activeTab, setActiveTab] = useState("taskBoard");

  const toggleLeftSidebar = () =>
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen);

  // --- [3] 서버 저장 및 로드 로직 (ProjectService 사용) ---

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

      // 실시간 동기화 신호 전송
      const socket = io("http://localhost:4000");
      socket.emit("update_board", currentProjectId);
    } catch (e) {
      console.error("저장 실패", e);
    }
  };

  const loadData = async () => {
    if (!token) return;
    try {
      const myList = await ProjectService.getMyProjects(token);
      setMyProjects(
        myList.map((p: any) => ({ id: String(p._id), name: p.name }))
      );

      const myFriends = await UserService.getFriends(token);
      setFriends(myFriends);

      if (currentProjectId) {
        const projectData = await ProjectService.getProject(currentProjectId);
        if (projectData) {
          setColumns(projectData.columns || []);
          if (projectData.members && Array.isArray(projectData.members)) {
            const memberObjs = projectData.members.map(
              (m: any, idx: number) => {
                if (typeof m === "string")
                  return { id: idx + 1000, name: m, isOnline: true };
                return m;
              }
            );
            if (memberObjs.length > 0) setMembers(memberObjs);
          }
        }
      }
    } catch (e) {
      console.error("데이터 로드 실패", e);
    }
  };

  useEffect(() => {
    loadData();

    // 실시간 동기화 리스너
    if (currentProjectId) {
      const socket = io("http://localhost:4000");
      socket.emit("join_room", currentProjectId);
      socket.on("board_updated", () => {
        console.log("보드 업데이트 감지!");
        loadData();
      });
      return () => {
        socket.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentProjectId]);

  // --- [4] 핸들러 구현 (보내주신 로직 + 서버 저장 결합) ---

  const handleAddMemberFromFriend = (friendId: number, friendName: string) => {
    // 친구 추가는 임시 ID 사용 허용
    if (members.some((m) => m.name === friendName)) {
      // 이름으로 중복 체크
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

    const newMember: Member = {
      id: Date.now(),
      name: newName.trim(),
      isOnline: true,
    };
    const newMembers = [...members, newMember];
    setMembers(newMembers);
    saveToServer(columns, newMembers);
  };

  const handleDeleteMember = (memberId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const newMembers = members.filter((m) => m.id !== memberId);
    // 컬럼에서도 삭제
    const newColumns = columns.map((col) => ({
      ...col,
      members: col.members.filter((m) => m.id !== memberId),
    }));
    // 태스크에서도 삭제
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

  const handleAddColumn = (name: string) => {
    const newColumn: RoleColumn = { id: Date.now(), name, members: [] };
    const newColumns = [...columns, newColumn];
    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  const handleDeleteColumn = (columnId: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    const newColumns = columns.filter((col) => col.id !== columnId);
    const newTasks = tasks.filter((t) => t.columnId !== columnId);
    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, members);
  };

  // 멤버를 특정 컬럼(역할)에 추가
  const handleAddMemberToColumn = (columnId: number, memberId: number) => {
    const destCol = columns.find((c) => c.id === columnId);
    if (!destCol) return;
    if (destCol.members.some((m) => m.id === memberId)) {
      alert("이미 배정됨");
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

  // 멤버 상태 변경
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

  // 멤버 메모 변경
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

  // 멤버 이동 (드래그)
  const handleMoveMemberBetweenColumns = (
    memberId: number,
    sourceColId: number,
    destColId: number
  ) => {
    const sourceCol = columns.find((c) => c.id === sourceColId);
    const memberToMove = sourceCol?.members.find((m) => m.id === memberId);
    if (!sourceCol || !memberToMove) return;

    const newColumns = columns.map((col) => {
      if (col.id === sourceColId)
        return {
          ...col,
          members: col.members.filter((m) => m.id !== memberId),
        };
      if (col.id === destColId) {
        if (col.members.some((m) => m.id === memberId)) return col;
        return { ...col, members: [...col.members, memberToMove] };
      }
      return col;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members);
  };

  // 친구 초대 (컬럼에 바로)
  const handleInviteFriendToColumn = (
    columnId: number,
    friendId: string,
    friendName: string
  ) => {
    const fid = parseInt(friendId, 10) || Date.now(); // ID가 없으면 임시생성
    if (window.confirm(`${friendName}님을 초대하시겠습니까?`)) {
      let newMembers = [...members];
      if (!members.some((m) => m.name === friendName)) {
        newMembers.push({
          id: fid,
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
                { id: fid, name: friendName, status: "작업전", subTasks: [] },
              ],
            }
          : col
      );
      setColumns(newColumns);
      saveToServer(newColumns, newMembers);
    }
  };

  // --- Task 관련 핸들러 ---

  const handleAddTask = (columnId: number, status: string) => {
    const title = prompt("할 일을 입력하세요:");
    if (!title) return;
    const newTask: Task = {
      id: Date.now(),
      columnId,
      status,
      title,
      members: [],
    };
    setTasks((prev) => [...prev, newTask]);
    // (참고: 현재 saveToServer는 Task 저장을 지원하지 않는 구조라면, 나중에 백엔드 API 확장이 필요할 수 있음)
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("삭제하시겠습니까?")) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleAssignMemberToTask = (taskId: number, memberId: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const hasMember = t.members.includes(member.name);
        return {
          ...t,
          members: hasMember
            ? t.members.filter((n) => n !== member.name)
            : [...t.members, member.name],
        };
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

  // 서브태스크 핸들러 (TaskDetails용)
  const handleAddSubTask = (colId: number, memId: number, content: string) => {
    /* 구현 생략 가능하지만 에러 방지용 */
  };
  const handleToggleSubTask = (c: number, m: number, s: number) => {};
  const handleDeleteSubTask = (c: number, m: number, s: number) => {};

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

      {/* 윈도우 렌더링 */}
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
            onMouseDown={(e) => handleMouseDownHeader(e, win.id, win.x, win.y)}
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

      {/* 헤더 & 사이드바 */}
      <Header onMenuClick={toggleSlideout} />
      <SlideoutSidebar
        isOpen={isSlideoutOpen}
        onClose={toggleSlideout}
        projects={myProjects}
        friends={friends}
        onRefreshFriends={loadData}
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
          {/* 독(Dock) 메뉴 */}
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
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
                onAddMemberToColumn={handleAddMemberToColumn}
                onMoveMember={handleMoveMemberBetweenColumns}
                onUpdateStatus={handleUpdateMemberStatus}
                onDeleteMember={(colId, memId) => handleDeleteMember(memId)} // [주의] 여기서는 전체 멤버삭제 로직 사용
                onUpdateMemberMemo={handleUpdateMemberMemo}
                onInviteFriend={handleInviteFriendToColumn}
                onAddTask={handleAddTask}
                onSelectTask={handleSelectTask}
                onDropMemberOnColumn={handleDropMemberOnColumn}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
                onAssignMemberToTask={handleAssignMemberToTask}
              />
            )}
            {activeTab === "taskDetails" && (
              <TaskDetails
                columns={columns}
                members={members}
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onUpdateTask={handleUpdateTask}
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
