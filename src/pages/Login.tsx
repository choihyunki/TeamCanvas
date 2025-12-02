import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserService from "../services/UserService";
import "../styles/Auth.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const draggableButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const filled = username.trim() !== "" && password.trim() !== "";
    setIsFormFilled(filled);
    if (errorMsg) setErrorMsg("");
  }, [username, password]);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!isFormFilled) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", "login_action");
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isFormFilled || isDropped) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    // async 추가
    e.preventDefault();
    if (!isFormFilled) return;

    try {
      // 🔥 여기도 await 필수!
      const user = await UserService.login(username, password);

      setIsDropped(true);
      setErrorMsg("");
      localStorage.setItem("userName", user.name);

      login(user.username);

      setTimeout(() => {
        navigate("/main");
      }, 800);
    } catch (err: any) {
      // 에러 처리
      setErrorMsg("아이디 또는 비밀번호가 올바르지 않습니다.");
      setIsDragging(false);
      setIsDragOver(false);
    }
  };

  const getButtonClass = () => {
    let classes = "drag-button";
    if (isFormFilled) classes += " active";
    if (isDragging) classes += " dragging";
    if (isDropped) classes += " dropped";
    return classes;
  };

  const getDropzoneClass = () => {
    let classes = "drop-zone";
    if (isDragOver) classes += " drag-over";
    if (isDropped) classes += " success";
    return classes;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img
          src={process.env.PUBLIC_URL + "/DropInLogo.png"}
          alt="Drop In Logo"
          className="login-logo"
        />

        <h2 className="login-title">로그인</h2>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="login-input"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="login-input"
        />

        <button
          ref={draggableButtonRef}
          draggable={isFormFilled && !isDropped}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={getButtonClass()}
        >
          {isDropped
            ? "환영합니다!"
            : isFormFilled
            ? "↓ 아래로 드롭하여 로그인"
            : "아이디와 비밀번호를 입력하세요"}
        </button>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={getDropzoneClass()}
        >
          {isDropped
            ? "로그인 성공!"
            : isDragOver
            ? "놓아서 로그인!"
            : "이곳에 버튼을 놓으세요"}
        </div>

        <div className="login-footer">
          계정이 없으신가요?
          <Link to="/signup" className="signup-link">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
