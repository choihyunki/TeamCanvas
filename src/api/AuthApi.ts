import axiosInstance from "./axiosInstance";

export const login = async (email: string, password: string) => {
  const res = await axiosInstance.post("/api/auth/login", { email, password });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("userId", res.data.userId);
  localStorage.setItem("userName", res.data.name);
  return res.data;
};

export const signup = async (email: string, password: string, name: string) => {
  return axiosInstance.post("/api/auth/signup", { email, password, name });
};
