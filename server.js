// server.js (기존 파일에 아래 내용을 덮어쓰거나 추가하세요)
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React 앱 주소
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // --- [1] 실시간 커서 (기존 기능) ---
  socket.on("cursor-move", (data) => {
    socket.broadcast.emit("cursor-update", { ...data, userId: socket.id });
  });

  // --- [2] 실시간 채팅 (새로 추가된 기능!) ---

  // 1. 방 입장 (프로젝트 들어갈 때)
  socket.on("join_room", (projectId) => {
    socket.join(projectId); // 소켓을 특정 방(Project ID)에 넣음
    console.log(`User ${socket.id} joined project: ${projectId}`);
  });

  // 2. 메시지 전송
  socket.on("send_message", (data) => {
    // data = { projectId, author, message, time }

    // 🔥 나중에 여기에 DB 저장 코드를 넣으면 끝입니다! (db.save(data))

    // 같은 방(projectId)에 있는 사람들에게만 메시지를 뿌림
    io.to(data.projectId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});

server.listen(4000, () => {
  console.log("SERVER RUNNING ON PORT 4000");
});
