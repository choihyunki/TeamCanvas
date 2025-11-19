import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// --- 컨텍스트가 제공할 값들의 타입 정의 ---
interface AuthContextType {
  isAuthenticated: boolean; // 로그인 여부 (true/false)
  login: (token: string) => void; // 로그인 처리 함수
  logout: () => void; // 로그아웃 처리 함수
  token: string | null; // 저장된 인증 토큰
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 컨텍스트 제공자(Provider) 컴포넌트 ---
// 앱의 최상단(App.tsx)을 감싸서 로그인 상태를 모든 자식 컴포넌트에 제공합니다.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // ✅ 로컬 스토리지에서 'token'을 가져와 초기 상태를 설정합니다.
  // 새로고침해도 로그인 상태가 유지되는 비결입니다.
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

  // 로그인 함수: 새로운 토큰을 받아 상태를 업데이트하고 로컬 스토리지에 저장합니다.
  const login = (newToken: string) => {
    setToken(newToken);
    if (newUserName) {
      setUserName(newUserName);
      localStorage.setItem("userName", newUserName);
    }

    localStorage.setItem("token", newToken);
    localStorage.setItem("expiresAt", expirationTime.toString());
  };

  // 로그아웃 함수: 토큰 상태를 null로 만들고 로컬 스토리지에서 제거합니다.
  const logout = () => {
    setToken(null);
    setUserName(null);
    setExpiresAt(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("expiresAt");
  };

  // 자식 컴포넌트들에게 전달할 값들
  const value = {
    isAuthenticated: !!token, // 토큰이 있으면 true, 없으면(null) false가 됩니다. (!!는 boolean으로 변환하는 트릭)
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, userName, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --- 커스텀 훅 ---
// 매번 useContext(AuthContext)를 쓰는 대신 useAuth()로 간단하게 컨텍스트 값을 가져올 수 있게 해줍니다.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};