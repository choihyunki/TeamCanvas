import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: "http://localhost:8080", // ⚠️ 백엔드 포트 확인 (8080일 가능성 높음)
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청 시 자동 JWT 포함
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답에서 JWT 만료(401) 자동 처리
AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("JWT 만료됨. 자동 로그아웃 처리");
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("expiresAt");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
