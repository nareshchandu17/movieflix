import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { connectDB } from '@/lib/db';
import { WatchParty } from '@/models/WatchCircle';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Global rooms state for persistence between HMR and API calls
declare global {
  var _socketRooms: Record<string, {
    hostId: string | null;
    participants: Array<{
      userId: string;
      userName: string;
      socketId: string;
      status: string;
      isHost: boolean;
    }>;
    playback: {
      isPlaying: boolean;
      currentTime: number;
      lastUpdated: number;
    }
  }>;
}

if (!global._socketRooms) {
  global._socketRooms = {};
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    // console.log('Socket is already running');
  } else {
    console.log('⚡ Socket.IO is initializing...');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['polling', 'websocket']
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-watch-party', async (data: { roomCode: string; userId: string; userName: string }) => {
        const { roomCode, userId, userName } = data;
        
        try {
          await connectDB();
          socket.join(roomCode);
          
          // Initialize room if not exists
          if (!global._socketRooms[roomCode]) {
            global._socketRooms[roomCode] = {
              hostId: socket.id,
              participants: [],
              playback: {
                isPlaying: false,
                currentTime: 0,
                lastUpdated: Date.now()
              }
            };
          }

          const room = global._socketRooms[roomCode];
          
          // Add participant
          const participant = {
            userId,
            userName: userName || 'Guest',
            socketId: socket.id,
            status: 'watching',
            isHost: room.hostId === socket.id
          };
          
          // Avoid duplicate entries for same socket
          room.participants = room.participants.filter(p => p.socketId !== socket.id);
          room.participants.push(participant);

          console.log(`User ${userName} (${userId}) joined room ${roomCode}`);
          
          // Notify others
          socket.to(roomCode).emit('user-joined', participant);

          // Send current state to the joining user
          socket.emit('room-state', {
            roomCode,
            hostId: room.hostId,
            participants: room.participants,
            isHost: room.hostId === socket.id,
            currentPlayState: room.playback.isPlaying ? 'playing' : 'paused',
            currentTime: room.playback.currentTime,
            timestamp: Date.now()
          });

          // Sync database status
          await WatchParty.findOneAndUpdate(
            { roomCode },
            { $addToSet: { participants: { userId, userName } }, status: 'active' }
          ).catch(e => console.error("DB Sync Error:", e));

        } catch (error) {
          console.error('Join error:', error);
        }
      });

      // Playback Controls
      socket.on('play', (data: { roomCode: string; timestamp: number; userId: string }) => {
        const { roomCode, timestamp } = data;
        if (global._socketRooms[roomCode]) {
          global._socketRooms[roomCode].playback.isPlaying = true;
          global._socketRooms[roomCode].playback.currentTime = timestamp;
          global._socketRooms[roomCode].playback.lastUpdated = Date.now();
        }
        socket.to(roomCode).emit('play', { ...data, initiatedBy: socket.id });
      });

      socket.on('pause', (data: { roomCode: string; timestamp: number; userId: string }) => {
        const { roomCode, timestamp } = data;
        if (global._socketRooms[roomCode]) {
          global._socketRooms[roomCode].playback.isPlaying = false;
          global._socketRooms[roomCode].playback.currentTime = timestamp;
          global._socketRooms[roomCode].playback.lastUpdated = Date.now();
        }
        socket.to(roomCode).emit('pause', { ...data, initiatedBy: socket.id });
      });

      socket.on('seek', (data: { roomCode: string; timestamp: number; userId: string }) => {
        const { roomCode, timestamp } = data;
        if (global._socketRooms[roomCode]) {
          global._socketRooms[roomCode].playback.currentTime = timestamp;
          global._socketRooms[roomCode].playback.lastUpdated = Date.now();
        }
        socket.to(roomCode).emit('seek', { ...data, initiatedBy: socket.id });
      });

      socket.on('host-progress-sync', (data: { roomCode: string; currentTime: number }) => {
        const { roomCode, currentTime } = data;
        if (global._socketRooms[roomCode] && global._socketRooms[roomCode].hostId === socket.id) {
          global._socketRooms[roomCode].playback.currentTime = currentTime;
          global._socketRooms[roomCode].playback.lastUpdated = Date.now();
          socket.to(roomCode).emit('progress-sync', { currentTime });
        }
      });

      // Status Updates
      socket.on('participant-status', (data: { roomCode: string; userId: string; status: string }) => {
        const { roomCode, status } = data;
        if (global._socketRooms[roomCode]) {
          global._socketRooms[roomCode].participants = global._socketRooms[roomCode].participants.map(p => 
            p.socketId === socket.id ? { ...p, status } : p
          );
          socket.to(roomCode).emit('status-update', { ...data, socketId: socket.id });
        }
      });

      // Chat and Reactions
      socket.on('chat-message', (data: { roomCode: string; message: string; userId: string; userName: string }) => {
        socket.to(data.roomCode).emit('chat-message', {
          ...data,
          id: `msg-${Date.now()}-${socket.id}`,
          timestamp: Date.now()
        });
      });

      socket.on('reaction', (data: { roomCode: string; reaction: string; userId: string; userName: string; movieTimestamp: number }) => {
        socket.to(data.roomCode).emit('reaction', {
          ...data,
          type: data.reaction,
          id: `react-${Date.now()}-${socket.id}`,
          timestamp: Date.now()
        });
      });

      socket.on('disconnecting', () => {
        socket.rooms.forEach(roomCode => {
          if (global._socketRooms[roomCode]) {
            const room = global._socketRooms[roomCode];
            room.participants = room.participants.filter(p => p.socketId !== socket.id);
            
            socket.to(roomCode).emit('user-left', { socketId: socket.id });

            // If host left, assign new host
            if (room.hostId === socket.id) {
              if (room.participants.length > 0) {
                const newHost = room.participants[0];
                room.hostId = newHost.socketId;
                newHost.isHost = true;
                io.to(roomCode).emit('host-changed', { 
                  hostId: newHost.socketId, 
                  userId: newHost.userId 
                });
              } else {
                delete global._socketRooms[roomCode];
              }
            }
          }
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }
  res.end();
};

export default SocketHandler;

