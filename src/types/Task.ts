// src/types/Task.ts

export interface SubTaskItem {
  id: string;
  content: string;
  completed: boolean;
}

export interface MemberSubTaskInfo {
  memberId: string;
  items: SubTaskItem[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  members: string[]; // 멤버 ID 혹은 이름 배열
  status?: string;
  memo?: string;
  dueDate?: string;
  startDate?: string;

  // 🔥 [추가] 멤버별 세부 작업 리스트
  subTaskInfos?: MemberSubTaskInfo[];
}
