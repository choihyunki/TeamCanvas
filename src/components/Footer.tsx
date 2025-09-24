import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
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
        <Link to="/help" style={{ textDecoration: "none", color: "#2b6cb0" }}>
          도움말
        </Link>
        <Link to="/contact" style={{ textDecoration: "none", color: "#2b6cb0" }}>
          문의하기
        </Link>
        <Link to="/terms" style={{ textDecoration: "none", color: "#2b6cb0" }}>
          서비스 약관
        </Link>
        <Link to="/privacy" style={{ textDecoration: "none", color: "#2b6cb0" }}>
          개인정보처리방침
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
