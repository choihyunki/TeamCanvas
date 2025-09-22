import React from "react";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { projectId, roomId } = useParams();
  return (
    <div>
      <h1>Chat Page</h1>
      <p>Project: {projectId}</p>
      <p>Room: {roomId ?? "전체 채팅방"}</p>
    </div>
  );
};

export default Chat;
