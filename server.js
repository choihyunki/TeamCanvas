// server.js
require("dotenv").config(); // .env 파일 불러오기
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose"); // 몽구스 추가

const app = express();
app.use(cors());

const server = http.createServer(app);

// 1. 클라우드 DB(MongoDB Atlas) 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected (Cloud)"))
  .catch((err) => console.log(err));

// 2. 채팅 데이터 설계도(스키마) 만들기
const chatSchema = new mongoose.Schema({
  projectId: Number,
  author: String,
  message: String,
  time: String,
  createdAt: { type: Date, default: Date.now }, // 정렬을 위해 생성 시간 자동 저장
});

const ChatMessage = mongoose.model("ChatMessage", chatSchema);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // --- [1] 실시간 커서 ---
  socket.on("cursor-move", (data) => {
    socket.broadcast.emit("cursor-update", { ...data, userId: socket.id });
  });

  // --- [2] 실시간 채팅 (DB 연동) ---

  // 1. 방 입장 & 이전 대화 불러오기 (핵심 기능!)
  socket.on("join_room", async (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project: ${projectId}`);

    try {
      // DB에서 해당 프로젝트의 채팅 기록을 오래된 순서대로 가져옴
      const history = await ChatMessage.find({ projectId }).sort({
        createdAt: 1,
      });

      // 방금 들어온 사람한테만 채팅 내역 전송
      socket.emit("load_messages", history);
    } catch (e) {
      console.error(e);
    }
  });

  // 2. 메시지 전송 & DB 저장
  socket.on("send_message", async (data) => {
    // data = { projectId, author, message, time }

    // 🔥 클라우드 DB에 영구 저장
    const newMsg = new ChatMessage(data);
    await newMsg.save();

    // 같은 방 사람들한테 전송
    io.to(data.projectId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});

server.listen(4000, () => {
  console.log("SERVER RUNNING ON PORT 4000");
});
