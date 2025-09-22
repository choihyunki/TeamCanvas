import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 페이지들 import
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import Chat from "./pages/Chat";

// 공용 컴포넌트 import (원하면)
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      {/* 상단 네비게이션 */}
      <Navbar />

      {/* 메인 콘텐츠 영역 */}
      <Routes>
        {/* 기본 진입 시 대시보드로 이동 */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* 각 페이지 라우트 */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:id" element={<Project />} />
        <Route path="/chat/:projectId/:roomId?" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
