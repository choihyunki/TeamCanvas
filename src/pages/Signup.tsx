import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link 추가
import UserService from "../services/UserService";
import { useAuth } from "../context/AuthContext";
import "../styles/Signup.css";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
  });

  const [error, setError] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const draggableButtonRef = useRef<HTMLButtonElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const { username, password, name } = form;
    const filled =
      username.trim() !== "" && password.trim() !== "" && name.trim() !== "";
    setIsFormFilled(filled);
    if (error) setError("");
  }, [form, error]);

  // --- 드래그 앤 드롭 핸들러 ---
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!isFormFilled) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", "signup_action");
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
    e.preventDefault();
    if (!isFormFilled) return;

    const { username, password, name } = form;

    try {
      // 🔥 [수정] 여기에 await를 꼭 붙여야 합니다!
      // 서버 요청이 끝날 때까지 기다렸다가 newUser 정보를 받아옵니다.
      const newUser = await UserService.register(username, password, name);

      setIsDropped(true);
      setError("");

      // 이제 newUser는 Promise가 아니라 실제 데이터이므로 .username 접근 가능!
      login(newUser.username);

      setTimeout(() => {
        navigate("/main");
      }, 800);
    } catch (err: any) {
      // 에러 처리도 조금 더 안전하게 수정
      const msg = err.response?.data?.message || err.message || "회원가입 실패";
      setError(msg);

      setIsDragging(false);
      setIsDragOver(false);
    }
  };

  const getButtonClass = () => {
    let classes = "signup-drag-button";
    if (isFormFilled) classes += " active";
    if (isDragging) classes += " dragging";
    if (isDropped) classes += " dropped";
    return classes;
  };

  const getDropzoneClass = () => {
    let classes = "signup-drop-zone";
    if (isDragOver) classes += " drag-over";
    if (isDropped) classes += " success";
    return classes;
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* 로고 */}
        <img
          src={process.env.PUBLIC_URL + "/DropIn Logo.png"}
          alt="Drop In Logo"
          className="signup-logo"
        />

        <h2 className="signup-title">회원가입</h2>

        {error && <p className="signup-error">{error}</p>}

        <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="signup-label">이름</label>
            <input
              className="signup-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="실명을 입력하세요"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="signup-label">아이디</label>
            <input
              className="signup-input"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="사용할 아이디"
              autoComplete="username"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="signup-label">비밀번호</label>
            <input
              type="password"
              className="signup-input"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호"
              autoComplete="new-password"
            />
          </div>

          <button
            ref={draggableButtonRef}
            draggable={isFormFilled && !isDropped}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={getButtonClass()}
            type="button"
          >
            {isDropped
              ? "가입 완료!"
              : isFormFilled
              ? "↓ 아래로 드롭하여 가입하기"
              : "모든 필드를 입력해주세요"}
          </button>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={getDropzoneClass()}
          >
            {isDropped
              ? "환영합니다!"
              : isDragOver
              ? "놓아서 가입 완료!"
              : "이곳에 버튼을 놓으세요"}
          </div>
        </form>

        <div className="signup-footer">
          이미 계정이 있으신가요?
          <Link to="/login" className="login-link">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
