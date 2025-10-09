import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainPage from "./pages/Main";
import ProjectPage from "./pages/Project";
import LoginPage from "./pages/Login";

import HelpPage from "./pages/Help";
import ContactPage from "./pages/Contact";
import TermsPage from "./pages/Terms";
import PrivacyPage from "./pages/Privacy";

import { AuthProvider, useAuth } from "./context/AuthContext"; // 로그인 상태관리 추가

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 로그인 페이지 (기본 진입점) */}
          <Route path="/" element={<LoginPage />} />

          {/* 보호된 메인/프로젝트 경로 */}
          <Route
            path="/main"
            element={<ProtectedRoute element={<MainPage />} />}
          />
          <Route
            path="/project"
            element={<ProtectedRoute element={<ProjectPage />} />}
          />

          {/* 푸터 관련 페이지 */}
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* 잘못된 경로 처리 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
