import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();

  // 헤더에서 로그아웃/유저정보를 뺐으므로 useAuth는 여기서 사용하지 않아도 됩니다.

  return (
    <header className="app-header">
      <div className="header-left">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="menu-btn"
            aria-label="메뉴 열기"
          >
            ☰
          </button>
        )}

        <h1 className="app-title" onClick={() => navigate("/main")}>
          TeamCanvas
        </h1>
      </div>

      {/* 오른쪽 영역 비움 (또는 div 자체를 삭제해도 됨) */}
      <div className="header-right">
        {/* 여기에 있던 유저 정보와 로그아웃 버튼 코드를 모두 삭제했습니다. */}
      </div>
    </header>
  );
};

export default Header;
