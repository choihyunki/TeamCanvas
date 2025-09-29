import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="privacy-page" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ color: '#2b6cb0', marginBottom: '20px' }}>Drop In 개인정보처리방침</h1>
      
      <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '30px' }}>
        본 방침은 Drop In 서비스 이용자의 개인정보를 보호하고 관련 법규를 준수하기 위해 마련되었습니다.
      </p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>제1조 (수집하는 개인정보 항목)</h2>
        <p>
          회사는 서비스 제공을 위해 최소한의 개인정보만을 수집합니다. 수집 항목은 이름, 이메일 주소, 로그인 아이디, 비밀번호(암호화), 접속 기록(IP 주소) 등입니다.
        </p>
      </section>
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>제2조 (개인정보의 이용 목적)</h2>
        <p>
          수집된 개인정보는 주로 회원 식별, 서비스 개선, 원활한 고객 상담, 법령상 의무 이행에 사용됩니다. 이용자의 명시적인 동의 없이 이외의 목적으로는 사용되지 않습니다.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>제3조 (개인정보의 보유 및 이용 기간)</h2>
        <p>
          이용자의 개인정보는 회원 탈퇴 시까지 보유 및 이용되며, 관계 법령의 규정에 따라 보존할 필요성이 있을 경우 해당 법령이 정한 기간 동안 보존합니다.
        </p>
      </section>
    </div>
  );
};

export default Privacy;
