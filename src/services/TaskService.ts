// src/services/TaskService.ts
// 현재 Task는 백엔드 미사용, Project.tsx 내부 상태로 처리됨.

const TaskService = {
  createTask: async (..._args: any[]) => {
    console.warn("TaskService.createTask(): 현재 mock 모드입니다.");
  },

  getTasks: async (..._args: any[]) => {
    console.warn("TaskService.getTasks(): 현재 mock 모드입니다.");
    return [];
  },
};

export default TaskService;
