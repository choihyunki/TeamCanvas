// src/services/ProjectService.ts
import {
  getProjectsForUser,
  getProjectById,
  createProjectForUser,
  addMemberToProject,
  removeMemberFromProject,
} from "../data/mockDb";

const ProjectService = {
  getMyProjects: (username: string) => {
    return getProjectsForUser(username);
  },

  getProject: (projectId: number) => {
    return getProjectById(projectId);
  },

  createProject: (username: string, name: string, description?: string) => {
    return createProjectForUser(username, name, description);
  },

  addMember: (projectId: number, memberName: string) => {
    return addMemberToProject(projectId, memberName);
  },

  removeMember: (projectId: number, memberName: string) => {
    return removeMemberFromProject(projectId, memberName);
  },
};

export default ProjectService;
