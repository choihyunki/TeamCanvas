// src/services/UserService.ts
import { loginUser, users, createUser } from "../data/mockDb";

const UserService = {
  login: (username: string, password: string) => {
    return loginUser(username, password);
  },

  register: (username: string, password: string, name: string) => {
    return createUser(username, password, name);
  },

  getAllUsers: () => {
    return users ?? [];
  },
};

export default UserService;
