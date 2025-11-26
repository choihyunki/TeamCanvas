// src/api/axiosInstance.ts
import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: "http://localhost:4000", // 🔥 백엔드 주소로 변경
  headers: {
    "Content-Type": "application/json",
  },
});

export default AxiosInstance;
