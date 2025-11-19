import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../data/mockDb";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);

  const draggableButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsFormFilled(username.trim() !== "" && password.trim() !== "");
  }, [username, password]);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!isFormFilled) return;
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", "login");
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isFormFilled) return;

    // 👉 1) 아이디/비번 검증
    const user = loginUser(username, password);
    if (!user) {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      setIsDropped(false);
      return;
    }

    setIsDropped(true);
    console.log("로그인 시도...");

    // 👉 2) 여기서 '토큰'에 실제로는 username을 넣어둘 거야.
    //    나중에 진짜 백엔드 붙이면 JWT로 바꾸면 됨.
    login(user.username);

    // 👉 3) 로그인 성공 후 메인 페이지로 이동
    setTimeout(() => {
      navigate("/main");
    }, 800);
  };

  const dropzoneStyle: React.CSSProperties = {
    width: "100%",
    padding: "30px 20px",
    marginTop: "20px",
    border: `2px ${isDragging ? "solid" : "dashed"} ${
      isDragging ? "#4f46e5" : "#d1d5db"
    }`,
    borderRadius: "8px",
    textAlign: "center",
    color: isDragging ? "#4f46e5" : "#9ca3af",
    fontWeight: "500",
    transition: "all 0.3s ease",
    backgroundColor: isDragging
      ? "#eef2ff"
      : isDropped
      ? "#dcfce7"
      : "transparent",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "12px 24px",
    backgroundColor: isFormFilled ? "#4f46e5" : "#9ca3af",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: isFormFilled ? "grab" : "not-allowed",
    transition: "all 0.3s ease",
    opacity: isDragging ? 0.5 : 1,
    transform: isDropped ? "scale(0.9)" : "scale(1)",
    width: "100%",
    marginBottom: "10px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          width: "400px",
        }}
      >
        <img
          src={process.env.PUBLIC_URL + "/DropInLogo.png"}
          alt="Drop In Logo"
          style={{ width: "200px", marginBottom: "20px" }}
        />

        <h2
          style={{ marginBottom: "30px", color: "#111827", fontSize: "24px" }}
        >
          로그인
        </h2>

        <input
          type="text"
          placeholder="아이디 (예: admin / hyeon)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            boxSizing: "border-box",
            fontSize: "16px",
            marginBottom: "16px",
          }}
        />
        <input
          type="password"
          placeholder="비밀번호 (예: 1234)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            boxSizing: "border-box",
            fontSize: "16px",
            marginBottom: "25px",
          }}
        />

        <button
          ref={draggableButtonRef}
          draggable={isFormFilled}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={buttonStyle}
        >
          {isDropped
            ? "환영합니다!"
            : isFormFilled
            ? "↓ 아래로 드롭하여 로그인"
            : "아이디와 비밀번호를 입력하세요"}
        </button>

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={dropzoneStyle}
        >
          {isDropped ? "로그인 성공!" : "이곳에 버튼을 놓으세요"}
        </div>
      </div>
    </div>
  );
};

export default Login;
