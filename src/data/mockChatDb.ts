// src/data/mockChatDb.ts

export interface ChatMessage {
  id: number;
  author: string;
  text: string;
  time: string;
}

// 🔥 프로젝트별 채팅 저장소
const chatStorage: Record<number, ChatMessage[]> = {
  // 예시
  101: [
    {
      id: 1,
      author: "관리자",
      text: "프로젝트 채팅에 오신 것을 환영합니다!",
      time: "09:12",
    },
  ],
};

function getTime() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// 🔹 해당 프로젝트의 채팅 가져오기
export function getChatMessages(projectId: number): ChatMessage[] {
  if (!chatStorage[projectId]) {
    chatStorage[projectId] = [];
  }
  return [...chatStorage[projectId]];
}

// 🔹 해당 프로젝트에 메시지 추가
export function addChatMessage(
  projectId: number,
  author: string,
  text: string
): ChatMessage {
  const newMessage: ChatMessage = {
    id: Date.now(),
    author,
    text,
    time: getTime(),
  };

  if (!chatStorage[projectId]) {
    chatStorage[projectId] = [];
  }

  chatStorage[projectId].push(newMessage);
  return newMessage;
}
