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

// 🔥 [수정 1] 프로젝트 스키마 변경
// members를 단순 String 배열이 아니라, '어떤 형태든 가능한 배열(Array)'로 변경
// 그래야 { id, name, role... } 같은 객체 정보를 통째로 저장할 수 있습니다.
const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  ownerUsername: String,
  members: { type: Array, default: [] }, // [String] -> Array 로 변경
  columns: { type: Array, default: [] },
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
  try {
    // 🔥 [수정 2] 검색 쿼리 변경
    // members 배열 안에 있는 "객체"들 중에서, name 필드가 username과 같은지 확인
    const projects = await Project.find({
      $or: [
        { ownerUsername: username }, // 내가 만든 거거나
        { "members.name": username }, // 🔥 멤버 목록(객체)의 name에 내가 있거나
      ],
    });
    res.json(projects);
  } catch (err) {
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

    // 생성자는 자동으로 멤버에 포함 (객체 형태로 저장)
    const ownerMember = {
      id: Date.now(),
      name: ownerUsername, // 검색을 위해 username을 name 필드에 저장
      isOnline: true,
      role: "관리자",
    };

    const newProject = new Project({
      name,
      description,
      ownerUsername,
      members: [ownerMember], // 🔥 객체 배열로 초기화
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
    const { columns, members } = req.body;
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
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
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

  socket.on("update_board", (projectId) => {
    socket.broadcast.to(projectId).emit("board_updated");
  });

  socket.on("disconnect", () => {});
});

// --- [배포용] 정적 파일 제공 ---
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
