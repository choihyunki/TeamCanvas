import axiosInstance from "./AxiosInstance";

export const getMyProjects = async () => {
  const res = await axiosInstance.get("/api/projects/my");
  return res.data;
};

export const createProject = async (name: string) => {
  const res = await axiosInstance.post("/api/projects", { name });
  return res.data;
};

export const inviteMember = async (projectId: number, userEmail: string) => {
  const res = await axiosInstance.post(`/api/projects/${projectId}/invite`, {
    email: userEmail,
  });
  return res.data;
};

export const removeMember = async (projectId: number, userId: number) => {
  return axiosInstance.delete(`/api/projects/${projectId}/members/${userId}`);
};
