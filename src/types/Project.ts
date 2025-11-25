<<<<<<< HEAD
export interface SubTask {
  id: number;
  content: string; // 할 일 내용
  completed: boolean; // 완료 여부
=======
// src/types/Project.ts

// 🔥 [수정] export 키워드 확인
export interface SubTask {
  id: number;
  content: string;
  completed: boolean;
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
}

export interface ProjectMember {
  id: number;
  status: string;
  memo?: string;
<<<<<<< HEAD
  subTasks: SubTask[];
=======
  // 🔥 [필수 추가] 멤버별 세부 작업 리스트 (선택적 속성 ?)
  subTasks?: SubTask[];
>>>>>>> 908e4f68a413d81914a4a8cae795dca062e91544
}

export interface RoleColumn {
  id: number;
  name: string;
  members: ProjectMember[];
}
