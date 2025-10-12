import axiosInstance from "../api/AxiosInstance";

export const chatService = {
  getMessages: (roomId: number) =>
    axiosInstance.get(`/api/chat/${roomId}/messages`),
  sendMessage: (roomId: number, message: string) =>
    axiosInstance.post(`/api/chat/${roomId}/send`, { message }),
};
