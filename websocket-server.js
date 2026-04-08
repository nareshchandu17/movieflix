const { Server } = require("socket.io");
const http = require("http");

// Standalone HTTP Server for Socket.io
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"]
  }
});

// In-memory data store
// Room mapping: roomId -> { participants: [{ id, name }], messages: [], currentPlayState: "pause", currentTime: 0 }
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 1. Join Room
  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.userName = userName;
    socket.data.roomId = roomId;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        participants: [],
        messages: [],
        currentPlayState: "pause",
        currentTime: 0
      });
    }

    const room = rooms.get(roomId);
    
    // Add participant if not already in list
    const existing = room.participants.find(p => p.id === socket.id);
    if (!existing) {
      room.participants.push({ id: socket.id, name: userName });
    }

    // Broadcast updated state to room
    io.to(roomId).emit("room-state", room);
    
    // Send chat history to the newly joined user
    socket.emit("chat-history", room.messages);

    // Announce
    const announceMsg = {
      user: "System",
      message: `${userName} joined the party!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    room.messages.push(announceMsg);
    // Keep max 100 messages
    if (room.messages.length > 100) room.messages.shift();
    
    io.to(roomId).emit("chat-message", announceMsg);
    console.log(`[${roomId}] ${userName} joined.`);
  });

  // 2. Chat
  socket.on("chat-message", (data) => {
    const { roomId, message, user, timestamp } = data;
    const room = rooms.get(roomId);
    if (room) {
      const chatObj = { user, message, timestamp, isSystem: false };
      room.messages.push(chatObj);
      if (room.messages.length > 100) room.messages.shift();
      io.to(roomId).emit("chat-message", chatObj);
    }
  });

  // 3. Sync events
  socket.on("play", (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.currentPlayState !== "play") {
      room.currentPlayState = "play";
      socket.to(roomId).emit("play"); // Send to everyone EXCEPT sender
      console.log(`[${roomId}] PLAY by ${socket.data.userName}`);
    }
  });

  socket.on("pause", (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.currentPlayState !== "pause") {
      room.currentPlayState = "pause";
      socket.to(roomId).emit("pause"); 
      console.log(`[${roomId}] PAUSE by ${socket.data.userName}`);
    }
  });

  socket.on("seek", (data) => {
    const { roomId, time } = data;
    const room = rooms.get(roomId);
    if (room) {
      room.currentTime = time;
      socket.to(roomId).emit("seek", time);
      console.log(`[${roomId}] SEEK to ${time} by ${socket.data.userName}`);
    }
  });

  // 4. Leave / Disconnect
  const handleLeave = () => {
    const roomId = socket.data.roomId;
    const userName = socket.data.userName;
    if (roomId && userName) {
      const room = rooms.get(roomId);
      if (room) {
        room.participants = room.participants.filter(p => p.id !== socket.id);
        
        io.to(roomId).emit("room-state", room);
        
        const announceMsg = {
          user: "System",
          message: `${userName} left the party.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        };
        room.messages.push(announceMsg);
        io.to(roomId).emit("chat-message", announceMsg);
        console.log(`[${roomId}] ${userName} left.`);

        if (room.participants.length === 0) {
          rooms.delete(roomId);
          console.log(`[${roomId}] Room empty, deleted.`);
        }
      }
    }
  };

  socket.on("leave-room", () => {
    handleLeave();
    socket.leave(socket.data.roomId);
    socket.data.roomId = null;
  });

  socket.on("disconnect", () => {
    handleLeave();
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Standalone Socket.io Watch Party Server running on http://localhost:${PORT}`);
});
