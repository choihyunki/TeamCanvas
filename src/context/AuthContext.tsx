import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// ✅ Context 타입 정의
export interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userName: string | null;
  login: (token: string, userName?: string) => void;
  logout: () => void;
}

// ✅ Context 생성 (초기값은 null)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Provider 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem("userName")
  );
  const [expiresAt, setExpiresAt] = useState<number | null>(
    Number(localStorage.getItem("expiresAt")) || null
  );

  // ✅ 유효성 체크
  const isAuthenticated =
    !!token && !!expiresAt && new Date().getTime() < expiresAt;

  const login = (newToken: string, newUserName?: string) => {
    const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24시간

    setToken(newToken);
    if (newUserName) {
      setUserName(newUserName);
      localStorage.setItem("userName", newUserName);
    }

    localStorage.setItem("token", newToken);
    localStorage.setItem("expiresAt", expirationTime.toString());
  };

  const logout = () => {
    setToken(null);
    setUserName(null);
    setExpiresAt(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("expiresAt");
  };

  // ✅ 만료 시간 감시 (자동 로그아웃)
  useEffect(() => {
    if (expiresAt && new Date().getTime() >= expiresAt) {
      console.warn("JWT 만료됨. 자동 로그아웃 처리");
      logout();
    }
  }, [expiresAt]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, userName, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ 커스텀 훅 (안전한 Context 접근)
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
