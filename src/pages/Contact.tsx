import React from "react";
import "../styles/StaticPage.css";

const Contact: React.FC = () => {
  return (
    <div className="static-container" style={{ textAlign: "center" }}>
      <h1 className="static-title">Drop In에 문의하기</h1>

      <p className="static-text" style={{ marginBottom: "30px" }}>
        저희 서비스에 대한 질문, 피드백 또는 기술적인 지원이 필요하신 경우
        언제든지 아래 정보를 통해 연락해 주십시오. 24시간 이내에 회신
        드리겠습니다.
      </p>

      <div className="contact-box">
        <h2>고객 지원팀</h2>
        <p className="contact-info">
          <strong>이메일:</strong> support@dropin.com
        </p>
        <p className="contact-info">
          <strong>전화:</strong> 070-1234-5678 (평일 9:00 ~ 18:00)
        </p>
      </div>

      <p
        className="static-meta"
        style={{ marginTop: "30px", textAlign: "center" }}
      >
        버그 신고 및 기능 제안은 서비스 내 '설정' 메뉴를 통해서도 접수
        가능합니다.
      </p>
    </div>
  );
};

export default Contact;
