import React from "react";

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        height: "50px",
        borderTop: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        backgroundColor: "#f1f1f1",
        fontSize: "14px",
        color: "#666",
      }}
    >
      <div>© 2025 Drop In. All rights reserved.</div>

      {/* 우측 링크 */}
      <nav style={{ display: "flex", gap: "15px" }}>
        <a href="/help" style={{ textDecoration: "none", color: "#2b6cb0" }}>
          도움말
        </a>
        <a href="/contact" style={{ textDecoration: "none", color: "#2b6cb0" }}>
          문의하기
        </a>
        <a href="/terms" style={{ textDecoration: "none", color: "#2b6cb0" }}>
          서비스 약관
        </a>
        <a href="/privacy" style={{ textDecoration: "none", color: "#2b6cb0" }}>
          개인정보처리방침
        </a>
      </nav>
    </footer>
  );
};

export default Footer;
