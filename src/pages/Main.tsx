import React from "react";
import Header from "../components/Header"; 
import Footer from "../components/Footer"; 
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import ChatBox from "../components/ChatBox";

const Main: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >

      <Header onMenuClick={() => console.log("Menu clicked")} />

      {/* 메인 콘텐츠 (기존 Main 컴포넌트의 내용) */}
      <div
        style={{
          display: "flex",
          flex: 1, // 헤더와 푸터를 제외한 남은 공간을 모두 차지
        }}
      >
        {/* 멤버 리스트 */}
        <aside
          style={{
            width: "20%",
            borderRight: "1px solid #ddd",
            padding: "10px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <MemberList />
        </aside>

        {/* 작업 보드 */}
        <main
          style={{
            flex: 1,
            padding: "10px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <TaskBoard />
        </main>

        {/* 채팅창 */}
        <aside
          style={{
            width: "25%",
            borderLeft: "1px solid #ddd",
            padding: "10px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <ChatBox />
        </aside>
      </div>

      {/* 푸터 컴포넌트 */}
      <Footer />
    </div>
  );
};

export default Main;