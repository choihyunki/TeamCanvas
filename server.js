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

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  ownerUsername: String,
  members: { type: Array, default: [] }, // 객체 배열 저장 허용
  columns: [
    {
      id: String, // 🔥 String
      name: String,
      members: { type: Array, default: [] },
    },
  ],
  tasks: [
    {
      id: String, // 🔥 String
      columnId: String, // 🔥 String
      status: String,
      title: String,
      members: [String],
      // ... 기타
    },
  ],
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

// 1. 내 프로젝트 목록
app.get("/api/projects", async (req, res) => {
  const { username } = req.query;
  try {
    const projects = await Project.find({
      $or: [
        { ownerUsername: username },
        { "members.username": username },
        { "members.name": username },
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
    res.status(500).json({ message: "서버 오류" });
  }
});

// 4. 새 프로젝트 생성
app.post("/api/projects", async (req, res) => {
  try {
    const { name, description, ownerUsername } = req.body;
    const ownerMember = {
      id: Date.now(),
      name: ownerUsername,
      username: ownerUsername,
      isOnline: true,
      role: "관리자",
    };
    const newProject = new Project({
      name,
      description,
      ownerUsername,
      members: [ownerMember],
      columns: [],
      tasks: [],
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
    const { columns, members, tasks } = req.body;
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { columns, members, tasks },
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

// --- [Socket.io] ---
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 🔥 [통합] 유저 소켓 관리 (Socket ID <-> Username)
// userSockets: 초대 기능용 (Username -> Socket ID)
const userSockets = new Map();
// onlineUsers: 온라인 상태 확인용 (Socket ID -> Username)
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 사용자 접속: ${socket.id}`);

  // 1. 유저 로그인/접속 알림 (Project.tsx에서 보내줘야 함)
  socket.on("register_user", (username) => {
    // 초대용 매핑
    userSockets.set(username, socket.id);
    // 온라인 상태용 매핑
    onlineUsers.set(socket.id, username);

    console.log(`✅ 유저 온라인: ${username}`);

    // 나 접속했다고 모두에게 알림 (Username 기준)
    io.emit("user_status_change", { username: username, isOnline: true });

    // 현재 접속자 리스트를 본인에게 전송
    const onlineList = Array.from(onlineUsers.values());
    socket.emit("current_online_users", onlineList);
  });

  // 2. 방 입장
  socket.on("join_room", async (projectId) => {
    const roomName = String(projectId);
    socket.join(roomName);
    try {
      const history = await ChatMessage.find({ projectId: roomName }).sort({
        createdAt: 1,
      });
      socket.emit("load_messages", history);
    } catch (e) {
      console.error(e);
    }
  });

  // 3. 프로젝트 초대 알림
  socket.on("invite_user", ({ targetUsername, projectName }) => {
    const targetSocketId = userSockets.get(targetUsername);
    if (targetSocketId) {
      io.to(targetSocketId).emit("project_invited", { projectName });
    }
  });

  // 4. 메시지 전송
  socket.on("send_message", async (data) => {
    const saveData = { ...data, projectId: String(data.projectId) };
    try {
      const newMsg = new ChatMessage(saveData);
      await newMsg.save();
      const roomName = String(data.projectId);
      io.to(roomName).emit("receive_message", saveData);
    } catch (e) {
      console.error(e);
    }
  });

  // 5. 마우스 커서
  socket.on("cursor-move", (data) => {
    socket.broadcast.emit("cursor-update", { ...data, userId: socket.id });
  });

  // 6. 칸반 보드 동기화
  socket.on("update_board", (projectId) => {
    const roomName = String(projectId);
    socket.broadcast.to(roomName).emit("board_updated");
  });

  // 7. 🔥 [통합] 접속 종료 (하나의 핸들러에서 모두 처리)
  socket.on("disconnect", () => {
    const disconnectedUser = onlineUsers.get(socket.id);

    if (disconnectedUser) {
      // 1. 온라인 맵에서 제거
      onlineUsers.delete(socket.id);
      // 2. 초대용 맵에서도 제거
      userSockets.delete(disconnectedUser);

      // 3. 모두에게 오프라인 알림 전송
      io.emit("user_status_change", {
        username: disconnectedUser,
        isOnline: false,
      });

      console.log(`❌ 접속 종료: ${disconnectedUser}`);
    } else {
      console.log(`❌ 접속 종료 (비로그인): ${socket.id}`);
    }

    socket.broadcast.emit("user-disconnected", socket.id);
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
