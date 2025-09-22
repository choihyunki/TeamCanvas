import React from "react";
import MemberList from "../components/MemberList";
import TaskBoard from "../components/TaskBoard";
import ChatBox from "../components/ChatBox";

const Main: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
      }}
    >
      {/* 멤버 리스트 */}
      <aside
        style={{
          width: "20%",
          borderRight: "1px solid #ddd",
          padding: "10px",
          boxSizing: "border-box",
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
        }}
      >
        <ChatBox />
      </aside>
    </div>
  );
};

export default Main;
