import { Task } from "../types/Task";
import { Member } from "../types/Member";

// 🔥 Task와 관련된 복잡한 계산/로직을 전담하는 서비스
const TaskService = {
  // 1. 새 태스크 생성
  createTask: (
    currentTasks: Task[],
    columnId: string,
    status: string,
    title: string
  ): Task[] => {
    const newTask: Task = {
      id: Date.now().toString(),
      columnId,
      status,
      title,
      members: [],
    };
    return [...currentTasks, newTask];
  },

  // 2. 상태 변경 (Drag & Drop 등)
  updateStatus: (
    currentTasks: Task[],
    taskId: string,
    newStatus: string
  ): Task[] => {
    return currentTasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
  },

  // 3. 삭제
  deleteTask: (currentTasks: Task[], taskId: string): Task[] => {
    return currentTasks.filter((t) => t.id !== taskId);
  },

  // 4. 담당자 배정/해제 토글
  toggleMemberAssignment: (
    currentTasks: Task[],
    taskId: string,
    member: Member
  ): Task[] => {
    return currentTasks.map((t) => {
      if (t.id !== taskId) return t;

      const hasMember = t.members.includes(member.name);
      return {
        ...t,
        members: hasMember
          ? t.members.filter((n) => n !== member.name) // 이미 있으면 제거
          : [...t.members, member.name], // 없으면 추가
      };
    });
  },

  // 5. 내용 수정 (TaskDetails용)
  updateTaskDetail: (currentTasks: Task[], updatedTask: Task): Task[] => {
    return currentTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
  },

  // 6. 멤버가 삭제되었을 때 태스크에서도 담당자 제거
  removeMemberFromTasks: (currentTasks: Task[], memberName: string): Task[] => {
    return currentTasks.map((t) => ({
      ...t,
      members: t.members.filter((name) => name !== memberName),
    }));
  },

  // 7. 컬럼이 삭제되었을 때 해당 태스크 제거
  removeTasksByColumn: (currentTasks: Task[], columnId: string): Task[] => {
    return currentTasks.filter((t) => t.columnId !== columnId);
  },
};

export default TaskService;
