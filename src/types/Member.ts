// src/types/Member.ts

export interface Member {
  id: string;
  name: string;
  username?: string; // 🔥 [추가] 실제 로그인 아이디 (검색/DB매칭용)
  avatarInitial?: string; // 🔥 [추가] 프로필 아이콘 글자 (예: "홍")
  isOnline: boolean;
  role?: string;
  memo?: string;
  // subTasks 등 다른 속성이 있다면 그대로 두세요
  subTasks?: any[];
}
