import axiosInstance from "../api/AxiosInstance";

export interface TaskPayload {
  title: string;
  description?: string;
  status?: string;
  projectId: number;
}

export const taskService = {
  getTasksByProject: (projectId: number) =>
    axiosInstance.get(`/api/tasks/project/${projectId}`),
  createTask: (payload: TaskPayload) =>
    axiosInstance.post("/api/tasks", payload),
  updateTaskStatus: (taskId: number, status: string) =>
    axiosInstance.put(`/api/tasks/${taskId}/status`, { status }),
  deleteTask: (taskId: number) => axiosInstance.delete(`/api/tasks/${taskId}`),
};
