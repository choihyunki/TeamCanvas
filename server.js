const io = require("socket.io")(4000, {
  cors: {
    origin: "*", // 모든 주소에서 접속 허용
    methods: ["GET", "POST"],
  },
});

console.log("🐭 Socket Server started on port 4000");

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 1. 누가 커서를 움직이면 -> 다른 사람들에게 좌표 전송
  socket.on("cursor-move", (data) => {
    // 나(보낸 사람)를 제외한 나머지에게만 보냄 (broadcast)
    socket.broadcast.emit("cursor-update", { ...data, userId: socket.id });
  });

  // 2. 연결 끊기면 -> 커서 삭제하라고 알림
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});
