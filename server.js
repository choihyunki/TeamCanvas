require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);

// MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected (Cloud)"))
  .catch((err) => console.log(err));

// --- [Schemas] ---

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  friends: [
    {
      username: String,
      name: String,
      avatarInitial: String,
    },
  ],
});
const User = mongoose.model("User", UserSchema);

// 🔥 [수정 1] 프로젝트 스키마 변경 (가장 중요!)
// members를 단순 [String]에서 Array로 바꿔야 객체({ username, avatar... })를 저장할 수 있습니다.
const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  ownerUsername: String,
  members: { type: Array, default: [] }, // 🔥 [String] -> Array 로 변경됨
  columns: { type: Array, default: [] },
  tasks: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});
const Project = mongoose.model("Project", ProjectSchema);

const ChatSchema = new mongoose.Schema({
  projectId: String,
  author: String,
  message: String,
  time: String,
  createdAt: { type: Date, default: Date.now },
});
const ChatMessage = mongoose.model("ChatMessage", ChatSchema);

// --- [API Routes] ---

// 1. 내 프로젝트 목록 가져오기
app.get("/api/projects", async (req, res) => {
  const { username } = req.query;
  console.log(`🔎 검색 요청: ${username}`);

  try {
    // 🔥 [수정 2] 검색 로직 변경
    // members 배열 안에 있는 '객체'의 username이 일치하는지 확인해야 함
    const projects = await Project.find({
      $or: [
        { ownerUsername: username },
        { "members.username": username }, // 🔥 객체 내부 username 검색
        { "members.name": username }, // (혹시 몰라 이름으로도 검색)
      ],
    });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "프로젝트 로드 실패" });
  }
});

// 2. 회원가입
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
    console.error("회원가입 에러:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 3. 로그인
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user)
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 틀렸습니다." });
    res.json(user);
  } catch (err) {
    console.error("로그인 에러:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 4. 새 프로젝트 생성
app.post("/api/projects", async (req, res) => {
  try {
    const { name, description, ownerUsername } = req.body;

    // 생성자도 객체 형태로 저장
    const ownerMember = {
      id: Date.now(),
      name: ownerUsername,
      username: ownerUsername, // 🔥 검색을 위해 username 필드 필수
      isOnline: true,
      role: "관리자",
    };

    const newProject = new Project({
      name,
      description,
      ownerUsername,
      members: [ownerMember], // 🔥 객체 배열로 시작
      columns: [],
    });
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ message: "생성 실패" });
  }
});

// 5. 프로젝트 상세 & 저장
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
    // 🔥 tasks 추가
    const { columns, members, tasks } = req.body;

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { columns, members, tasks }, // 🔥 tasks도 DB에 저장!
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "저장 실패" });
  }
});

// 6. 친구 추가
app.post("/api/friends/add", async (req, res) => {
  const { myUsername, targetUsername } = req.body;
  try {
    const me = await User.findOne({ username: myUsername });
    const target = await User.findOne({ username: targetUsername });

    if (!target)
      return res.status(404).json({ message: "존재하지 않는 아이디입니다." });
    if (myUsername === targetUsername)
      return res.status(400).json({ message: "나 자신은 추가할 수 없습니다." });

    const isAlreadyFriend = me.friends.some(
      (f) => f.username === targetUsername
    );
    if (isAlreadyFriend)
      return res.status(400).json({ message: "이미 등록된 친구입니다." });

    me.friends.push({
      username: target.username,
      name: target.name,
      avatarInitial: target.name.charAt(0),
    });

    await me.save();
    res.json(me.friends);
  } catch (err) {
    res.status(500).json({ message: "친구 추가 실패" });
  }
});

// 7. 친구 목록 가져오기
app.get("/api/friends/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.json([]);
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: "로드 실패" });
  }
});

// 8. 프로젝트 삭제
app.delete("/api/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "프로젝트 삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "삭제 실패" });
  }
});

// --- Socket.io ---
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 사용자 접속: ${socket.id}`);

  // 1. 로그인 시 내 아이디 등록 (누가 누구인지 서버가 알게 함)
  socket.on("register_user", (username) => {
    userSockets.set(username, socket.id);
    console.log(`✅ 유저 등록: ${username} -> ${socket.id}`);
  });

  // 2. 방 입장
  socket.on("join_room", async (projectId) => {
    const roomName = String(projectId);
    socket.join(roomName);
    // ... (기존 히스토리 로드 코드 유지)
  });

  socket.on("send_message", async (data) => {
    console.log("📨 [메시지 받음]", data);
    const saveData = { ...data, projectId: String(data.projectId) };

    try {
      const newMsg = new ChatMessage(saveData);
      await newMsg.save();
      const roomName = String(data.projectId);
      io.to(roomName).emit("receive_message", saveData);
    } catch (e) {
      console.error("메시지 저장 실패", e);
    }
  });

  socket.on("invite_user", ({ targetUsername, projectName }) => {
    const targetSocketId = userSockets.get(targetUsername);
    if (targetSocketId) {
      // 초대받은 사람에게만 "너 초대됐어!" 신호 전송
      io.to(targetSocketId).emit("project_invited", { projectName });
      console.log(`🔔 초대 알림 전송: ${targetUsername}에게`);
    }
  });

  socket.on("cursor-move", (data) => {
    socket.broadcast.emit("cursor-update", { ...data, userId: socket.id });
  });

  socket.on("update_board", (projectId) => {
    const roomName = String(projectId);
    console.log(`🔄 [보드 업데이트] 방: ${roomName}`);
    socket.broadcast.to(roomName).emit("board_updated");
  });

  socket.on("disconnect", () => {
    // 나간 유저 제거 (Map에서 삭제)
    for (const [username, sid] of userSockets.entries()) {
      if (sid === socket.id) {
        userSockets.delete(username);
        break;
      }
    }
    console.log(`❌ 접속 종료: ${socket.id}`);
  });
});

// --- 배포 설정 ---
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
