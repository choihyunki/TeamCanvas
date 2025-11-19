export interface ProjectMember {
  id: number;
  status: string;
  memo?: string;
}

export interface RoleColumn {
  id: number;
  name: string;
  members: ProjectMember[];
}