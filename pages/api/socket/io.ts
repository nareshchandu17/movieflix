import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { connectDB } from '@/lib/db';
import { WatchParty } from '@/models/WatchCircle';
import mongoose from 'mongoose';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
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
          console.log(`User ${userName} (${userId}) joined room ${roomCode}`);
          
          socket.to(roomCode).emit('user-joined', {
            userId,
            userName,
            socketId: socket.id,
            timestamp: Date.now()
          });

          // Send current state
          const dbRoom = await WatchParty.findOne({ roomCode, status: 'active' });
          socket.emit('room-state', {
            roomCode,
            participants: [], // In-memory tracking could be added here
            currentPlayState: dbRoom?.currentPlayState || 'paused',
            currentTime: dbRoom?.currentTime || 0,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Join error:', error);
        }
      });

      socket.on('chat-message', (data) => {
        socket.to(data.roomCode).emit('chat-message', {
          ...data,
          timestamp: Date.now()
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
