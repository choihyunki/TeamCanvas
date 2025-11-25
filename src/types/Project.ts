// src/types/Project.ts

// 🔥 [수정] export 키워드 확인
export interface SubTask {
  id: number;
  content: string;
  completed: boolean;
}

export interface ProjectMember {
  id: number;
  status: string;
  memo?: string;
  // 🔥 [필수 추가] 멤버별 세부 작업 리스트 (선택적 속성 ?)
  subTasks?: SubTask[];
}

export interface RoleColumn {
  id: number;
  name: string;
  members: ProjectMember[];
}
