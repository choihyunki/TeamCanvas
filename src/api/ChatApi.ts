import axiosInstance from "./axiosInstance";

export const getMessages = async (roomId: number) => {
  const res = await axiosInstance.get(`/api/chat/${roomId}/messages`);
  return res.data;
};
