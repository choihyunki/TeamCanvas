import axiosInstance from "../api/AxiosInstance";

export interface ProjectPayload {
  name: string;
  description?: string;
}

export const projectService = {
  getProjects: () => axiosInstance.get("/api/projects"),
  getProjectById: (id: number) => axiosInstance.get(`/api/projects/${id}`),
  createProject: (payload: ProjectPayload) =>
    axiosInstance.post("/api/projects", payload),
  updateProject: (id: number, payload: ProjectPayload) =>
    axiosInstance.put(`/api/projects/${id}`, payload),
  deleteProject: (id: number) => axiosInstance.delete(`/api/projects/${id}`),
};
