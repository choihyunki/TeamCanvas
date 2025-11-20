export interface SubTask {
  id: number;
  content: string; // 할 일 내용
  completed: boolean; // 완료 여부
}

export interface ProjectMember {
  id: number;
  status: string;
  memo?: string;
  subTasks: SubTask[];
}

export interface RoleColumn {
  id: number;
  name: string;
  members: ProjectMember[];
}
