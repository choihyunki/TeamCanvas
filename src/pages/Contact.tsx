import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="contact-page" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#2b6cb0', marginBottom: '20px' }}>Drop In에 문의하기</h1>
      
      <p style={{ marginBottom: '30px', lineHeight: '1.6' }}>
        저희 서비스에 대한 질문, 피드백 또는 기술적인 지원이 필요하신 경우 언제든지 아래 정보를 통해 연락해 주십시오. 24시간 이내에 회신 드리겠습니다.
      </p>

      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.4em', marginBottom: '15px', color: '#333' }}>고객 지원팀</h2>
        <p style={{ margin: '5px 0' }}><strong>이메일:</strong> support@dropin.com</p>
        <p style={{ margin: '5px 0' }}><strong>전화:</strong> 070-1234-5678 (평일 9:00 ~ 18:00)</p>
      </div>
      
      <p style={{ marginTop: '30px', fontSize: '0.9em', color: '#666' }}>
        버그 신고 및 기능 제안은 서비스 내 '설정' 메뉴를 통해서도 접수 가능합니다.
      </p>
    </div>
  );
};

export default Contact;
