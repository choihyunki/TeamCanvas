// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json()); // JSON 데이터 해석 허용

const server = http.createServer(app);

// 1. MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected (Cloud)"))
  .catch((err) => console.log(err));

// --- [Schemas & Models] 데이터 설계도 ---

// 1. 유저 스키마
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
});
const User = mongoose.model("User", UserSchema);

// 2. 프로젝트 스키마 (칸반 보드 구조 포함)
const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  ownerUsername: String,
  members: [String], // 멤버 이름들
  columns: { type: Array, default: [] }, // 칸반 보드 컬럼 데이터 전체 저장
  createdAt: { type: Date, default: Date.now },
});
const Project = mongoose.model("Project", ProjectSchema);

// 3. 채팅 스키마
const ChatSchema = new mongoose.Schema({
  projectId: String,
  author: String,
  message: String,
  time: String,
  createdAt: { type: Date, default: Date.now },
});
const ChatMessage = mongoose.model("ChatMessage", ChatSchema);

// --- [API Routes] 프론트엔드 요청 처리 ---

// 1. 회원가입
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "이미 존재하는 아이디입니다." });

    const newUser = new User({ username, password, name });
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// 2. 로그인
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user)
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 틀렸습니다." });

    // 원래는 JWT 토큰을 써야 하지만, 지금은 간단히 유저 정보 반환
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// 3. 내 프로젝트 목록 가져오기
app.get("/api/projects", async (req, res) => {
  const { username } = req.query;
  try {
    // 내가 주인이거나, 멤버로 포함된 프로젝트 찾기
    const projects = await Project.find({
      $or: [{ ownerUsername: username }, { members: username }],
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "프로젝트 로드 실패" });
  }
});

// 4. 새 프로젝트 생성
app.post("/api/projects", async (req, res) => {
  try {
    const { name, description, ownerUsername } = req.body;
    const newProject = new Project({
      name,
      description,
      ownerUsername,
      members: [ownerUsername], // 생성자는 자동으로 멤버 포함
      columns: [], // 빈 보드로 시작
    });
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ message: "생성 실패" });
  }
});

// 5. 프로젝트 상세 정보 가져오기 & 저장하기 (칸반 보드용)
app.get("/api/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json(project);
  } catch (err) {
    res.status(404).json({ message: "프로젝트 없음" });
  }
});

app.put("/api/projects/:id", async (req, res) => {
  try {
    const { columns, members } = req.body; // 변경된 보드 상태와 멤버 목록
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { columns, members },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "저장 실패" });
  }
});

// --- [Socket.io] 실시간 통신 ---

const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  // ... (기존 실시간 커서 & 채팅 로직 유지) ...

  socket.on("join_room", async (projectId) => {
    socket.join(projectId);
    const history = await ChatMessage.find({ projectId }).sort({
      createdAt: 1,
    });
    socket.emit("load_messages", history);
  });

  socket.on("send_message", async (data) => {
    const newMsg = new ChatMessage(data);
    await newMsg.save();
    io.to(data.projectId).emit("receive_message", data);
  });

  socket.on("cursor-move", (data) => {
    socket.broadcast.emit("cursor-update", { ...data, userId: socket.id });
  });

  socket.on("disconnect", () => {});
});

server.listen(4000, () => {
  console.log("🔥 Server & DB Ready on Port 4000");
});
