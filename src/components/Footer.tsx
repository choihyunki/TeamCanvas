import React from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Footer.css";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="footer-container">
      <div className="footer-copyright">
        © 2025 Drop In. All rights reserved.
      </div>

      <nav className="footer-nav">
        <a
          href="/help"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/help");
          }}
          className="footer-link"
        >
          도움말
        </a>
        <a
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/contact");
          }}
          className="footer-link"
        >
          문의하기
        </a>
        <a
          href="/terms"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/terms");
          }}
          className="footer-link"
        >
          서비스 약관
        </a>
        <a
          href="/privacy"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/privacy");
          }}
          className="footer-link"
        >
          개인정보처리방침
        </a>
      </nav>
    </footer>
  );
};

export default Footer;