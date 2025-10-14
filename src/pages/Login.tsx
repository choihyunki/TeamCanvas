import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ 1. AuthContext에서 useAuth를 가져옵니다.

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ 2. login 함수를 가져옵니다.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);

  const draggableButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (username.trim() !== '' && password.trim() !== '') {
      setIsFormFilled(true);
    } else {
      setIsFormFilled(false);
    }
  }, [username, password]);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!isFormFilled) return;
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', 'login');
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

    setIsDropped(true);
    console.log("로그인 시도...");

    // ✅ 3. 로그인 상태를 true로 변경하고 페이지를 이동합니다.
    // 실제로는 여기서 서버 API와 통신하여 성공 시 토큰을 받아와야 합니다.
    login("dummy-auth-token"); // 임시 토큰으로 로그인 상태 변경

    setTimeout(() => {
      navigate('/main');
    }, 800);
  };

  // 동적 스타일
  const dropzoneStyle: React.CSSProperties = {
    width: '100%',
    padding: '20px',
    marginTop: '20px',
    border: `2px dashed ${isDragging ? '#4f46e5' : '#ccc'}`,
    borderRadius: '8px',
    textAlign: 'center',
    color: '#aaa',
    transition: 'border-color 0.3s, background-color 0.3s',
    backgroundColor: isDropped ? '#eef2ff' : 'transparent',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: isFormFilled ? '#2b6cb0' : '#a0aec0',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: isFormFilled ? 'grab' : 'not-allowed',
    transition: 'all 0.3s ease',
    opacity: isDragging ? 0.5 : 1,
    transform: isDropped ? 'scale(0.9)' : 'scale(1)',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', textAlign: 'center', width: '420px' }}>
        <img src="/DropInLogo.png" alt="Drop In Logo" style={{ width: '120px', marginBottom: '20px' }} />
        <h2 style={{ marginBottom: '25px', color: '#333' }}>로그인</h2>

        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '16px', marginBottom: '20px' }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '16px', marginBottom: '10px' }}
        />

        <button
          ref={draggableButtonRef}
          draggable={isFormFilled}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={buttonStyle}
        >
          {isDropped ? '환영합니다!' : (isFormFilled ? '↓ 아래로 드롭하여 로그인' : '정보를 입력하세요')}
        </button>

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={dropzoneStyle}
        >
          {isDropped ? '로그인 성공!' : '이곳에 버튼을 놓으세요'}
        </div>

        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          <a href="/register" style={{ color: '#2b6cb0', textDecoration: 'none' }}>
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;