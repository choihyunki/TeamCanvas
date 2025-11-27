import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { RoleColumn, SubTask, ProjectMember } from "../types/Project";
import { Task } from "../types/Task";

import { useAuth } from "../context/AuthContext";
import ProjectService from "../services/ProjectService";
import UserService from "../services/UserService";
// TaskService는 직접 로직을 구현했으므로 import만 해두거나 제거해도 됩니다.
import TaskService from "../services/TaskService";

import "../styles/Project.css";

interface Friend {
  username: string;
  name: string;
  avatarInitial: string;
}

// 🔥 [타입 정의] ProjectMember와 Member의 속성을 병합한 타입
type ExtendedProjectMember = ProjectMember & {
  name?: string;
  role?: string;
};

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const currentProjectId = projectId || "";

  const { token } = useAuth();
  const guestName = token ? `User_${token.substring(0, 4)}` : "Guest";

  const socketRef = useRef<any>(null);

  // Live Cursors
  const { cursors, handleMouseMove: handleLiveMouseMove } = useLiveCursors(
    guestName
  );

  // --- 상태 관리 ---
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  // 사이드바 및 UI 상태
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  // 🔥 [오류 수정] 누락되었던 왼쪽 사이드바 상태 추가
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState("taskBoard");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [myProjects, setMyProjects] = useState<{ id: string; name: string }[]>([]);

  // 인앱 툴 상태
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(100);

  // 드래그 앤 리사이즈 Refs
  const dragItem = useRef<{ id: number; startX: number; startY: number; initialLeft: number; initialTop: number; } | null>(null);
  const resizeItem = useRef<{ id: number; startX: number; startY: number; initialWidth: number; initialHeight: number; } | null>(null);

  // 사이드바 토글 함수
  const toggleLeftSidebar = () => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen);

  // --- 서버 저장 함수 ---
  const saveToServer = useCallback(async (
    newColumns: RoleColumn[],
    newMembers: Member[],
    newTasks?: Task[]
  ) => {
    if (!currentProjectId) return;
    const tasksToSave = newTasks || tasks;

    try {
      await ProjectService.saveProjectState(
        currentProjectId,
        newColumns,
        newMembers,
        tasksToSave
      );

      // 소켓으로 업데이트 알림 전송
      if (socketRef.current) {
        socketRef.current.emit("update_board", String(currentProjectId));
      }
    } catch (error) {
      console.error("프로젝트 상태 저장 실패:", error);
      // toast.error("저장 실패"); // 잦은 토스트 방지
    }
  }, [currentProjectId, tasks]);

  // --- 데이터 로드 함수 ---
  const fetchProjectData = useCallback(async () => {
    if (!currentProjectId) return;
    try {
      const data = await ProjectService.getProject(currentProjectId);
      setColumns(data.columns || []);
      setMembers(data.members || []);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("프로젝트 데이터 로드 실패:", error);
    }
  }, [currentProjectId]);

  const fetchFriends = useCallback(async () => {
    if (!token) return;
    try {
      const friendData = await UserService.getFriends(token);
      setFriends(friendData || []);
    } catch (error) {
      console.error("친구 목록 로드 실패:", error);
    }
  }, [token]);

  const loadMyProjects = useCallback(async () => {
    if (!token) return;
    try {
      const list = await ProjectService.getMyProjects(token);
      setMyProjects(list.map((p: any) => ({ id: String(p._id), name: p.name })));
    } catch (e) {
      console.error("내 프로젝트 로드 실패", e);
    }
  }, [token]);

  useEffect(() => {
    fetchProjectData();
    fetchFriends();
    loadMyProjects();
  }, [fetchProjectData, fetchFriends, loadMyProjects]);

  // --- 소켓 연결 ---
  useEffect(() => {
  if (!currentProjectId || !token) return;

  socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

  // 🔥 [수정] 로그인한 유저의 "username" 가져오기 (토큰 디코딩 필요)
  // useAuth()에서 user 객체를 제공한다면 user.username을 사용하세요.
  // 여기서는 localStorage의 예시를 듭니다. (본인 로직에 맞게 수정 필요)
  const myUsername = localStorage.getItem("username"); // 예: "kim1234"

  socketRef.current.on("connect", () => {
    if (myUsername) {
      // 🔥 [중요] ID(숫자)가 아니라 username(문자)를 보냅니다.
      socketRef.current.emit("register_user", myUsername);
    }
  });

  const roomName = String(currentProjectId);
  socketRef.current.emit("join_room", roomName);

  socketRef.current.on("board_updated", () => {
    fetchProjectData();
  });

  // 🔥 [수정] 실시간 상태 변경 알림 (username 기준 매칭)
  socketRef.current.on("user_status_change", ({ username, isOnline }: { username: string, isOnline: boolean }) => {
    
    // 1. 프로젝트 멤버 업데이트
    setMembers((prevMembers) =>
      prevMembers.map((m) =>
        // 멤버의 이름(name)이나 username이 소켓에서 온 username과 같으면 상태 변경
        (m.name === username) ? { ...m, isOnline: isOnline } : m
      )
    );

    // 2. 사이드바 친구 목록 업데이트
    setFriends((prevFriends) =>
      (prevFriends as any[]).map((f) =>
        (f.username === username) ? { ...f, isOnline: isOnline } : f
      )
    );
  });

  // 🔥 [수정] 초기 온라인 목록 로드
  socketRef.current.on("current_online_users", (onlineUsernames: string[]) => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        isOnline: onlineUsernames.includes(m.name), // 이름으로 매칭
      }))
    );

    setFriends((prev) =>
      (prev as any[]).map((f) => ({
        ...f,
        isOnline: onlineUsernames.includes(f.username), // username으로 매칭
      }))
    );
  });

  return () => {
    socketRef.current.disconnect();
  };
}, [currentProjectId, token]);


  // --- 인앱 툴 관리 핸들러 ---
  const openWindow = (type: ToolType, title: string) => {
    let defaultW = 300;
    let defaultH = 400;
    if (type === "calculator") { defaultW = 220; defaultH = 320; }
    if (type === "timer") { defaultW = 200; defaultH = 150; }
    if (type === "youtube") { defaultW = 340; defaultH = 240; }
    if (type === "code-review") { defaultW = 600; defaultH = 500; }

    const newWindow: AppWindow = {
      id: Date.now(),
      type,
      title,
      x: 150 + windows.length * 30,
      y: 100 + windows.length * 30,
      zIndex: highestZIndex + 1,
      minimized: false,
      width: defaultW,
      height: defaultH,
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setHighestZIndex(highestZIndex + 1);
  };

  const closeWindow = (id: number) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  const bringToFront = (id: number) => {
    setActiveWindowId(id);
    setHighestZIndex(prev => prev + 1);
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w)));
  };

  const handleOpenApp = (type: ToolType, title: string) => {
    openWindow(type, title);
  };

  // 창 이동/리사이즈 핸들러
  const handleMouseDownHeader = (e: React.MouseEvent, id: number, x: number, y: number) => {
    e.stopPropagation();
    bringToFront(id);
    dragItem.current = { id, startX: e.clientX, startY: e.clientY, initialLeft: x, initialTop: y };
  };

  const handleMouseDownResize = (e: React.MouseEvent, id: number, w: number, h: number) => {
    e.stopPropagation();
    e.preventDefault();
    bringToFront(id);
    resizeItem.current = { id, startX: e.clientX, startY: e.clientY, initialWidth: w, initialHeight: h };
  };

  const handleWindowMouseMove = (e: React.MouseEvent) => {
    if (resizeItem.current) {
      const { id, startX, startY, initialWidth, initialHeight } = resizeItem.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setWindows((prev) => prev.map((w) => w.id === id ? { ...w, width: Math.max(300, initialWidth + dx), height: Math.max(200, initialHeight + dy) } : w));
      return;
    }
    if (dragItem.current) {
      const { id, startX, startY, initialLeft, initialTop } = dragItem.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setWindows((prev) => prev.map((w) => w.id === id ? { ...w, x: initialLeft + dx, y: initialTop + dy } : w));
    }
  };

  const handleMouseUp = () => {
    dragItem.current = null;
    resizeItem.current = null;
  };


  // --- 프로젝트 멤버 관리 핸들러 ---

  const handleAddMemberFromFriend = (friendId: number | string, friendName: string) => {
    if (members.some((m) => m.name === friendName)) {
      toast.success("이미 존재하는 멤버입니다.");
      return;
    }
    // ID 처리: 문자열이면 임시 숫자 ID 사용 (NaN 방지)
    const fid = typeof friendId === "string" ? Date.now() : friendId;

    const newMember: Member = {
      id: fid,
      name: friendName,
      isOnline: false,
      role: "팀원",
    };

    setMembers((prev) => {
      const updatedMembers = [...prev, newMember];
      saveToServer(columns, updatedMembers, tasks);
      return updatedMembers;
    });
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

    // 컬럼에서도 해당 멤버 제거
    const newColumns = columns.map((col) => ({
      ...col,
      members: col.members.filter((m) => m.id !== memberId),
    }));

    const memberName = members.find((m) => m.id === memberId)?.name;
    let newTasks = tasks;

    // 태스크 담당자에서도 제거
    if (memberName) {
      newTasks = tasks.map(t => ({
        ...t,
        members: t.members.filter(n => n !== memberName)
      }));
    }

    setMembers(newMembers);
    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, newMembers, newTasks);
  };

  // --- 컬럼(역할) 관리 핸들러 ---

  const handleAddColumn = (name: string) => {
    const newColumnId = columns.length > 0 ? Math.max(...columns.map((c) => c.id)) + 1 : 1;
    const newColumn: RoleColumn = { id: newColumnId, name: name, members: [], };
    setColumns((prev) => {
      const updatedColumns = [...prev, newColumn];
      saveToServer(updatedColumns, members, tasks);
      return updatedColumns;
    });
  };

  const handleDeleteColumn = (columnId: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    const newColumns = columns.filter((col) => col.id !== columnId);
    // 해당 컬럼의 태스크들도 삭제
    const newTasks = tasks.filter(t => t.columnId !== columnId);

    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, members, newTasks);
  };

  // --- 멤버 -> 컬럼 배정 핸들러 ---

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

    // ExtendedProjectMember 타입 사용 (타입 호환성 해결)
    const newProjectMember: ExtendedProjectMember = {
      id: memberId,
      name: memberInfo.name,
      role: memberInfo.role,
      status: "TODO", // 기본 상태
      subTasks: [],
      memo: ""
    } as ExtendedProjectMember;

    const newColumns = columns.map((col) =>
      col.id === columnId
        ? {
          ...col,
          members: [
            ...col.members,
            newProjectMember
          ] as ExtendedProjectMember[],
        } as RoleColumn
        : col
    );
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleDropMemberOnColumn = (columnId: number, memberId: number) => {
    handleAddMemberToColumn(columnId, memberId);
  };

  // 친구를 바로 컬럼으로 초대
  const handleInviteFriendToColumn = (columnId: number, friendName: string) => {
    const friend = friends.find((f) => f.name === friendName);
    if (!friend) return;

    const isAlreadyMember = members.some((m) => m.name === friendName);
    if (!isAlreadyMember) {
      const newMemberId = members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1;
      const newMember: Member = {
        id: newMemberId,
        name: friendName,
        isOnline: false,
        role: "팀원",
      };

      const newMembers = [...members, newMember];
      setMembers(newMembers);

      // 새 멤버 추가 후 컬럼에도 추가
      // (비동기 상태 업데이트 이슈가 있을 수 있으므로 여기서는 멤버 추가만 하고 알림)
      toast.info(`${friendName}님을 멤버로 추가했습니다. 다시 드래그해주세요.`);
      // saveToServer는 setMembers 내부에서 호출됨
    } else {
      const memberId = members.find((m) => m.name === friendName)?.id;
      if (memberId) {
        handleDropMemberOnColumn(columnId, memberId);
        toast.info(`${friendName}님을 보드에 배정했습니다.`);
      }
    }
  };

  const handleUpdateMemberStatus = (columnId: number, memberId: number, status: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        members: col.members.map((m) =>
          m.id === memberId ? { ...m, status } : m
        ) as ExtendedProjectMember[],
      } as RoleColumn;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleUpdateMemberMemo = (columnId: number, memberId: number, memo: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        members: col.members.map((m) =>
          m.id === memberId ? { ...m, memo } : m
        ) as ExtendedProjectMember[],
      } as RoleColumn;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleMoveMemberBetweenColumns = (memberId: number, sourceColId: number, destColId: number) => {
    const sourceCol = columns.find((c) => c.id === sourceColId);
    const memberToMove = sourceCol?.members.find((m) => m.id === memberId);
    if (!sourceCol || !memberToMove) return;

    const newColumns = columns.map((col) => {
      if (col.id === sourceColId)
        return {
          ...col,
          members: col.members.filter((m) => m.id !== memberId) as ExtendedProjectMember[],
        } as RoleColumn;
      if (col.id === destColId) {
        if (col.members.some((m) => m.id === memberId)) return col;
        return { ...col, members: [...col.members, memberToMove] as ExtendedProjectMember[] } as RoleColumn;
      }
      return col;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  // --- Task 관련 핸들러 ---

  const handleAddTask = (columnId: number, status: string) => {
    const title = prompt("할 일을 입력하세요:");
    if (!title) return;

    const newTaskId = Date.now();
    const newTask: Task = {
      id: newTaskId,
      columnId,
      status: status.toUpperCase(),
      title,
      members: [],
    };

    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    const newTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("삭제하시겠습니까?")) {
      const newTasks = tasks.filter((t) => t.id !== taskId);
      setTasks(newTasks);
      saveToServer(columns, members, newTasks);

      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
        setActiveTab("taskBoard");
      }
    }
  };

  const handleAssignMemberToTask = (taskId: number, memberId: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const newTasks = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const hasMember = t.members.includes(member.name);
      return {
        ...t,
        members: hasMember
          ? t.members.filter((n) => n !== member.name)
          : [...t.members, member.name],
      };
    });

    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  // --- 상세 페이지 관련 ---
  const handleSelectTask = (tid: number) => {
    setSelectedTaskId(tid);
    setActiveTab("taskDetails");
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = tasks.map((tk) =>
      tk.id === updatedTask.id ? updatedTask : tk
    );
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleUpdateTaskFromObject = (updatedTask: Task) => {
    handleUpdateTask(updatedTask);
  };

  // --- 🔥 SubTask 핸들러 (TaskDetails 연동) ---

  const handleAddSubTask = (
    columnId: number,
    memberId: number,
    content: string
  ) => {
    const newSubTask: SubTask = {
      id: Date.now(),
      content: content,
      completed: false,
    };

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => {
        if (col.id !== columnId) return col;

        return {
          ...col,
          members: col.members.map((m) => {
            if (m.id !== memberId) return m;

            const existingSubTasks = m.subTasks || [];
            return {
              ...m,
              subTasks: [...existingSubTasks, newSubTask],
            };
          }) as ExtendedProjectMember[],
        } as RoleColumn;
      });

      saveToServer(newColumns, members, tasks);
      return newColumns;
    });
  };

  const handleToggleSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => {
        if (col.id !== columnId) return col;

        return {
          ...col,
          members: col.members.map((m) => {
            if (m.id !== memberId) return m;

            return {
              ...m,
              subTasks: (m.subTasks || []).map((st) =>
                st.id === subTaskId ? { ...st, completed: !st.completed } : st
              ),
            };
          }) as ExtendedProjectMember[],
        } as RoleColumn;
      });

      saveToServer(newColumns, members, tasks);
      return newColumns;
    });
  };

  const handleDeleteSubTask = (
    columnId: number,
    memberId: number,
    subTaskId: number
  ) => {
    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => {
        if (col.id !== columnId) return col;

        return {
          ...col,
          members: col.members.map((m) => {
            if (m.id !== memberId) return m;

            return {
              ...m,
              subTasks: (m.subTasks || []).filter((st) => st.id !== subTaskId),
            };
          }) as ExtendedProjectMember[],
        } as RoleColumn;
      });

      saveToServer(newColumns, members, tasks);
      return newColumns;
    });
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
        onRefreshFriends={fetchFriends} 
      />

      <div
        className="workspace-container"
        style={{ marginLeft: isSlideoutOpen ? 280 : 0 }}
      >
        <aside
          className={`left-sidebar ${isLeftSidebarCollapsed ? "collapsed" : ""
            }`}
        >
          <MemberList
            members={members}
            onAddMemberClick={handleAddMember}
            onDeleteMember={handleDeleteMember}
            onAddMemberFromFriend={(friendId, friendName) => handleAddMemberFromFriend(friendId, friendName)}
          />
        </aside>

        <main className="project-main" style={{ position: "relative" }}>
          <div className="in-app-dock">
            <div
              className="dock-icon"
              onClick={() => handleOpenApp("calculator", "계산기")}
            >
              <div className="icon-box">🧮</div>
              <span>계산기</span>
            </div>
            <div
              className="dock-icon"
              onClick={() => handleOpenApp("memo", "메모장")}
            >
              <div className="icon-box">📝</div>
              <span>메모장</span>
            </div>
            <div
              className="dock-icon"
              onClick={() => handleOpenApp("timer", "타이머")}
            >
              <div className="icon-box">⏱️</div>
              <span>타이머</span>
            </div>
            <div
              className="dock-icon"
              onClick={() => handleOpenApp("youtube", "유튜브")}
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
              onClick={() => handleOpenApp("code-review", "코드 리뷰")}
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
                onToggleSubTask={handleToggleSubTask}
                onDeleteSubTask={handleDeleteSubTask}
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
          className={`right-sidebar ${isRightSidebarCollapsed ? "collapsed" : ""
            }`}
        >
          <ChatBox projectId={currentProjectId} />
          <button
            className="collapse-btn"
            onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
          >
            {isRightSidebarCollapsed ? ">>" : "<<"}
          </button>
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default Project;