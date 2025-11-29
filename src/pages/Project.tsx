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
  const { cursors, handleMouseMove: handleLiveMouseMove } =
    useLiveCursors(guestName);

  // --- 상태 관리 ---
  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  // 사이드바 및 UI 상태
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState("taskBoard");

  // 🔥 [수정] ID 타입 string
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [myProjects, setMyProjects] = useState<{ id: string; name: string }[]>(
    []
  );

  // 인앱 툴 상태
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(100);

  // 드래그 앤 리사이즈 Refs
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

  // 사이드바 토글 함수
  const toggleLeftSidebar = () =>
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  const toggleSlideout = () => setIsSlideoutOpen(!isSlideoutOpen);

  // --- 서버 저장 함수 ---
  const saveToServer = useCallback(
    async (
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
      }
    },
    [currentProjectId, tasks]
  );

  // --- 데이터 로드 함수 ---
  const fetchProjectData = useCallback(async () => {
    if (!currentProjectId) return;
    try {
      const data = await ProjectService.getProject(currentProjectId);
      setColumns(data.columns || []);

      // 🔥 [수정] 멤버 ID 문자열 변환 보장
      if (data.members && Array.isArray(data.members)) {
        const memberObjs = data.members.map((m: any, idx: number) => {
          const safeId = m.id ? String(m.id) : String(idx + 1000);
          if (typeof m === "string")
            return { id: safeId, name: m, isOnline: true };
          return { ...m, id: safeId };
        });
        setMembers(memberObjs);
      }

      // 🔥 [수정] 태스크 ID 문자열 변환 보장
      if (data.tasks && Array.isArray(data.tasks)) {
        const taskObjs = data.tasks.map((t: any) => ({
          ...t,
          id: String(t.id),
          columnId: String(t.columnId),
        }));
        setTasks(taskObjs);
      }
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
      setMyProjects(
        list.map((p: any) => ({ id: String(p._id), name: p.name }))
      );
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

    const myUsername = localStorage.getItem("userName"); // userName으로 저장된 값 사용 권장

    socketRef.current.on("connect", () => {
      if (myUsername) {
        socketRef.current.emit("register_user", myUsername);
      }
    });

    const roomName = String(currentProjectId);
    socketRef.current.emit("join_room", roomName);

    socketRef.current.on("board_updated", () => {
      fetchProjectData();
    });

    // 실시간 상태 변경 알림
    socketRef.current.on(
      "user_status_change",
      ({ username, isOnline }: { username: string; isOnline: boolean }) => {
        setMembers((prevMembers) =>
          prevMembers.map((m) =>
            m.name === username ? { ...m, isOnline: isOnline } : m
          )
        );
        setFriends((prevFriends) =>
          (prevFriends as any[]).map((f) =>
            f.username === username ? { ...f, isOnline: isOnline } : f
          )
        );
      }
    );

    // 초기 온라인 목록 로드
    socketRef.current.on(
      "current_online_users",
      (onlineUsernames: string[]) => {
        setMembers((prev) =>
          prev.map((m) => ({
            ...m,
            isOnline: onlineUsernames.includes(m.name),
          }))
        );
        setFriends((prev) =>
          (prev as any[]).map((f) => ({
            ...f,
            isOnline: onlineUsernames.includes(f.username),
          }))
        );
      }
    );

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentProjectId, token, fetchProjectData]); // fetchProjectData 추가

  // --- 인앱 툴 관리 핸들러 (그대로 유지) ---
  // ... (openWindow, closeWindow, bringToFront, handleMouseDown... 등 기존 로직 유지)
  // ... (간소화를 위해 생략하지 않고 모두 포함)

  const handleOpenApp = (type: ToolType, title: string) => {
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
      zIndex: highestZIndex + 1,
      minimized: false,
      width: defaultW,
      height: defaultH,
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setHighestZIndex((prev) => prev + 1);
  };

  const closeWindow = (id: number) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  const bringToFront = (id: number) => {
    setActiveWindowId(id);
    setHighestZIndex((prev) => prev + 1);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w))
    );
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

  // --- 프로젝트 멤버 관리 핸들러 ---

  const handleAddMemberFromFriend = (
    friendId: number | string,
    friendName: string
  ) => {
    if (members.some((m) => m.name === friendName)) {
      toast.success("이미 존재하는 멤버입니다.");
      return;
    }
    const friendInfo = friends.find((f) => f.name === friendName);
    // 🔥 [수정] ID를 문자열로 변환
    const fid = typeof friendId === "string" ? friendId : String(friendId);
    // 혹은 기존 로직대로 Date.now().toString() 사용 가능
    // const fid = Date.now().toString();

    const newMember: Member = {
      id: fid,
      name: friendName,
      // username 필드는 Member 타입에 정의되어 있다면 사용
      username: friendInfo?.username || friendName,
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
      id: Date.now().toString(), // 🔥 String ID
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

  const handleDeleteMember = (memberId: number | string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    // 🔥 String 비교
    const mIdStr = String(memberId);
    const newMembers = members.filter((m) => String(m.id) !== mIdStr);

    const newColumns = columns.map((col) => ({
      ...col,
      members: col.members.filter((m) => String(m.id) !== mIdStr),
    }));

    const memberName = members.find((m) => String(m.id) === mIdStr)?.name;
    let newTasks = tasks;
    if (memberName) {
      newTasks = TaskService.removeMemberFromTasks(tasks, memberName);
    }

    setMembers(newMembers);
    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, newMembers, newTasks);
  };

  // --- 컬럼(역할) 관리 핸들러 ---

  const handleAddColumn = (name: string) => {
    const newColumnId = Date.now().toString(); // 🔥 String ID
    const newColumn: RoleColumn = { id: newColumnId, name: name, members: [] };
    setColumns((prev) => {
      const updatedColumns = [...prev, newColumn];
      saveToServer(updatedColumns, members, tasks);
      return updatedColumns;
    });
  };

  const handleDeleteColumn = (columnId: number | string) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    const cIdStr = String(columnId);
    const newColumns = columns.filter((col) => String(col.id) !== cIdStr);
    const newTasks = TaskService.removeTasksByColumn(tasks, cIdStr);

    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, members, newTasks);
  };

  // --- 멤버 -> 컬럼 배정 핸들러 ---

  const handleAddMemberToColumn = (
    columnId: number | string,
    memberId: number | string
  ) => {
    const cIdStr = String(columnId);
    const mIdStr = String(memberId);

    const destCol = columns.find((c) => String(c.id) === cIdStr);
    if (!destCol) return;
    if (destCol.members.some((m) => String(m.id) === mIdStr)) {
      toast.success("이미 배정됨");
      return;
    }
    const memberInfo = members.find((m) => String(m.id) === mIdStr);
    if (!memberInfo) {
      toast.error("멤버 정보를 찾을 수 없습니다.");
      return;
    }

    const newProjectMember: ExtendedProjectMember = {
      id: mIdStr,
      name: memberInfo.name,
      role: memberInfo.role,
      status: "TODO",
      subTasks: [],
      memo: "",
    } as ExtendedProjectMember;

    const newColumns = columns.map((col) =>
      String(col.id) === cIdStr
        ? ({
            ...col,
            members: [
              ...col.members,
              newProjectMember,
            ] as ExtendedProjectMember[],
          } as RoleColumn)
        : col
    );
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleDropMemberOnColumn = (
    columnId: number | string,
    memberId: number | string
  ) => {
    handleAddMemberToColumn(columnId, memberId);
  };

  // 친구를 바로 컬럼으로 초대
  const handleInviteFriendToColumn = (
    columnId: number | string,
    friendId: string,
    friendName: string
  ) => {
    const friendInfo = friends.find((f) => f.name === friendName);
    const avatar = friendInfo?.avatarInitial || friendName[0];
    const realUsername = friendInfo?.username || friendName;

    // 🔥 String ID
    const fid = Date.now().toString();

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

      const cIdStr = String(columnId);
      const newColumns = columns.map((col) =>
        String(col.id) === cIdStr
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
                } as any,
              ],
            }
          : col
      );
      setColumns(newColumns);
      saveToServer(newColumns, newMembers, tasks);

      // 초대 알림
      if (socketRef.current) {
        const currentProjectInfo = myProjects.find(
          (p) => p.id === currentProjectId
        );
        const realProjectName = currentProjectInfo
          ? currentProjectInfo.name
          : "프로젝트";
        socketRef.current.emit("invite_user", {
          targetUsername: realUsername,
          projectName: realProjectName,
        });
      }
      toast.success("초대되었습니다!");
    }
  };

  const handleUpdateMemberStatus = (
    columnId: number | string,
    memberId: number | string,
    status: string
  ) => {
    const newColumns = columns.map((col) => {
      if (String(col.id) !== String(columnId)) return col;
      return {
        ...col,
        members: col.members.map((m) =>
          String(m.id) === String(memberId) ? { ...m, status } : m
        ) as ExtendedProjectMember[],
      } as RoleColumn;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleUpdateMemberMemo = (
    columnId: number | string,
    memberId: number | string,
    memo: string
  ) => {
    const newColumns = columns.map((col) => {
      if (String(col.id) !== String(columnId)) return col;
      return {
        ...col,
        members: col.members.map((m) =>
          String(m.id) === String(memberId) ? { ...m, memo } : m
        ) as ExtendedProjectMember[],
      } as RoleColumn;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleMoveMemberBetweenColumns = (
    memberId: number | string,
    sourceColId: number | string,
    destColId: number | string
  ) => {
    const mIdStr = String(memberId);
    const sIdStr = String(sourceColId);
    const dIdStr = String(destColId);

    const sourceCol = columns.find((c) => String(c.id) === sIdStr);
    const memberToMove = sourceCol?.members.find(
      (m) => String(m.id) === mIdStr
    );
    if (!sourceCol || !memberToMove) return;

    const newColumns = columns.map((col) => {
      if (String(col.id) === sIdStr)
        return {
          ...col,
          members: col.members.filter(
            (m) => String(m.id) !== mIdStr
          ) as ExtendedProjectMember[],
        } as RoleColumn;
      if (String(col.id) === dIdStr) {
        if (col.members.some((m) => String(m.id) === mIdStr)) return col;
        return {
          ...col,
          members: [...col.members, memberToMove] as ExtendedProjectMember[],
        } as RoleColumn;
      }
      return col;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  // --- Task 관련 핸들러 ---

  const handleAddTask = (columnId: number | string, status: string) => {
    const title = prompt("할 일을 입력하세요:");
    if (!title) return;
    // 🔥 String ID 사용
    const newTasks = TaskService.createTask(
      tasks,
      String(columnId),
      status,
      title
    );
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleUpdateTaskStatus = (
    taskId: number | string,
    newStatus: string
  ) => {
    const newTasks = TaskService.updateStatus(tasks, String(taskId), newStatus);
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleDeleteTask = (taskId: number | string) => {
    if (window.confirm("삭제하시겠습니까?")) {
      const newTasks = TaskService.deleteTask(tasks, String(taskId));
      setTasks(newTasks);
      saveToServer(columns, members, newTasks);

      if (selectedTaskId === String(taskId)) {
        setSelectedTaskId(null);
        setActiveTab("taskBoard");
      }
    }
  };

  const handleAssignMemberToTask = (
    taskId: number | string,
    memberId: number | string
  ) => {
    const member = members.find((m) => String(m.id) === String(memberId));
    if (!member) return;

    const newTasks = TaskService.toggleMemberAssignment(
      tasks,
      String(taskId),
      member
    );

    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleSelectTask = (tid: number | string) => {
    setSelectedTaskId(String(tid));
    setActiveTab("taskDetails");
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = TaskService.updateTaskDetail(tasks, updatedTask);
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleUpdateTaskFromObject = (updatedTask: Task) => {
    handleUpdateTask(updatedTask);
  };

  // --- 🔥 SubTask 핸들러 (ID: String 적용) ---

  const handleAddSubTask = (columnId: number | string, memberId: number | string, content: string) => {
    console.log(`➕ 세부 작업 추가 시도: Column(${columnId}), Member(${memberId}), Content(${content})`);

    // 1. 새 컬럼 상태 만들기
    const newColumns = columns.map((col) => {
      // 컬럼 ID 비교 (문자열로 변환)
      if (String(col.id) !== String(columnId)) return col;

      // 멤버 찾기
      return {
        ...col,
        members: col.members.map((m) => {
          // 멤버 ID 비교 (문자열로 변환)
          if (String(m.id) !== String(memberId)) return m;
          
          console.log("✅ 타겟 멤버 찾음:", m.name); 

          const newSub = { id: Date.now().toString(), content, completed: false };
          // 기존 subTasks가 없으면 빈 배열로 처리
          return { ...m, subTasks: [...(m.subTasks || []), newSub] };
        }),
      } as any; // 타입 호환성을 위해 as any 사용 (RoleColumn 구조 맞춤)
    });

    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleToggleSubTask = (columnId: number | string, memberId: number | string, subTaskId: number | string) => {
    const newColumns = columns.map((col) => {
      if (String(col.id) !== String(columnId)) return col;
      return {
        ...col,
        members: col.members.map((m) => {
          if (String(m.id) !== String(memberId)) return m;
          return {
            ...m,
            subTasks: m.subTasks?.map((sub) =>
              String(sub.id) === String(subTaskId) ? { ...sub, completed: !sub.completed } : sub
            ),
          };
        }),
      } as any;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleDeleteSubTask = (columnId: number | string, memberId: number | string, subTaskId: number | string) => {
    const newColumns = columns.map((col) => {
      if (String(col.id) !== String(columnId)) return col;
      return {
        ...col,
        members: col.members.map((m) => {
          if (String(m.id) !== String(memberId)) return m;
          return {
            ...m,
            subTasks: m.subTasks?.filter((sub) => String(sub.id) !== String(subTaskId)),
          };
        }),
      } as any;
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
        onRefreshFriends={fetchProjectData} // loadData -> fetchProjectData
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
          className={`right-sidebar ${
            isRightSidebarCollapsed ? "collapsed" : ""
          }`}
        >
          <ChatBox projectId={currentProjectId} />
          <button
            className="toggle-btn"
            style={{
              position: "absolute",
              top: "50%",
              left: "-24px",
              zIndex: 100,
              width: "24px",
              height: "40px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRight: "none",
              borderRadius: "4px 0 0 4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
            onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
          >
            {isRightSidebarCollapsed ? "<<" : ">>"}
          </button>
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default Project;
