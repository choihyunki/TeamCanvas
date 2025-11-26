import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

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
import UserService from "../services/UserService";
// 🔥 [추가] 분리한 TaskService 임포트
import TaskService from "../services/TaskService";

import "../styles/Project.css";

interface Friend {
  username: string;
  name: string;
  avatarInitial: string;
}

const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const currentProjectId = projectId || null;
  const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

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

  // --- 프로젝트 데이터 상태 ---
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

  // --- 서버 저장 및 로드 ---
  const saveToServer = async (
    newColumns: RoleColumn[],
    newMembers: Member[],
    newTasks?: Task[]
  ) => {
    if (!currentProjectId) return;
    const tasksToSave = newTasks || tasks;

    console.log("💾 저장 시도:", {
      projectId: currentProjectId,
      columns: newColumns,
      members: newMembers,
      tasks: tasksToSave,
    });

    try {
      await ProjectService.saveProjectState(
        currentProjectId,
        newColumns,
        newMembers,
        tasksToSave
      );
      console.log("✅ 저장 성공!");
      const socket = io(SERVER_URL);
      socket.emit("update_board", currentProjectId);
    } catch (e) {
      console.error("❌ 저장 실패:", e);
      toast.error("저장에 실패했습니다.");
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
          if (projectData.tasks && Array.isArray(projectData.tasks)) {
            setTasks(projectData.tasks);
          }
        }
      }
    } catch (e) {
      console.error("데이터 로드 실패", e);
    }
  };

  useEffect(() => {
    loadData();
    if (currentProjectId) {
      const socket = io(SERVER_URL);
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

  // --- 핸들러 (TaskService 적용으로 깔끔해짐) ---

  const handleAddMemberFromFriend = (
    friendId: number | string,
    friendName: string
  ) => {
    if (members.some((m) => m.name === friendName)) {
      toast.success("이미 존재하는 멤버입니다.");
      return;
    }
    const friendInfo = friends.find((f) => f.name === friendName);
    const fid = typeof friendId === "string" ? Date.now() : friendId;
    const realUsername =
      friendInfo?.username ||
      (typeof friendId === "string" ? friendId : friendName);

    const newMember: Member = {
      id: fid,
      name: friendName,
      username: realUsername,
      avatarInitial: friendInfo?.avatarInitial || friendName[0],
      isOnline: false,
      role: "팀원",
    };

    const newMembers = [...members, newMember];
    setMembers(newMembers);
    saveToServer(columns, newMembers, tasks);
    toast.success(`${friendName}님을 추가했습니다!`);
  };

  const handleAddMember = () => {
    if (friends.length === 0) {
      toast.error("친구 목록이 비어있습니다.");
      return;
    }
    const friendListStr = friends.map((f) => f.name).join(", ");
    const inputName = prompt(`초대할 친구 이름 입력:\n(${friendListStr})`);
    if (!inputName?.trim()) return;
    const targetName = inputName.trim();

    const targetFriend = friends.find((f) => f.name === targetName);
    if (!targetFriend) {
      toast.error("친구 목록에 없는 사용자입니다.");
      return;
    }
    if (members.some((m) => m.name === targetName)) {
      toast.success("이미 멤버입니다.");
      return;
    }

    const newMember: Member = {
      id: Date.now(),
      name: targetFriend.name,
      username: targetFriend.username,
      avatarInitial: targetFriend.avatarInitial,
      isOnline: false,
      role: "팀원",
    };

    const newMembers = [...members, newMember];
    setMembers(newMembers);
    saveToServer(columns, newMembers, tasks);
    toast.success(`${targetName}님을 추가했습니다!`);
  };

  const handleDeleteMember = (memberId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const newMembers = members.filter((m) => m.id !== memberId);

    // 컬럼에서도 제거
    const newColumns = columns.map((col) => ({
      ...col,
      members: col.members.filter((m) => m.id !== memberId),
    }));

    // 🔥 [수정] TaskService를 사용해 태스크에서도 담당자 제거
    const memberName = members.find((m) => m.id === memberId)?.name;
    let newTasks = tasks;
    if (memberName) {
      newTasks = TaskService.removeMemberFromTasks(tasks, memberName);
    }

    setMembers(newMembers);
    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, newMembers, newTasks);
  };

  const handleAddColumn = (name: string) => {
    const newColumn: RoleColumn = { id: Date.now(), name, members: [] };
    const newColumns = [...columns, newColumn];
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleDeleteColumn = (columnId: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    const newColumns = columns.filter((col) => col.id !== columnId);

    // 🔥 [수정] TaskService를 사용해 해당 컬럼의 태스크도 삭제
    const newTasks = TaskService.removeTasksByColumn(tasks, columnId);

    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, members, newTasks);
  };

  const handleAddMemberToColumn = (columnId: number, memberId: number) => {
    const destCol = columns.find((c) => c.id === columnId);
    if (!destCol) return;
    if (destCol.members.some((m) => m.id === memberId)) {
      toast.success("이미 배정됨");
      return;
    }
    const memberInfo = members.find((m) => m.id === memberId);
    if (!memberInfo) {
      toast.error("멤버 정보를 찾을 수 없습니다.");
      return;
    }

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
    saveToServer(newColumns, members, tasks);
  };

  const handleDropMemberOnColumn = (columnId: number, memberId: number) => {
    handleAddMemberToColumn(columnId, memberId);
  };

  const handleInviteFriendToColumn = (
    columnId: number,
    friendId: string,
    friendName: string
  ) => {
    const friendInfo = friends.find((f) => f.name === friendName);
    const avatar = friendInfo?.avatarInitial || friendName[0];
    const realUsername = friendInfo?.username || friendName;
    const fid = Date.now();

    if (window.confirm(`${friendName}님을 이 역할에 초대하시겠습니까?`)) {
      let newMembers = [...members];
      let targetId = fid;

      if (!members.some((m) => m.name === friendName)) {
        newMembers.push({
          id: fid,
          name: friendName,
          username: realUsername,
          avatarInitial: avatar,
          isOnline: false,
          role: "팀원",
        });
        setMembers(newMembers);
      } else {
        const existing = members.find((m) => m.name === friendName);
        if (existing) targetId = existing.id;
      }

      const newColumns = columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              members: [
                ...col.members,
                {
                  id: targetId,
                  name: friendName,
                  username: realUsername,
                  status: "작업전",
                  subTasks: [],
                },
              ],
            }
          : col
      );
      setColumns(newColumns);
      saveToServer(newColumns, newMembers, tasks);

      // 알림 전송
      const currentProjectInfo = myProjects.find(
        (p) => p.id === currentProjectId
      );
      const realProjectName = currentProjectInfo
        ? currentProjectInfo.name
        : "프로젝트";
      const socket = io(SERVER_URL);
      socket.emit("invite_user", {
        targetUsername: realUsername,
        projectName: realProjectName,
      });

      toast.success("초대되었습니다!");
    }
  };

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
    saveToServer(newColumns, members, tasks);
  };

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
    saveToServer(newColumns, members, tasks);
  };

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
    saveToServer(newColumns, members, tasks);
  };

  // --- 🔥 [수정] Task 관련 핸들러 (TaskService 사용으로 간소화됨) ---

  const handleAddTask = (columnId: number, status: string) => {
    const title = prompt("할 일을 입력하세요:");
    if (!title) return;

    // TaskService로 로직 위임
    const newTasks = TaskService.createTask(tasks, columnId, status, title);
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    // TaskService로 로직 위임
    const newTasks = TaskService.updateStatus(tasks, taskId, newStatus);
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("삭제하시겠습니까?")) {
      // TaskService로 로직 위임
      const newTasks = TaskService.deleteTask(tasks, taskId);
      setTasks(newTasks);
      saveToServer(columns, members, newTasks);
    }
  };

  const handleAssignMemberToTask = (taskId: number, memberId: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    // TaskService로 로직 위임
    const newTasks = TaskService.toggleMemberAssignment(tasks, taskId, member);
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleSelectTask = (tid: number) => {
    setSelectedTaskId(tid);
    setActiveTab("taskDetails");
  };

  const handleUpdateTask = (updatedTask: Task) => {
    // TaskService로 로직 위임
    const newTasks = TaskService.updateTaskDetail(tasks, updatedTask);
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleUpdateTaskFromObject = (updatedTask: Task) => {
    handleUpdateTask(updatedTask);
  };

  // 1. 세부 작업 추가
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
          const newSub = { id: Date.now(), content, completed: false };
          // subTasks가 없을 수도 있으니 안전하게 처리
          return { ...m, subTasks: [...(m.subTasks || []), newSub] };
        }),
      };
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  // 2. 세부 작업 체크/해제 (토글)
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
            subTasks: m.subTasks?.map((sub) =>
              sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub
            ),
          };
        }),
      };
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  // 3. 세부 작업 삭제
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
            subTasks: m.subTasks?.filter((sub) => sub.id !== subTaskId),
          };
        }),
      };
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

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
                onDeleteMember={(colId, memId) => handleDeleteMember(memId)}
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
                onUpdateTask={handleUpdateTaskFromObject}
                onAddSubTask={handleAddSubTask}
                onToggleSubTask={handleToggleSubTask} // 구현된 함수 연결
                onDeleteSubTask={handleDeleteSubTask} // 구현된 함수 연결
              />
            )}
            {activeTab === "schedule" && (
              <Schedule
                tasks={tasks}
                onUpdateTask={handleUpdateTaskFromObject}
              />
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
