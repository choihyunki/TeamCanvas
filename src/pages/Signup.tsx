import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../services/UserService";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css"; // CSS import

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { username, password, name } = form;

    if (!username || !password || !name) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    try {
      // 1) mockDb에 사용자 생성
      const newUser = UserService.register(username, password, name);
      // 2) 자동 로그인
      login(newUser.username);
      // 3) 메인 이동
      navigate("/main");
    } catch (err: any) {
      setError(err.message || "회원가입 실패");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">회원가입</h2>

      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label className="auth-label">이름</label>
          <input
            className="auth-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="실명을 입력하세요"
          />
        </div>

        <div>
          <label className="auth-label">아이디</label>
          <input
            className="auth-input"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="사용할 아이디"
          />
        </div>

        <div>
          <label className="auth-label">비밀번호</label>
          <input
            type="password"
            className="auth-input"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="비밀번호"
          />
        </div>

        <button type="submit" className="auth-button">
          가입하기
        </button>
      </form>
    </div>
  );
};

export default Signup;
