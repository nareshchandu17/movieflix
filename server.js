import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
      // Notify others in the room
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("play", (roomId) => {
      socket.to(roomId).emit("play");
    });

    socket.on("pause", (roomId) => {
      socket.to(roomId).emit("pause");
    });

    socket.on("seek", ({ roomId, time }) => {
      socket.to(roomId).emit("seek", time);
    });

    socket.on("chat-message", ({ roomId, message, user }) => {
      io.to(roomId).emit("chat-message", { message, user, timestamp: new Date() });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
