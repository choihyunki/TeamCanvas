import React from "react";

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const getPublicPath = (filename: string, extension: string = "png") => 
        process.env.PUBLIC_URL + `/${filename}.${extension}`;

    const iconSize = "32px"; 
    const iconGap = "25px"; 

    const iconStyle: React.CSSProperties = {
        width: iconSize,
        height: iconSize,
        cursor: "pointer",
        padding: "0",
        border: "none",
        backgroundColor: "transparent",
    };

    return (
        <header
            style={{
                height: "50px",
                borderBottom: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                backgroundColor: "#ffffff",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                {/* 햄버거 버튼 */}
                <button 
                    onClick={onMenuClick} 
                    style={{ fontSize: "20px", background: 'none', border: 'none', cursor: 'pointer', lineHeight: '1' }}
                >
                    ☰
                </button>
            
                <img
                    src={getPublicPath("DropInLogo", "png")} 
                    alt="Drop In Logo"
                    style={{ height: "40px" }}
                />
            </div>

            <nav style={{ display: "flex", gap: iconGap }}>
                
                <button style={iconStyle}>
                    <img 
                        src={getPublicPath("Bell", "jpg")} 
                        alt="알림" 
                        style={{ width: "100%", height: "100%", verticalAlign: 'middle' }}
                    />
                </button>
            
                <button style={iconStyle}>
                    <img 
                        src={getPublicPath("Setting", "jpg")} 
                        alt="설정" 
                        style={{ width: "100%", height: "100%", verticalAlign: 'middle' }}
                    />
                </button>

                <button style={iconStyle}>
                    <img 
                        src={getPublicPath("Profile", "jpg")} 
                        alt="프로필" 
                        style={{ width: "100%", height: "100%", verticalAlign: 'middle' }}
                    />
                </button>
            </nav>
        </header>
    );
};

export default Header;