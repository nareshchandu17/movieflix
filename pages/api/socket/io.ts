import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextServer } from 'next/dist/server/next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Store active watch parties
    const watchParties = new Map<string, Set<string>>();
    const userSockets = new Map<string, string>();

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join watch party room
      socket.on('join-watch-party', (data: { roomCode: string; userId: string }) => {
        const { roomCode, userId } = data;
        
        // Leave previous room if any
        const previousRoom = userSockets.get(userId);
        if (previousRoom) {
          socket.leave(previousRoom);
          const room = watchParties.get(previousRoom);
          if (room) {
            room.delete(socket.id);
            if (room.size === 0) {
              watchParties.delete(previousRoom);
            }
          }
        }

        // Join new room
        socket.join(roomCode);
        userSockets.set(userId, roomCode);
        
        // Add to room participants
        if (!watchParties.has(roomCode)) {
          watchParties.set(roomCode, new Set());
        }
        watchParties.get(roomCode)!.add(socket.id);

        console.log(`User ${userId} joined watch party ${roomCode}`);
        
        // Notify others in the room
        socket.to(roomCode).emit('user-joined', {
          userId,
          timestamp: Date.now()
        });

        // Send current room state to new user
        socket.emit('room-state', {
          roomCode,
          participants: Array.from(watchParties.get(roomCode) || []),
          timestamp: Date.now()
        });
      });

      // Playback control events
      socket.on('play', (data: { roomCode: string; timestamp: number; userId: string }) => {
        const { roomCode, timestamp, userId } = data;
        socket.to(roomCode).emit('play', {
          timestamp,
          userId,
          initiatedBy: userId,
          serverTimestamp: Date.now()
        });
        console.log(`Play event in room ${roomCode} by user ${userId} at ${timestamp}`);
      });

      socket.on('pause', (data: { roomCode: string; timestamp: number; userId: string }) => {
        const { roomCode, timestamp, userId } = data;
        socket.to(roomCode).emit('pause', {
          timestamp,
          userId,
          initiatedBy: userId,
          serverTimestamp: Date.now()
        });
        console.log(`Pause event in room ${roomCode} by user ${userId} at ${timestamp}`);
      });

      socket.on('seek', (data: { roomCode: string; timestamp: number; userId: string }) => {
        const { roomCode, timestamp, userId } = data;
        socket.to(roomCode).emit('seek', {
          timestamp,
          userId,
          initiatedBy: userId,
          serverTimestamp: Date.now()
        });
        console.log(`Seek event in room ${roomCode} by user ${userId} to ${timestamp}`);
      });

      socket.on('volume-change', (data: { roomCode: string; volume: number; userId: string }) => {
        const { roomCode, volume, userId } = data;
        socket.to(roomCode).emit('volume-change', {
          volume,
          userId,
          serverTimestamp: Date.now()
        });
      });

      // Chat and reaction events
      socket.on('chat-message', (data: { roomCode: string; message: string; userId: string; userName: string }) => {
        const { roomCode, message, userId, userName } = data;
        socket.to(roomCode).emit('chat-message', {
          message,
          userId,
          userName,
          timestamp: Date.now()
        });
        console.log(`Chat message in room ${roomCode} by ${userName}: ${message}`);
      });

      socket.on('reaction', (data: { roomCode: string; reaction: string; userId: string; userName: string; movieTimestamp: number }) => {
        const { roomCode, reaction, userId, userName, movieTimestamp } = data;
        socket.to(roomCode).emit('reaction', {
          reaction,
          userId,
          userName,
          movieTimestamp,
          timestamp: Date.now()
        });
        console.log(`Reaction in room ${roomCode} by ${userName}: ${reaction} at ${movieTimestamp}s`);
      });

      // Watch progress events
      socket.on('progress-update', (data: { roomCode: string; currentTime: number; userId: string }) => {
        const { roomCode, currentTime, userId } = data;
        socket.to(roomCode).emit('progress-update', {
          currentTime,
          userId,
          timestamp: Date.now()
        });
      });

      // Buffer status for sync
      socket.on('buffer-status', (data: { roomCode: string; isBuffering: boolean; userId: string }) => {
        const { roomCode, isBuffering, userId } = data;
        socket.to(roomCode).emit('buffer-status', {
          isBuffering,
          userId,
          timestamp: Date.now()
        });
      });

      // Quality change events
      socket.on('quality-change', (data: { roomCode: string; quality: string; userId: string }) => {
        const { roomCode, quality, userId } = data;
        socket.to(roomCode).emit('quality-change', {
          quality,
          userId,
          timestamp: Date.now()
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Find and remove user from all rooms
        for (const [roomCode, participants] of watchParties.entries()) {
          if (participants.has(socket.id)) {
            participants.delete(socket.id);
            
            // Notify others in the room
            socket.to(roomCode).emit('user-left', {
              socketId: socket.id,
              timestamp: Date.now()
            });

            // Clean up empty rooms
            if (participants.size === 0) {
              watchParties.delete(roomCode);
              console.log(`Room ${roomCode} is now empty`);
            }
            break;
          }
        }

        // Remove from user sockets mapping
        for (const [userId, roomCode] of userSockets.entries()) {
          if (userSockets.get(userId) === roomCode) {
            userSockets.delete(userId);
            break;
          }
        }
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
