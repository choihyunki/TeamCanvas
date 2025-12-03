require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

const server = http.createServer(app);

// MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected (Cloud)"))
  .catch((err) => console.log(err));

// --- Schemas ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  friends: [{ username: String, name: String, avatarInitial: String }],
});
const User = mongoose.model("User", UserSchema);

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  ownerUsername: String,
  members: { type: Array, default: [] },
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

// --- API Routes (기존 동일) ---
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
    res.status(500).json({ message: "로드 실패" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "이미 존재함" });
    const newUser = new User({ username, password, name });
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ message: "오류" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: "정보 불일치" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "오류" });
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
    res.status(500).json({ message: "실패" });
  }
});

app.get("/api/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json(project);
  } catch (err) {
    res.status(404).json({ message: "없음" });
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
    res.status(500).json({ message: "실패" });
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

    // 1. 내 목록에 상대방 추가
    me.friends.push({
      username: target.username,
      name: target.name,
      avatarInitial: target.name.charAt(0),
    });

    // 🔥 [추가] 상대방 목록에도 나를 추가 (양방향)
    target.friends.push({
      username: me.username,
      name: me.name,
      avatarInitial: me.name.charAt(0),
    });

    await me.save();
    await target.save(); // 상대방 데이터도 저장 필수

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
    res.status(500).json({ message: "실패" });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "실패" });
  }
});

// --- [Socket.io] 실시간 통신 ---
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// 🔥 상태 관리용 변수들 (여기에 복구!)
const userSockets = new Map(); // username -> Set<socketId>
const socketUserMap = new Map(); // socketId -> username
const disconnectTimeouts = new Map(); // 지연 처리용 타이머

io.on("connection", (socket) => {
  console.log(`🔌 접속: ${socket.id}`);

  // 1. 유저 등록 & 온라인 알림 (복구됨)
  socket.on("register_user", (username) => {
    // 재접속 시 오프라인 처리 취소
    if (disconnectTimeouts.has(username)) {
      clearTimeout(disconnectTimeouts.get(username));
      disconnectTimeouts.delete(username);
    }

    socketUserMap.set(socket.id, username);

    if (!userSockets.has(username)) {
      userSockets.set(username, new Set());
    }
    userSockets.get(username).add(socket.id);

    // 🔥 [중요] "나 온라인이야!" 라고 전체 방송
    io.emit("user_status_change", { username: username, isOnline: true });

    // 현재 접속자 명단 보내주기
    const onlineList = Array.from(userSockets.keys());
    socket.emit("current_online_users", onlineList);

    console.log(`✅ 유저 온라인: ${username}`);
  });

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

  // 초대 알림 (수정됨: Set 대응)
  socket.on("invite_user", ({ targetUsername, projectName }) => {
    if (userSockets.has(targetUsername)) {
      const targets = userSockets.get(targetUsername);
      // 해당 유저의 모든 기기(탭)에 알림 전송
      targets.forEach((sid) => {
        io.to(sid).emit("project_invited", { projectName });
      });
    }
  });

  socket.on("send_message", async (data) => {
    const saveData = { ...data, projectId: String(data.projectId) };
    try {
      const newMsg = new ChatMessage(saveData);
      await newMsg.save();
      io.to(String(data.projectId)).emit("receive_message", saveData);
    } catch (e) {
      console.error(e);
    }
  });

  // 커서 (수정됨: projectId 체크)
  socket.on("cursor-move", (data) => {
    if (data.projectId) {
      socket
        .to(String(data.projectId))
        .emit("cursor-update", { ...data, userId: socket.id });
    }
  });

  socket.on("update_board", (projectId) => {
    socket.broadcast.to(String(projectId)).emit("board_updated");
  });

  // 7. 접속 종료 (지연 처리 복구)
  socket.on("disconnect", () => {
    const username = socketUserMap.get(socket.id);

    if (username) {
      const userSocketSet = userSockets.get(username);

      if (userSocketSet) {
        userSocketSet.delete(socket.id);

        // 연결된 소켓이 하나도 없으면 -> 진짜 나가는 상황
        if (userSocketSet.size === 0) {
          // 2초 딜레이 (새로고침 시 깜빡임 방지)
          const timeoutId = setTimeout(() => {
            const currentSet = userSockets.get(username);
            if (!currentSet || currentSet.size === 0) {
              userSockets.delete(username);
              // 🔥 [중요] "나 나갔어!" 전체 방송
              io.emit("user_status_change", {
                username: username,
                isOnline: false,
              });
              console.log(`❌ 오프라인 확정: ${username}`);
            }
            disconnectTimeouts.delete(username);
          }, 2000);

          disconnectTimeouts.set(username, timeoutId);
        }
      }
      socketUserMap.delete(socket.id);
    }
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});

// 배포 설정
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
