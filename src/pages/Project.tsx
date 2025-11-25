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

// 타입 (Project.ts 수정 필수!)
import { Member } from "../types/Member";
import { RoleColumn, SubTask } from "../types/Project";
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

  // 🔥 [수정] 훅 이름 매칭 (useLiveCursors 반환값 확인 필요, 여기선 handleLiveMouseMove로 가정)
  const { cursors, handleMouseMove: handleLiveMouseMove } = useLiveCursors(
    token || "Anonymous"
  );

  // --- 인앱 툴(창) 상태 ---
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

  const closeWindow = (id: number) =>
    setWindows(windows.filter((w) => w.id !== id));
  const bringToFront = (id: number) => {
    setActiveWindowId(id);
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 100);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  };

  // 마우스 핸들러
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
    );
  };

  const handleAddColumn = (name: string) => {
    setColumns((prev) => [...prev, { id: Date.now(), name, members: [] }]);
  };
  const handleDeleteColumn = (columnId: number) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  };
  const handleAddMemberToColumn = (columnId: number, memberId: number) => {
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
    setFriends(getFriends());
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
      onMouseMove={(e) => {
        handleWindowMouseMove(e);
        handleLiveMouseMove(e);
      }}
      onMouseUp={handleMouseUp}
    >
      <LiveCursors cursors={cursors} />
      <Header onMenuClick={toggleSlideout} onOpenWindow={openWindow} />

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
          {/* 창 렌더링 */}
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
                // 🔥 [수정 완료] TaskDetails Props 일치
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
