import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <Link to="/dashboard" style={{ marginRight: "10px" }}>
        Dashboard
      </Link>
      <Link to="/project/1" style={{ marginRight: "10px" }}>
        Project #1
      </Link>
      <Link to="/chat/1">Chat</Link>
    </nav>
  );
};  

export default Navbar;
