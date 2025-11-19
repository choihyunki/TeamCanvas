// src/components/Footer.tsx

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        width: "100%",
        padding: "10px",
        textAlign: "center",
        background: "#f4f4f4",
        borderTop: "1px solid #ddd",
        fontSize: "13px",
        color: "#555",
      }}
    >
      © 2025 TeamCanvas – All rights reserved.
    </footer>
  );
};

export default Footer;
