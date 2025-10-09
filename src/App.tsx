import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainPage from "./pages/Main";
import ProjectPage from "./pages/Project";
import LoginPage from "./pages/Login";

import HelpPage from "./pages/Help";
import ContactPage from "./pages/Contact";
import TermsPage from "./pages/Terms";
import PrivacyPage from "./pages/Privacy";

function App() {
  return (
    <Router>
      <Routes>
        {/* 기본 경로에서 로그인 페이지 */}
        <Route path="/" element={<LoginPage />} />

        {/*메인 페이지 */}
        <Route path="/main" element={<MainPage />} />

        {/* 프로젝트 페이지 */}
        <Route path="/project" element={<ProjectPage />} />

        {/* 푸터 링크 경로들 */}
        <Route path="/help" element={<HelpPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
