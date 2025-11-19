// src/pages/Login.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/index.css";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../data/mockDb";

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
    <div className="login-container">
      <h1 className="login-title">TeamCanvas 로그인</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="아이디 입력"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        {errorMsg && <p className="login-error">{errorMsg}</p>}

        <button type="submit" className="login-button">
          로그인
        </button>
      </form>
    </div>
  );
};

export default Login;
