import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/AxiosInstance"; // ✅ axiosInstance 사용

const css = `
  /* --- 기존 CSS 그대로 유지 --- */
  .signup-page {
    display: flex;
    min-height: 100vh;
    font-family: 'Arial', sans-serif;
    overflow: hidden;
  }

  .branding-panel {
    width: 50%;
    background: linear-gradient(-45deg, #4f46e5, #818cf8, #3b82f6, #60a5fa);
    background-size: 400% 400%;
    animation: gradientBG 15s ease infinite;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 40px;
    box-sizing: border-box;
  }

  .branding-panel img {
    width: 180px;
    margin-bottom: 20px;
  }

  .branding-panel h1 {
    font-size: 36px;
    margin-bottom: 10px;
  }

  .branding-panel p {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.9);
  }

  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .form-panel {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;
  }

  .form-container {
    background-color: #fff;
    padding: 50px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 420px;
    box-sizing: border-box;
  }

  .form-container h2 {
    margin-top: 0;
    margin-bottom: 25px;
    color: #333;
    text-align: center;
    font-size: 28px;
  }

  .input-group {
    position: relative;
    margin-bottom: 25px;
  }

  .input-field {
    width: 100%;
    padding: 14px;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
    font-size: 16px;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .input-field:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }

  .password-toggle-btn {
    position: absolute;
    top: 50%;
    right: 15px;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #888;
    font-size: 14px;
  }

  .signup-btn {
    width: 100%;
    padding: 14px;
    background-color: #4f46e5;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .signup-btn:hover {
    background-color: #4338ca;
  }

  .links {
    margin-top: 20px;
    font-size: 14px;
    text-align: center;
  }

  .links a {
    color: #4f46e5;
    text-decoration: none;
    margin: 0 10px;
  }
`;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ AxiosInstance 기반 회원가입 요청
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/users/signup", {
        email,
        password,
        name,
      });

      if (response.status === 200) {
        setSuccess("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err: any) {
      console.error("회원가입 에러:", err);
      if (err.response?.status === 400) {
        setError("이미 존재하는 이메일입니다.");
      } else {
        setError("서버 오류가 발생했습니다.");
      }
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="signup-page">
        {/* 왼쪽 DropIn 브랜딩 */}
        <div className="branding-panel">
          <img src="/DropInLogo.png" alt="Drop In Logo" />
          <h1>Welcome to Drop In</h1>
          <p>팀워크와 효율의 새로운 시작.</p>
        </div>

        {/* 오른쪽 회원가입 폼 */}
        <div className="form-panel">
          <div className="form-container">
            <h2>회원가입</h2>

            <form onSubmit={handleSignup}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="이름"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type="email"
                  placeholder="이메일"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                >
                  {showPassword ? "숨기기" : "보이기"}
                </button>
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p style={{ color: "red", textAlign: "center" }}>{error}</p>
              )}
              {success && (
                <p style={{ color: "green", textAlign: "center" }}>{success}</p>
              )}

              <button type="submit" className="signup-btn">
                회원가입
              </button>
            </form>

            <div className="links">
              <a href="/">이미 계정이 있으신가요? 로그인</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
