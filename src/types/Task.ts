// src/types/Task.ts
export interface Task {
  id: number;
  title: string;
  description?: string;
  columnId: number;
  members: string[]; // 참여자 이름

  // 🔹 TaskDetails 기능 확장을 위한 선택 필드
  status?: string; // 작업 상태
  memo?: string; // 작업 메모
  dueDate?: string; // 👈 [수정] 이 줄을 꼭 추가해주세요!
}
