import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="terms-page" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ color: '#2b6cb0', marginBottom: '20px' }}>Drop In 서비스 이용 약관</h1>
      
      <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '30px' }}>
        최종 업데이트: 2025년 9월 30일
      </p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>제1조 (목적)</h2>
        <p>
          본 약관은 Drop In(이하 '회사')이 제공하는 협업 서비스(이하 '서비스')의 이용 조건 및 절차, 회사와 회원의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>제2조 (용어의 정의)</h2>
        <p>
          "회원"이라 함은 본 약관에 동의하고 서비스 이용 자격을 부여받은 자를 의미합니다. "프로젝트"란 회원이 팀원과 협업을 목적으로 생성한 작업 공간을 의미하며, 모든 콘텐츠에 대한 권리는 회원이 보유합니다.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>제3조 (서비스의 제공)</h2>
        <p>
          회사는 프로젝트 관리, 드래그앤드롭 역할 분배, 실시간 협업 채팅 등 팀의 효율적인 작업을 위한 기능을 제공합니다. 회사는 서비스의 원활한 제공을 위해 기술적 변경 사항을 수시로 업데이트할 수 있습니다.
        </p>
      </section>
    </div>
  );
};

export default Terms;
