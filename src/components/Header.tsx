import React from "react";
import { useNavigate } from "react-router-dom"; 
import "../styles/Header.css"; 

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const navigate = useNavigate(); 

    const getPublicPath = (filename: string, extension: string = "png") => 
        process.env.PUBLIC_URL + `/${filename}.${extension}`;

    const handleLogoClick = () => {
        navigate("/main");
    };

    return (
        <header className="header-container">
            {/* 왼쪽 영역 */}
            <div className="header-left">
                <button 
                    onClick={onMenuClick} 
                    className="hamburger-btn"
                    aria-label="메뉴 열기"
                >
                    ☰
                </button>
            
                <img
                    src={getPublicPath("DropInLogo", "png")} 
                    alt="Drop In Logo"
                    className="logo"
                    onClick={handleLogoClick}
                />
            </div>

            {/* 오른쪽 영역 */}
            <nav className="nav-container">
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