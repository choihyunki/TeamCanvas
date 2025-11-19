// src/services/ChatService.ts
// ⚠️ 현재는 백엔드 미사용. 나중에 WebSocket 연결 시 확장 예정.

export interface ChatMessage {
  id: number;
  projectId: number;
  author: string;
  message: string;
  timestamp: string;
}

// 빈 서비스 (Stub)
const ChatService = {
  sendMessage: async (_projectId: number, _message: string) => {
    console.warn("ChatService.sendMessage(): 현재 mock 모드입니다.");
    return true;
  },

  getMessages: async (_projectId: number): Promise<ChatMessage[]> => {
    console.warn("ChatService.getMessages(): 현재 mock 모드입니다.");
    return [];
  },
};

export default ChatService;
