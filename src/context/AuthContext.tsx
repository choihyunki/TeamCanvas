// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

// --- 컨텍스트에서 제공할 값 타입 ---
interface AuthContextType {
  isAuthenticated: boolean; // 로그인 여부
  token: string | null; // 인증 토큰(지금은 단순 문자열)
  login: (token: string) => void; // 로그인 처리
  logout: () => void; // 로그아웃 처리
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider 컴포넌트 ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // 새로고침해도 로그인 유지되도록 localStorage에서 초기값 로드
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem("authToken");
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token;

  const login = (newToken: string) => {
    setToken(newToken);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("authToken", newToken);
      }
    } catch {
      // localStorage 접근 실패해도 앱은 계속 동작하도록 조용히 무시
    }
  };

  const logout = () => {
    setToken(null);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("authToken");
      }
    } catch {
      // 마찬가지로 에러는 무시
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- 커스텀 훅 ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
