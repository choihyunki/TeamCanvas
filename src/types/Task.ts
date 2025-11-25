// src/types/Task.ts

// 🔥 [수정] export 키워드 확인
export interface Task {
  id: number;
  title: string;
  description?: string;
  columnId: number;
  members: string[];
  status?: string;
  memo?: string;
  dueDate?: string;
}
