// src/pages/Signup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../services/UserService";
import { useAuth } from "../context/AuthContext";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 회원가입 후 자동 로그인에 사용

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

      // 2) 회원가입 후 자동 로그인처리
      login(newUser.username);

      // 3) 메인 화면으로 이동
      navigate("/");
    } catch (err: any) {
      setError(err.message || "회원가입 실패");
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "60px auto" }}>
      <h2 style={{ marginBottom: "20px" }}>회원가입</h2>

      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>이름</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          style={{ width: "100%", padding: 10, marginBottom: 15 }}
        />

        <label>아이디</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          style={{ width: "100%", padding: 10, marginBottom: 15 }}
        />

        <label>비밀번호</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          style={{ width: "100%", padding: 10, marginBottom: 25 }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Signup;
