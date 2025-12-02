// server.js (전체 코드를 이걸로 덮어씌우거나, Socket.io 부분만 수정하세요)

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

// MongoDB 연결 (기존과 동일)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected (Cloud)"))
  .catch((err) => console.log(err));

// --- [Schemas] (기존과 동일하므로 생략 가능, 변경 없음) ---
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

const TaskSubSchema = new mongoose.Schema({
  id: String,
  columnId: String,
  status: String,
  title: String,
  members: { type: [String], default: [] },
  dueDate: String,
  startDate: String,
  description: String,
});

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  ownerUsername: String,
  members: { type: Array, default: [] },
  columns: [
    {
      id: String,
      name: String,
      members: { type: Array, default: [] }, // Mixed
    },
  ],
  tasks: [TaskSubSchema],
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

// --- [API Routes] (기존과 동일, 변경 없음) ---
// ... (app.get, app.post 등 API 코드는 그대로 유지하세요) ...
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

app.get("/api/friends/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.json([]);
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: "로드 실패" });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "프로젝트 삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "삭제 실패" });
  }
});

// --- [Socket.io] 🔥 [핵심 수정 구간] ---
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 1. 유저별 연결된 소켓 ID 관리 (Set 사용) -> 여러 탭 켜도 OK
// userSockets: { "username": Set("socketId1", "socketId2") }
const userSockets = new Map();

// 2. 소켓 ID가 어떤 유저인지 역추적
// socketUserMap: { "socketId1": "username" }
const socketUserMap = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 사용자 접속: ${socket.id}`);

  // 1. 유저 로그인/접속 알림
  socket.on("register_user", (username) => {
    // 🔥 [추가] 만약 이 유저가 방금 나가려고 해서 타이머가 돌고 있었다면? -> 취소! (안 나간 걸로 침)
    if (disconnectTimeouts.has(username)) {
      console.log(`♻️ 재접속 감지! 오프라인 처리 취소: ${username}`);
      clearTimeout(disconnectTimeouts.get(username));
      disconnectTimeouts.delete(username);
    }

    socketUserMap.set(socket.id, username);

    if (!userSockets.has(username)) {
      userSockets.set(username, new Set());
    }
    userSockets.get(username).add(socket.id);

    // 온라인 알림 전송
    io.emit("user_status_change", { username: username, isOnline: true });

    // 접속자 명단 전송
    const onlineList = Array.from(userSockets.keys());
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

  // 3. 프로젝트 초대 알림 (수정됨)
  socket.on("invite_user", ({ targetUsername, projectName }) => {
    // 해당 유저의 모든 소켓(모든 탭/기기)에 알림 전송
    if (userSockets.has(targetUsername)) {
      const targets = userSockets.get(targetUsername);
      targets.forEach((socketId) => {
        io.to(socketId).emit("project_invited", { projectName });
      });
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

  // 5. 마우스 커서 (프로젝트 격리 적용)
  socket.on("cursor-move", (data) => {
    const { projectId } = data;
    if (projectId) {
      socket
        .to(String(projectId))
        .emit("cursor-update", { ...data, userId: socket.id });
    }
  });

  // 6. 칸반 보드 동기화
  socket.on("update_board", (projectId) => {
    const roomName = String(projectId);
    socket.broadcast.to(roomName).emit("board_updated");
  });

  // 7. 🔥 [접속 종료 수정]
  socket.on("disconnect", () => {
    const username = socketUserMap.get(socket.id);

    if (username) {
      const userSocketSet = userSockets.get(username);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);

        // 만약 연결된 소켓이 하나도 안 남았다면? -> 진짜 나가는 상황
        if (userSocketSet.size === 0) {
          // 🔥 [핵심] 바로 끄지 말고 2초만 기다려봅니다.
          const timeoutId = setTimeout(() => {
            // 2초 뒤에도 여전히 소켓이 없다면 -> 그때 진짜 오프라인 처리
            if (
              !userSockets.has(username) ||
              userSockets.get(username).size === 0
            ) {
              userSockets.delete(username);
              io.emit("user_status_change", {
                username: username,
                isOnline: false,
              });
              console.log(`❌ 완전 종료 (오프라인 확정): ${username}`);
            }
            disconnectTimeouts.delete(username);
          }, 2000); // 2초 딜레이

          disconnectTimeouts.set(username, timeoutId);
        }
      }
      socketUserMap.delete(socket.id);
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
