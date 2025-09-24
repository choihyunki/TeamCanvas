import React from "react";

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header
            style={{
                height: "60px",
                borderBottom: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                backgroundColor: "#ffffff",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
      
                <button onClick={onMenuClick} style={{ fontSize: "20px" }}>
                    ☰
                </button>
            
                <img
                    src={process.env.PUBLIC_URL + "/DropIn Logo.png"}
                    alt="Drop In Logo"
                    style={{ height: "40px" }} // Adjust the size as needed
                />
            </div>

            <nav style={{ display: "flex", gap: "15px" }}>
                <button>알림</button>
                <button>설정</button>
                <button>프로필</button>
            </nav>
        </header>
    );
};

export default Header;