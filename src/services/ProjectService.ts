import AxiosInstance from "../api/axiosInstance";

const ProjectService = {
  // 내 프로젝트 목록 가져오기
  getMyProjects: async (username: string) => {
    const res = await AxiosInstance.get(`/api/projects?username=${username}`);
    return res.data;
  },

  // 특정 프로젝트 상세 정보 (칸반 보드 포함)
  getProject: async (projectId: string) => {
    const res = await AxiosInstance.get(`/api/projects/${projectId}`);
    return res.data;
  },

  // 프로젝트 생성
  createProject: async (
    username: string,
    name: string,
    description?: string
  ) => {
    const res = await AxiosInstance.post("/api/projects", {
      name,
      description,
      ownerUsername: username,
    });
    return res.data;
  },

  // 프로젝트 상태 저장 (칸반 보드 이동 등 저장)
  // 🔥 [수정] tasks 인자 추가
  saveProjectState: async (
    projectId: string,
    columns: any[],
    members: any[],
    tasks: any[] // 🔥 추가됨
  ) => {
    const res = await AxiosInstance.put(`/api/projects/${projectId}`, {
      columns,
      members,
      tasks, // 🔥 서버로 전송
    });
    return res.data;
  },
  deleteProject: async (projectId: string) => {
    // delete 요청 보냄
    const res = await AxiosInstance.delete(`/api/projects/${projectId}`);
    return res.data;
  },
};

export default ProjectService;
