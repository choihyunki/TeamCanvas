import React, { useState, useRef,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ✅ 드래그 앤 드롭 관련 상태 추가
  const [isDragging, setIsDragging] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);

  const draggableButtonRef = useRef<HTMLButtonElement>(null);

  // ✅ 아이디/비밀번호 입력 시 폼 채움 상태 업데이트
  const handleInputChange = () => {
    if (username.trim() !== '' && password.trim() !== '') {
      setIsFormFilled(true);
    } else {
      setIsFormFilled(false);
    }
  };

  useEffect(handleInputChange, [username, password]);

  // ✅ 드래그 이벤트 핸들러
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    // 드래그 데이터 설정 (필요 시)
    e.dataTransfer.setData('text/plain', 'login');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // ✅ 드롭 존 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // 드롭을 허용하기 위해 필수
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isFormFilled) return; // 폼이 채워지지 않으면 드롭 무시

    setIsDropped(true);
    console.log("로그인 시도...");

    // ✅ 드롭 성공 애니메이션 후 페이지 이동
    setTimeout(() => {
      navigate('/main');
    }, 800); // 0.8초 후 이동
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

        {/* 아이디 입력 */}
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '16px', marginBottom: '20px' }}
        />
        {/* 비밀번호 입력 */}
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '16px', marginBottom: '10px' }}
        />

        {/* ✅ 드래그 가능한 버튼 */}
        <button
          ref={draggableButtonRef}
          draggable={isFormFilled}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={buttonStyle}
        >
          {isDropped ? '환영합니다!' : (isFormFilled ? '↓ 아래로 드롭하여 로그인' : '정보를 입력하세요')}
        </button>

        {/* ✅ 드롭 존 */}
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