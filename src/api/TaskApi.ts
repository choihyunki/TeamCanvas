import axiosInstance from "./axiosInstance";

// 🔥 [수정] projectId와 taskId를 string으로 변경
export const getTasksByProject = async (projectId: string) => {
  const res = await axiosInstance.get(`/api/tasks/project/${projectId}`);
  return res.data;
};

export const createTask = async (projectId: string, title: string) => {
  const res = await axiosInstance.post(`/api/tasks/${projectId}`, { title });
  return res.data;
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  const res = await axiosInstance.put(`/api/tasks/${taskId}/status`, {
    status,
  });
  return res.data;
};
