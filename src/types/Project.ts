// src/types/Project.ts (수정 제안)

export interface SubTask {
  id: string;
  content: string;
  completed: boolean;
}

export interface ProjectMember {
  id: string;
  name: string;
  role?: string;
  status: string;
  memo?: string;
  subTasks?: SubTask[];
}

export interface RoleColumn {
  id: string;
  name: string;
  members: ProjectMember[];
}
