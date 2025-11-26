// src/types/Project.ts (수정 제안)

export interface SubTask {
  id: number;
  content: string;
  completed: boolean;
}

export interface ProjectMember {
  id: number;
  name: string;      
  role?: string;   
  status: string;
  memo?: string;
  subTasks?: SubTask[];
}

export interface RoleColumn {
  id: number;
  name: string;
  members: ProjectMember[];
}