import React from 'react';

const Help: React.FC = () => {
  return (
    <div className="help-page" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2b6cb0', marginBottom: '20px' }}>도움말 센터</h1>
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>프로젝트 시작하기</h2>
        <p style={{ lineHeight: '1.6' }}>
          Drop In을 처음 사용하시나요? 새로운 팀 프로젝트를 생성하고, 팀원을 초대하며, 드래그앤드롭 기능을 활용해 역할을 분배하는 방법에 대한 자세한 가이드를 제공합니다. 시작하기 튜토리얼을 통해 기본적인 사용법을 익힐 수 있습니다.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>자주 묻는 질문 (FAQ)</h2>
        <p style={{ lineHeight: '1.6' }}>
          로그인 오류, 작업 보드 사용법, 채팅 기능 문제 등 사용자들이 자주 겪는 문제에 대한 해결책을 찾아보세요. 원하는 답변을 찾지 못하셨다면, 언제든지 문의하기 페이지를 통해 저희에게 직접 연락주세요.
        </p>
      </section>
    </div>
  );
};

export default Help;
