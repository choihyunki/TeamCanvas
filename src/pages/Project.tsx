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
  GitHubExplorer,
} from "../components/InAppTools";
import { AppWindow, ToolType } from "../types/InApp";
import "../styles/InApp.css";

import { Member } from "../types/Member";
import { RoleColumn, ProjectMember } from "../types/Project";
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

type ExtendedProjectMember = ProjectMember & {
  name?: string;
  role?: string;
};

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const currentProjectId = projectId || "";

  const { token } = useAuth();
  const storedName = localStorage.getItem("userName"); // 로그인 때 저장한 실명
  const myName =
    storedName || (token ? `User_${token.substring(0, 4)}` : "Guest");

  const socketRef = useRef<any>(null);
  const onlineUsersRef = useRef<Set<string>>(new Set());
  // Live Cursors
  const { cursors, handleMouseMove: handleLiveMouseMove } = useLiveCursors(
    myName,
    currentProjectId
  );

  const [columns, setColumns] = useState<RoleColumn[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState("taskBoard");

  // 🔥 [핵심] ID 타입 string으로 통일
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [myProjects, setMyProjects] = useState<{ id: string; name: string }[]>(
    []
  );

  // 윈도우 시스템 (윈도우 ID는 내부적으로 number 사용 유지 - useWindowSystem 등과 호환)
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

  const toggleRightSidebar = useCallback(() => {
    setIsRightSidebarCollapsed((prev) => !prev);
  }, []);

  const saveToServer = useCallback(
    async (
      newColumns: RoleColumn[],
      newMembers: Member[],
      newTasks?: Task[]
    ) => {
      if (!currentProjectId) return;
      // 🔥 [수정] newTasks가 없으면 현재 state(tasks)를 쓰는데, 이 시점이 엇갈리지 않도록 주의해야 함
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

  const fetchProjectData = useCallback(async () => {
    if (!currentProjectId) return;
    try {
      const data = await ProjectService.getProject(currentProjectId);
      setColumns(data.columns || []);

      const myName = localStorage.getItem("userName") || "";

      if (data.members && Array.isArray(data.members)) {
        const memberObjs = data.members.map((m: any, idx: number) => {
          const safeId = m.id ? String(m.id) : String(Date.now() + idx);

          // 이름 가져오기 (문자열인 경우 호환)
          const mName = typeof m === "string" ? m : m.name;
          const mUsername = typeof m === "string" ? m : m.username;

          // 🔥 [수정] Ref에 이 사람이 있는지 확인! (없으면 false)
          const isReallyOnline =
            onlineUsersRef.current.has(mName) ||
            onlineUsersRef.current.has(mUsername);

          // 나 자신은 무조건 온라인
          const finalOnline = mName === myName || isReallyOnline;

          if (typeof m === "string") {
            return { id: safeId, name: m, isOnline: finalOnline };
          }
          return { ...m, id: safeId, isOnline: finalOnline };
        });
        setMembers(memberObjs);
      }

      // 🔥 [핵심] 태스크 ID 및 컬럼 ID를 무조건 String으로 변환
      if (data.tasks && Array.isArray(data.tasks)) {
        const taskObjs = data.tasks.map((t: any) => ({
          ...t,
          id: String(t.id),
          columnId: String(t.columnId),
          // 🔥 subTaskInfos가 없으면 빈 배열로 초기화 (안정성 확보)
          subTaskInfos: t.subTaskInfos || [],
        }));
        setTasks(taskObjs);
      }
    } catch (error) {
      console.error("실패", error);
    }
  }, [currentProjectId]);

  const fetchFriends = useCallback(async () => {
    if (!token) return;
    try {
      const friendData = await UserService.getFriends(token);

      const myName = localStorage.getItem("userName") || "";

      // 🔥 [수정] 친구 목록도 Ref를 보고 온라인 상태 복구
      const mergedFriends = (friendData || []).map((f: any) => ({
        ...f,
        isOnline: onlineUsersRef.current.has(f.username) || f.name === myName,
      }));

      setFriends(mergedFriends);
    } catch (error) {
      console.error("친구 로드 실패", error);
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

  useEffect(() => {
    if (!currentProjectId || !token) return;

    socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

    const myUsername = localStorage.getItem("userName");

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
        // 🔥 Ref 업데이트 (기억하기)
        if (isOnline) {
          onlineUsersRef.current.add(username);
        } else {
          onlineUsersRef.current.delete(username);
        }

        // State 업데이트 (화면 그리기)
        const finalStatus = username === myName ? true : isOnline;

        setMembers((prev) =>
          prev.map((m) =>
            m.name === username ? { ...m, isOnline: finalStatus } : m
          )
        );
        setFriends((prev) =>
          prev.map((f) =>
            f.username === username ? { ...f, isOnline: finalStatus } : f
          )
        );
      }
    );

    // 초기 온라인 목록 로드
    socketRef.current.on(
      "current_online_users",
      (onlineUsernames: string[]) => {
        // 🔥 Ref 업데이트 (통째로 교체)
        onlineUsersRef.current = new Set(onlineUsernames);

        // 내 이름은 무조건 추가
        if (myName) onlineUsersRef.current.add(myName);

        setMembers((prev) =>
          prev.map((m) => ({
            ...m,
            isOnline: onlineUsersRef.current.has(m.name),
          }))
        );
        setFriends((prev) =>
          prev.map((f) => ({
            ...f,
            isOnline: onlineUsersRef.current.has(f.username),
          }))
        );
      }
    );

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentProjectId, token, fetchProjectData]);

  // --- 인앱 툴 관리 핸들러 ---
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
    if (type === "github") {
      defaultW = 500;
      defaultH = 600;
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

  // --- 프로젝트 멤버 관리 핸들러 (ID: String 적용) ---

  const handleAddMemberFromFriend = (
    friendId: number | string,
    friendName: string
  ) => {
    if (members.some((m) => m.name === friendName)) {
      toast.success("이미 존재하는 멤버입니다.");
      return;
    }
    const friendInfo = friends.find((f) => f.name === friendName);
    const fid = typeof friendId === "string" ? friendId : String(friendId);

    const newMember: Member = {
      id: fid,
      name: friendName,
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
      id: Date.now().toString(), // 🔥 String ID 생성
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

  const handleDeleteMember = (memberId: string) => {
    // 🔥 ID String
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    const newMembers = members.filter((m) => m.id !== memberId);

    const newColumns = columns.map((col) => ({
      ...col,
      members: col.members.filter((m) => String(m.id) !== memberId),
    }));

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
    const newColumnId = Date.now().toString(); // 🔥 String ID
    const newColumn: RoleColumn = { id: newColumnId, name: name, members: [] };
    setColumns((prev) => {
      const updatedColumns = [...prev, newColumn];
      saveToServer(updatedColumns, members, tasks);
      return updatedColumns;
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    // 🔥 ID String
    if (!window.confirm("삭제하시겠습니까?")) return;
    const newColumns = columns.filter((col) => String(col.id) !== columnId);
    const newTasks = TaskService.removeTasksByColumn(tasks, columnId);

    setColumns(newColumns);
    setTasks(newTasks);
    saveToServer(newColumns, members, newTasks);
  };

  // --- 멤버 -> 컬럼 배정 핸들러 ---

  const handleAddMemberToColumn = (
    columnId: string, // 🔥 ID String
    memberId: string // 🔥 ID String
  ) => {
    const destCol = columns.find((c) => String(c.id) === columnId);
    if (!destCol) return;
    if (destCol.members.some((m) => String(m.id) === memberId)) {
      toast.success("이미 배정됨");
      return;
    }
    const memberInfo = members.find((m) => String(m.id) === memberId);
    if (!memberInfo) {
      toast.error("멤버 정보를 찾을 수 없습니다.");
      return;
    }

    const newProjectMember: ExtendedProjectMember = {
      id: memberId,
      name: memberInfo.name,
      role: memberInfo.role,
      status: "TODO",
      subTasks: [],
      memo: "",
    } as ExtendedProjectMember;

    const newColumns = columns.map((col) =>
      String(col.id) === columnId
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
    columnId: string, // 🔥 ID String
    memberId: string // 🔥 ID String
  ) => {
    handleAddMemberToColumn(columnId, memberId);
  };

  const handleInviteFriendToColumn = (
    columnId: string, // 🔥 ID String
    friendId: string,
    friendName: string
  ) => {
    const friendInfo = friends.find((f) => f.name === friendName);
    const avatar = friendInfo?.avatarInitial || friendName[0];
    const realUsername = friendInfo?.username || friendName;

    const fid = Date.now().toString(); // 🔥 String ID

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
        String(col.id) === columnId
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
    columnId: string, // 🔥 ID String
    memberId: string, // 🔥 ID String
    status: string
  ) => {
    const newColumns = columns.map((col) => {
      if (String(col.id) !== columnId) return col;
      return {
        ...col,
        members: col.members.map((m) =>
          String(m.id) === memberId ? { ...m, status } : m
        ) as ExtendedProjectMember[],
      } as RoleColumn;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleUpdateMemberMemo = (
    columnId: string, // 🔥 ID String
    memberId: string, // 🔥 ID String
    memo: string
  ) => {
    const newColumns = columns.map((col) => {
      if (String(col.id) !== columnId) return col;
      return {
        ...col,
        members: col.members.map((m) =>
          String(m.id) === memberId ? { ...m, memo } : m
        ) as ExtendedProjectMember[],
      } as RoleColumn;
    });
    setColumns(newColumns);
    saveToServer(newColumns, members, tasks);
  };

  const handleMoveMemberBetweenColumns = (
    memberId: string, // 🔥 ID String
    sourceColId: string, // 🔥 ID String
    destColId: string // 🔥 ID String
  ) => {
    const sourceCol = columns.find((c) => String(c.id) === sourceColId);
    const memberToMove = sourceCol?.members.find(
      (m) => String(m.id) === memberId
    );
    if (!sourceCol || !memberToMove) return;

    const newColumns = columns.map((col) => {
      if (String(col.id) === sourceColId)
        return {
          ...col,
          members: col.members.filter(
            (m) => String(m.id) !== memberId
          ) as ExtendedProjectMember[],
        } as RoleColumn;
      if (String(col.id) === destColId) {
        if (col.members.some((m) => String(m.id) === memberId)) return col;
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

  const handleAddTask = (columnId: string, status: string) => {
    // 🔥 ID String
    const title = prompt("할 일을 입력하세요:");
    if (!title) return;

    const newTasks = TaskService.createTask(tasks, columnId, status, title);
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleUpdateTaskStatus = (
    taskId: string, // 🔥 ID String
    newStatus: string
  ) => {
    const newTasks = TaskService.updateStatus(tasks, taskId, newStatus);
    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    // 🔥 ID String
    if (window.confirm("삭제하시겠습니까?")) {
      const newTasks = TaskService.deleteTask(tasks, taskId);
      setTasks(newTasks);
      saveToServer(columns, members, newTasks);

      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
        setActiveTab("taskBoard");
      }
    }
  };

  const handleAssignMemberToTask = (
    taskId: string, // 🔥 ID String
    memberId: string // 🔥 ID String
  ) => {
    const member = members.find((m) => String(m.id) === memberId);
    if (!member) return;

    const newTasks = TaskService.toggleMemberAssignment(tasks, taskId, member);

    setTasks(newTasks);
    saveToServer(columns, members, newTasks);
  };

  const handleSelectTask = (tid: string) => {
    // 🔥 ID String
    setSelectedTaskId(tid);
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

  // --- 🔥 [수정] SubTask 핸들러: Task 객체 내부 subTaskInfos 수정 ---

  const handleAddSubTask = (
    taskId: string, // 🔥 인자 변경 (columnId -> taskId)
    memberId: string,
    content: string
  ) => {
    // 1. 해당 태스크 찾기
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    // 2. 해당 멤버가 컬럼에 없으면 자동 추가 (기존 로직 유지)
    //    단, subTask 저장 위치는 이제 컬럼이 아니라 태스크 내부임
    const columnId = targetTask.columnId;
    const targetColumn = columns.find((c) => String(c.id) === String(columnId));
    let newColumns = columns;

    if (
      targetColumn &&
      !targetColumn.members.some((m) => String(m.id) === String(memberId))
    ) {
      const globalMember = members.find(
        (m) => String(m.id) === String(memberId)
      );
      if (globalMember) {
        const newMemberInCol = {
          id: memberId,
          name: globalMember.name,
          username: globalMember.username,
          role: "팀원",
          status: "TODO",
          subTasks: [], // 컬럼 쪽 subTasks는 이제 안 씀 (빈 배열)
        };
        newColumns = columns.map((col) =>
          String(col.id) === String(columnId)
            ? {
                ...col,
                members: [...col.members, newMemberInCol] as any,
              }
            : col
        );
        setColumns(newColumns);
      }
    }

    // 3. 🔥 [핵심] Tasks 상태 업데이트 (TaskService 이용 안함, 직접 구현)
    //    TaskService.addSubTask 같은 함수를 만들어서 쓰는 게 더 좋지만,
    //    여기서 바로 로직을 구현해도 됩니다. (일관성 위해 직접 구현)
    const newTasks = tasks.map((t) => {
      if (t.id !== taskId) return t;

      const currentInfos = t.subTaskInfos || [];
      const memberInfoIndex = currentInfos.findIndex(
        (info) => String(info.memberId) === String(memberId)
      );

      const newSubItem = {
        id: Date.now().toString(),
        content,
        completed: false,
      };

      let newInfos = [...currentInfos];

      if (memberInfoIndex > -1) {
        // 이미 이 멤버의 세부작업이 있으면 -> 배열에 추가
        newInfos[memberInfoIndex] = {
          ...newInfos[memberInfoIndex],
          items: [...newInfos[memberInfoIndex].items, newSubItem],
        };
      } else {
        // 없으면 -> 새로 생성
        newInfos.push({ memberId, items: [newSubItem] });
      }

      return { ...t, subTaskInfos: newInfos };
    });

    setTasks(newTasks);
    // 🔥 [중요] 변수에 담긴 최신 값(newTasks)을 넘겨서 저장
    saveToServer(newColumns, members, newTasks);
  };

  const handleToggleSubTask = (
    taskId: string,
    memberId: string,
    subTaskId: string
  ) => {
    const newTasks = tasks.map((t) => {
      if (t.id !== taskId) return t;

      const newInfos = (t.subTaskInfos || []).map((info) => {
        if (String(info.memberId) !== String(memberId)) return info;
        return {
          ...info,
          items: info.items.map((item) =>
            item.id === subTaskId
              ? { ...item, completed: !item.completed }
              : item
          ),
        };
      });

      return { ...t, subTaskInfos: newInfos };
    });

    setTasks(newTasks);
    // 🔥 최신 newTasks 저장
    saveToServer(columns, members, newTasks);
  };

  const handleDeleteSubTask = (
    taskId: string,
    memberId: string,
    subTaskId: string
  ) => {
    const newTasks = tasks.map((t) => {
      if (t.id !== taskId) return t;

      const newInfos = (t.subTaskInfos || []).map((info) => {
        if (String(info.memberId) !== String(memberId)) return info;
        return {
          ...info,
          items: info.items.filter((item) => item.id !== subTaskId),
        };
      });

      return { ...t, subTaskInfos: newInfos };
    });

    setTasks(newTasks);
    // 🔥 최신 newTasks 저장
    saveToServer(columns, members, newTasks);
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
                : "0 5px 15px rgba(0, 0, 0, 0.1)",
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
            {win.type === "github" && <GitHubExplorer />}
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
        onRefreshFriends={fetchProjectData}
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
          {/* 하단 독 (In-App Tools) */}
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
            {/* 🔥 [추가] 깃허브 아이콘 */}
            <div
              className="dock-icon"
              onClick={() => handleOpenApp("github", "GitHub Explorer")}
            >
              <div
                className="icon-box"
                style={{ background: "#24292e", color: "white" }}
              >
                <svg
                  viewBox="0 0 16 16"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
              </div>
              <span>GitHub</span>
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
                onDeleteMember={(colId, memId) =>
                  handleDeleteMember(String(memId))
                }
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

        <button
          className={`toggle-btn right`}
          onClick={toggleRightSidebar}
          title={isRightSidebarCollapsed ? "채팅 열기" : "채팅 닫기"}
        >
          {isRightSidebarCollapsed ? "▶" : "◀"}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Project;
