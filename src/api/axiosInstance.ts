// src/api/axiosInstance.ts
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const AxiosInstance = axios.create({
  baseURL: SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default AxiosInstance;
