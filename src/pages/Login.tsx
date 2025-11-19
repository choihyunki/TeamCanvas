import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link 추가
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../data/mockDb";
import "../styles/Auth.css"; // Signup과 같은 스타일 사용

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = loginUser(username, password);

    if (!user) {
      setErrorMsg("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    // 로그인 성공 → 토큰 저장
    login(user.username);
    navigate("/main");
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">TeamCanvas 로그인</h1>

      {errorMsg && <p className="auth-error">{errorMsg}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label className="auth-label">아이디</label>
          <input
            type="text"
            placeholder="아이디 입력"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
          />
        </div>

        <div>
          <label className="auth-label">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
        </div>

        <button type="submit" className="auth-button">
          로그인
        </button>
      </form>

      <div style={{ marginTop: 20, fontSize: 14, color: "#666" }}>
        아직 계정이 없으신가요?{" "}
        <Link
          to="/signup"
          style={{
            color: "#4f46e5",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default Login;
