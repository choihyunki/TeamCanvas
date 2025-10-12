import axiosInstance from "../api/AxiosInstance";

export const userService = {
  signup: (email: string, password: string, name: string) =>
    axiosInstance.post("/api/users/signup", { email, password, name }),

  login: (email: string, password: string) =>
    axiosInstance.post("/api/users/login", { email, password }),
};
