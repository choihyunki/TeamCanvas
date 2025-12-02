import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import { ToolType } from "../types/InApp";

interface HeaderProps {
  onMenuClick: () => void;
  // ?를 붙여서 선택적 Props로 변경 (Main 페이지 오류 방지)
  onOpenWindow?: (type: ToolType, title: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenWindow }) => {
  const navigate = useNavigate();

  const getPublicPath = (filename: string, extension: string = "png") =>
    process.env.PUBLIC_URL + `/${filename}.${extension}`;

  const handleLogoClick = () => {
    navigate("/main");
  };

  // 🔥 아이콘 버튼 공통 스타일 (크기 확대)
  const toolBtnStyle = {
    fontSize: "20px", // 아이콘 크기 키움
    padding: "6px 10px", // 터치 영역 확보
    cursor: "pointer",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    transition: "background 0.2s",
  };

  return (
    <header className="header-container">
      {/* 왼쪽 영역: 메뉴 & 로고 */}
      <div className="header-left">
        <button
          onClick={onMenuClick}
          className="hamburger-btn"
          aria-label="메뉴 열기"
        >
          ☰
        </button>

        <img
          src={getPublicPath("DropIn Logo", "png")}
          alt="Drop In Logo"
          className="logo"
          onClick={handleLogoClick}
          style={{ cursor: "pointer", objectFit: "contain" }}
        />
      </div>

      {/* 🔥 [수정] onOpenWindow가 있을 때만(Project 페이지) 버튼 표시 */}
      {onOpenWindow && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="icon-btn"
            onClick={() => onOpenWindow("calculator", "계산기")}  
            title="계산기"
            style={toolBtnStyle} // 스타일 적용
          >
            🧮
          </button>
          <button
            className="icon-btn"
            onClick={() => onOpenWindow("memo", "메모장")}
            title="메모장"
            style={toolBtnStyle}
          >
            📝
          </button>
          <button
            className="icon-btn"
            onClick={() => onOpenWindow("timer", "타이머")}
            title="타이머"
            style={toolBtnStyle}
          >
            ⏱️
          </button>
          <button
            className="icon-btn"
            onClick={() => onOpenWindow("youtube", "유튜브")}
            title="유튜브"
            style={toolBtnStyle}
          >
            ▶️
          </button>
          <button
            className="icon-btn"
            onClick={() => onOpenWindow("code-review", "코드리뷰")}
            title="코드리뷰"
            style={toolBtnStyle}
          >
            💻
          </button>
        </div>
      )}

      {/* 오른쪽 영역: 기존 아이콘 */}
      <nav className="nav-container" style={{ marginLeft: "20px" }}>
        <button className="icon-btn">
          <img
            src={getPublicPath("Bell", "jpg")}
            alt="알림"
            className="icon-img"
          />
        </button>

        <button className="icon-btn">
          <img
            src={getPublicPath("Setting", "jpg")}
            alt="설정"
            className="icon-img"
          />
        </button>

        <button className="icon-btn">
          <img
            src={getPublicPath("Profile", "jpg")}
            alt="프로필"
            className="icon-img"
          />
        </button>
      </nav>
    </header>
  );
};

export default Header;
