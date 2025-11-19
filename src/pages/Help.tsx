import React from "react";
import "../styles/StaticPage.css";

const Help: React.FC = () => {
  return (
    <div className="static-container">
      <h1 className="static-title">도움말 센터</h1>

      <section className="static-section">
        <h2 className="static-subtitle">프로젝트 시작하기</h2>
        <p className="static-text">
          Drop In을 처음 사용하시나요? 새로운 팀 프로젝트를 생성하고, 팀원을
          초대하며, 드래그앤드롭 기능을 활용해 역할을 분배하는 방법에 대한
          자세한 가이드를 제공합니다. 시작하기 튜토리얼을 통해 기본적인 사용법을
          익힐 수 있습니다.
        </p>
      </section>

      <section className="static-section">
        <h2 className="static-subtitle">자주 묻는 질문 (FAQ)</h2>
        <p className="static-text">
          로그인 오류, 작업 보드 사용법, 채팅 기능 문제 등 사용자들이 자주 겪는
          문제에 대한 해결책을 찾아보세요. 원하는 답변을 찾지 못하셨다면,
          언제든지 문의하기 페이지를 통해 저희에게 직접 연락주세요.
        </p>
      </section>
    </div>
  );
};

export default Help;
