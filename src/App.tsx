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

import { AuthProvider, useAuth } from "./context/AuthContext";

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

// --- 메인 앱 컴포넌트 ---
function App() {
  return (

    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/main"
            element={<ProtectedRoute element={<MainPage />} />}
          />
   
          <Route
            path="/project/:projectId"
            element={<ProtectedRoute element={<ProjectPage />} />}
          />

          {/* === 푸터 관련 정적 페이지 === */}
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* === 예외 처리 === */}
          {/* 위에 정의되지 않은 모든 다른 경로(*)는 로그인 페이지('/')로 리다이렉트합니다. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
