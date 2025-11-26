import AxiosInstance from "../api/axiosInstance";

const UserService = {
  login: async (username: string, password: string) => {
    const res = await AxiosInstance.post("/api/auth/login", {
      username,
      password,
    });
    return res.data; // 서버에서 받은 유저 정보
  },

  register: async (username: string, password: string, name: string) => {
    const res = await AxiosInstance.post("/api/auth/register", {
      username,
      password,
      name,
    });
    return res.data;
  },

  // 🔥 [추가] 친구 추가
  addFriend: async (myUsername: string, targetUsername: string) => {
    const res = await AxiosInstance.post("/api/friends/add", { myUsername, targetUsername });
    return res.data;
  },

  // 🔥 [추가] 친구 목록 가져오기
  getFriends: async (username: string) => {
    const res = await AxiosInstance.get(`/api/friends/${username}`);
    return res.data;
  }
  
};

export default UserService;
