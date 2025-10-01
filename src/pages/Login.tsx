import React from 'react';
import { useNavigate } from 'react-router-dom';
const Login: React.FC = () => {
  const navigate = useNavigate(); 
  const handleLogin = () => {
    
    console.log("로그인 시도...");
    navigate('/main'); 
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', 
        backgroundColor: '#f0f2f5', 
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
    }}
      >
         <img
     src="/DropInLogo.png"
    alt="Drop In Logo"
    style={{
    width: '150px',
    marginBottom: '30px',
    }}
/>

        <h2 style={{ marginBottom: '25px', color: '#333' }}>로그인</h2>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="아이디"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontSize: '16px',
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <input
              type="password"
              placeholder="비밀번호"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontSize: '16px',
              }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2b6cb0',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#255e97'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2b6cb0'}
          >
            로그인
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          <a href="/forgot-password" style={{ color: '#2b6cb0', textDecoration: 'none', marginRight: '15px' }}>
            비밀번호 찾기
          </a>
          <a href="/register" style={{ color: '#2b6cb0', textDecoration: 'none' }}>
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;