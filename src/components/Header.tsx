// src/components/Header.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        width: "100%",
        padding: "15px 25px",
        background: "#4f46e5",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "22px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        )}

        <h1
          style={{ fontSize: "20px", cursor: "pointer" }}
          onClick={() => navigate("/main")}
        >
          TeamCanvas
        </h1>
      </div>

      {isAuthenticated && (
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1px solid #fff",
            color: "#fff",
            padding: "5px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          로그아웃
        </button>
      )}
    </header>
  );
};

export default Header;
