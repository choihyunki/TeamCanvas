import axiosInstance from "./axiosInstance";

export const getTasksByProject = async (projectId: number) => {
  const res = await axiosInstance.get(`/api/tasks/project/${projectId}`);
  return res.data;
};

export const createTask = async (projectId: number, title: string) => {
  const res = await axiosInstance.post(`/api/tasks/${projectId}`, { title });
  return res.data;
};

export const updateTaskStatus = async (taskId: number, status: string) => {
  const res = await axiosInstance.put(`/api/tasks/${taskId}/status`, {
    status,
  });
  return res.data;
};
