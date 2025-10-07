import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ 모든 CSS 코드를 컴포넌트 내부에 문자열로 정의합니다.
const css = `
  /* 전체 페이지 배경 */
  .login-page {
    display: flex;
    min-height: 100vh;
    font-family: 'Arial', sans-serif;
    overflow: hidden; /* 애니메이션이 화면을 벗어나지 않도록 */
  }

  /* 왼쪽 브랜딩 패널 */
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

  /* 그라데이션 애니메이션 */
  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* 오른쪽 폼 패널 */
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

  /* 입력 필드 스타일 */
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

  /* 비밀번호 보이기/숨기기 버튼 */
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

  /* 로그인 버튼 */
  .login-btn {
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

  .login-btn:hover {
    background-color: #4338ca;
  }

  /* 소셜 로그인 버튼 */
  .social-login {
    margin-top: 25px;
    text-align: center;
  }

  .social-login p {
      color: #888;
      margin-bottom: 15px;
  }

  .social-btn {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background-color: #fff;
      cursor: pointer;
      margin-bottom: 10px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: background-color 0.2s;
  }

  .social-btn:hover {
      background-color: #f7f7f7;
  }
  
  /* 하단 링크 */
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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("로그인 시도:", { username, password });
    navigate('/main');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* ✅ 정의한 CSS 문자열을 <style> 태그로 렌더링 */}
      <style>{css}</style>
      <div className="login-page">
        {/* 1. 왼쪽 브랜딩 영역 */}
        <div className="branding-panel">
          <img src="/DropInLogo.png" alt="Drop In Logo" />
          <p>당신의 프로젝트를 한 곳에서, 손쉽게.</p>
        </div>

        {/* 2. 오른쪽 로그인 폼 영역 */}
        <div className="form-panel">
          <div className="form-container">
            <h2>로그인</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="아이디"
                  className="input-field"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={togglePasswordVisibility} className="password-toggle-btn">
                  {showPassword ? '숨기기' : '보이기'}
                </button>
              </div>
              <button type="submit" className="login-btn">
                로그인
              </button>
            </form>

            <div className="social-login">
              <p>또는 소셜 계정으로 로그인</p>
              <button className="social-btn">
                <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google"/>
                Google 계정으로 로그인
              </button>
            </div>

            <div className="links">
              <a href="/forgot-password">비밀번호 찾기</a>
              |
              <a href="/register">회원가입</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;