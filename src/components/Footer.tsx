import React from "react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <footer
      style={{
        borderTop: "1px solid #ddd",
        backgroundColor: "#f1f1f1",
        fontSize: "14px",
        color: "#666",
        padding: "20px 10px",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        © 2025 Drop In. All rights reserved.
      </div>

      <nav
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <a
          href="/help"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/help");
          }}
          style={{ textDecoration: "none", color: "#2b6cb0", cursor: "pointer" }}
        >
          도움말
        </a>
        <a
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/contact");
          }}
          style={{ textDecoration: "none", color: "#2b6cb0", cursor: "pointer" }}
        >
          문의하기
        </a>
        <a
          href="/terms"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/terms");
          }}
          style={{ textDecoration: "none", color: "#2b6cb0", cursor: "pointer" }}
        >
          서비스 약관
        </a>
        <a
          href="/privacy"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/privacy");
          }}
          style={{ textDecoration: "none", color: "#2b6cb0", cursor: "pointer" }}
        >
          개인정보처리방침
        </a>
      </nav>
    </footer>
  );
};

export default Footer;
