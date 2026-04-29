/**
 * Production-ready Socket.io server for Watch Party functionality
 * Features: Database persistence, user authentication, scalability, room management
 */

import './load-env';

import { Server } from 'socket.io';
import { createServer } from 'http';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Socket } from 'socket.io';
import { redis } from '@/lib/redis';

interface CustomSocket extends Socket {
  userId?: string;
  userName?: string;
}

// Models
import User from '@/models/User';
import WatchPartyRoom from '../models/WatchPartyRoom';

interface RoomParticipant {
  userId: string;
  userName: string;
  socketId: string;
  joinedAt: Date;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'chat-message' | 'play' | 'pause' | 'seek' | 'room-state';
  data: any;
  targetUserId?: string;
  senderId?: string;
}

class SocketServer {
  private io: Server;
  private rooms: Map<string, RoomParticipant[]> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor() {
    this.io = new Server(this.createHttpServer(), {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://movieflix.com']
          : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000
    });


    this.setupEventHandlers();
    this.setupRedisSubscriber();
  }


  private createHttpServer() {
    const port = Number(process.env.SOCKET_PORT) || 3001;
    return createServer().listen(port, '0.0.0.0', () => {
      console.log(`🚀 Socket.io server running on port ${port}`);
      console.log(`📱 Reachable at: http://localhost:${port}`);
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: CustomSocket) => {
      this.handleConnection(socket);

      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
    });
  }

  private async handleConnection(socket: CustomSocket): Promise<void> {
    console.log(`👤 User connected: ${socket.id}`);

    // Authentication middleware
    socket.on('authenticate', async (data: { token?: string }) => {
      try {
        const token = data?.token;
        if (!token) {
          socket.emit('authentication-error', { message: 'No token provided' });
          return;
        }

        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
          console.error('❌ NEXTAUTH_SECRET not configured on socket server');
          socket.emit('authentication-error', { message: 'Server configuration error' });
          return;
        }

        // Verify the JWT token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, secret) as any;

        if (!decoded?.userId) {
          socket.emit('authentication-error', { message: 'Invalid token payload' });
          return;
        }

        // Store user mapping
        this.userSockets.set(decoded.userId, socket.id);
        socket.userId = decoded.userId;
        socket.userName = decoded.name || decoded.email || 'User';

        socket.emit('authenticated', {
          success: true,
          user: { id: decoded.userId, name: socket.userName }
        });

        console.log(`✅ User authenticated via JWT: ${socket.userName} (${decoded.userId})`);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authentication-error', { message: 'Authentication failed' });
      }
    });

    // Join room
    socket.on('join-room', async (data) => {
      try {
        await this.handleJoinRoom(socket, data);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leave-room', async (data) => {
      try {
        await this.handleLeaveRoom(socket, data);
      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // WebRTC signaling
    socket.on('signaling', async (data: SignalingMessage) => {
      try {
        await this.handleSignaling(socket, data);
      } catch (error) {
        console.error('Signaling error:', error);
      }
    });

    // Chat messages
    socket.on('chat-message', async (data) => {
      try {
        await this.handleChatMessage(socket, data);
      } catch (error) {
        console.error('Chat message error:', error);
      }
    });

    // Player controls
    socket.on('play', async (data) => {
      try {
        await this.handlePlayerControl(socket, 'play', data);
      } catch (error) {
        console.error('Play control error:', error);
      }
    });

    socket.on('pause', async (data) => {
      try {
        await this.handlePlayerControl(socket, 'pause', data);
      } catch (error) {
        console.error('Pause control error:', error);
      }
    });

    socket.on('seek', async (data) => {
      try {
        await this.handlePlayerControl(socket, 'seek', data);
      } catch (error) {
        console.error('Seek control error:', error);
      }
    });

    socket.on('sync-progress', async (data) => {
      const { roomId, currentTime } = data;
      const participants = this.rooms.get(roomId) || [];
      const host = participants.find(p => p.isHost);
      
      if (host && host.socketId === socket.id) {
        socket.to(roomId).emit('progress-update', { currentTime, userId: socket.userId });
        
        // Update DB occasionally or just keep in memory
        await WatchPartyRoom.findOneAndUpdate({ roomId }, { currentTime }).catch(() => null);
      }
    });

    // Room management
    socket.on('create-room', async (data) => {
      try {
        await this.handleCreateRoom(socket, data);
      } catch (error) {
        console.error('Create room error:', error);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    socket.on('get-my-rooms', async () => {
      try {
        await this.handleGetMyRooms(socket);
      } catch (error) {
        console.error('Get my rooms error:', error);
        socket.emit('error', { message: 'Failed to get rooms' });
      }
    });

    socket.on('get-public-rooms', async () => {
      try {
        await this.handleGetPublicRooms(socket);
      } catch (error) {
        console.error('Get public rooms error:', error);
        socket.emit('error', { message: 'Failed to get public rooms' });
      }
    });
  }

  private setupRedisSubscriber(): void {
    const r = redis;
    if (!r) {
      console.warn('⚠️ Upstash Redis not configured, real-time notifications disabled');
      return;
    }

    console.log('📡 Notification Bridge: Initializing...');

    setInterval(async () => {
      try {
        const keys = await r.keys('sync:*:notification');
        if (!keys || keys.length === 0) return;

        for (const key of keys) {
          const data = await r.get<any>(key);
          if (data && typeof data === 'object') {
            const { userId, notification } = data;
            if (userId && notification) {
              this.sendNotificationToUser(userId, notification);
              await r.del(key);
            }
          }
        }
      } catch (err) {
        // Silent catch for polling errors
      }
    }, 2000);
  }

  private sendNotificationToUser(userId: string, notification: any): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('new-notification', notification);
      console.log(`🔔 Pushed real-time notification to user ${userId}`);
    }
  }

  private async handleJoinRoom(socket: CustomSocket, data: any): Promise<void> {
    const { roomId, userName, password } = data;

    // For E2E testing/Guest flow, allow join if userName is provided
    if (!socket.userId && userName) {
      socket.userId = `guest_${Math.random().toString(36).substring(7)}`;
      socket.userName = userName;
    }

    if (!socket.userId || !roomId || !userName) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    await connectDB();

    // Find or create room
    let room = await WatchPartyRoom.findOne({ roomId }).populate('hostId').catch(() => null);

    if (!room) {
      console.log(`ℹ️ Room ${roomId} not in DB, initializing in memory for Guest flow`);
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, []);
      }
    } else if (room.participants.length >= room.maxParticipants) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    // Check password if private
    if (room && room.isPrivate && room.password !== password) {
      socket.emit('error', { message: 'Incorrect password' });
      return;
    }

    // Add participant to room
    const participant: RoomParticipant = {
      userId: socket.userId,
      userName,
      socketId: socket.id,
      joinedAt: new Date(),
      isHost: room ? (room.hostId.toString() === socket.userId) : (this.rooms.get(roomId)?.length === 0),
      isMuted: false,
      isVideoOff: false
    };

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }

    const participants = this.rooms.get(roomId) || [];
    participants.push(participant);
    this.rooms.set(roomId, participants);

    // Join socket room
    socket.join(roomId);

    // Notify others that a new user joined
    socket.to(roomId).emit('user-joined', {
      userId: socket.userId,
      userName,
      socketId: socket.id,
      isHost: participant.isHost
    });

    // Update room in database if it exists
    if (room) {
      await WatchPartyRoom.findByIdAndUpdate(room._id, {
        $push: { participants: participant }
      });
    }

    // Send current room state to new participant
    socket.emit('room-joined', {
      roomId,
      participants: participants.map(p => ({
        userId: p.userId,
        userName: p.userName,
        isHost: p.isHost
      })),
      movieId: room?.movieId || "550",
      playState: room?.currentPlayState || 'paused',
      currentTime: room?.currentTime || 0
    });

    // Notify all participants of the updated state
    const host = participants.find(p => p.isHost);
    this.io.to(roomId).emit('room-state', {
      roomId,
      hostId: host?.socketId,
      participants: participants.map(pa => ({
        userId: pa.userId,
        userName: pa.userName,
        isHost: pa.isHost,
        socketId: pa.socketId
      }))
    });

    console.log(`👥 ${userName} joined room ${roomId}`);
  }

  private async handleLeaveRoom(socket: CustomSocket, data: any): Promise<void> {
    const { roomId } = data;

    if (!socket.userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    await connectDB();

    // Find room in database
    const room = await WatchPartyRoom.findOne({ roomId });
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const participants = this.rooms.get(roomId) || [];
    const leavingParticipant = participants.find(p => p.socketId === socket.id);

    if (!leavingParticipant) {
      socket.emit('error', { message: 'Not in room' });
      return;
    }

    // Remove participant from room
    const updatedParticipants = participants.filter(p => p.socketId !== socket.id);
    this.rooms.set(roomId, updatedParticipants);

    // Update room in database
    await WatchPartyRoom.findByIdAndUpdate(room._id, {
      $pull: { participants: { userId: leavingParticipant.userId } }
    });

    // Leave socket room
    socket.leave(roomId);

    // Notify remaining participants
    this.io.to(roomId).emit('room-state', {
      roomId,
      participants: updatedParticipants.map(pa => ({
        userId: pa.userId,
        userName: pa.userName,
        isHost: pa.isHost,
        socketId: pa.socketId
      }))
    });

    // Clean up if room is empty
    if (updatedParticipants.length === 0) {
      this.rooms.delete(roomId);
      // Optionally delete empty rooms from database
      await WatchPartyRoom.deleteOne({ roomId });
    }

    console.log(`👋 ${socket.userName} left room ${roomId}`);
  }

  private async handleSignaling(socket: CustomSocket, message: SignalingMessage): Promise<void> {
    const participants = this.rooms.get(message.data.roomId) || [];
    const targetParticipant = participants.find(p => p.userId === message.targetUserId);

    if (!targetParticipant) {
      socket.emit('error', { message: 'Target participant not found' });
      return;
    }

    // Relay signaling message to target participant
    this.io.to(targetParticipant.socketId).emit('signaling', {
      ...message,
      senderId: socket.userId,
      senderName: socket.userName
    });

    console.log(`🔄 Signaling: ${message.type} from ${socket.userName} to ${message.targetUserId}`);
  }

  private async handleChatMessage(socket: CustomSocket, data: any): Promise<void> {
    const { roomId, message } = data;
    const participants = this.rooms.get(roomId) || [];

    if (!socket.userId || !message) {
      socket.emit('error', { message: 'Invalid chat message' });
      return;
    }

    const chatMessage = {
      id: new Date().getTime().toString(),
      userId: socket.userId,
      userName: socket.userName,
      message,
      timestamp: new Date(),
      type: 'text'
    };

    // Save chat message to room if it exists in database
    await WatchPartyRoom.findOneAndUpdate(
      { roomId },
      {
        $push: { chatHistory: chatMessage }
      }
    ).catch(() => null);

    // Broadcast to all participants in the room
    this.io.to(roomId).emit('chat-message', chatMessage);

    console.log(`💬 ${socket.userName}: ${message}`);
  }

  private async handlePlayerControl(socket: CustomSocket, action: string, data: any): Promise<void> {
    const { roomId } = data;

    if (!socket.userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    // Only host can control playback
    const participants = this.rooms.get(roomId) || [];
    const hostParticipant = participants.find(p => p.isHost);
    const requestingParticipant = participants.find(p => p.socketId === socket.id);

    if (!hostParticipant || requestingParticipant?.userId !== hostParticipant?.userId) {
      socket.emit('error', { message: 'Only host can control playback' });
      return;
    }

    // Update room state
    let updateData: any = {};

    switch (action) {
      case 'play':
        updateData = { currentPlayState: 'playing', lastUpdated: new Date() };
        break;
      case 'pause':
        updateData = { currentPlayState: 'paused', lastUpdated: new Date() };
        break;
      case 'seek':
        updateData = { currentTime: data.time, lastUpdated: new Date() };
        break;
    }

    // Update room state in database if it exists
    await WatchPartyRoom.findOneAndUpdate(
      { roomId },
      updateData
    ).catch(() => null);

    // Broadcast to all participants
    this.io.to(roomId).emit('player-control', {
      action,
      data,
      userId: socket.userId,
      userName: socket.userName
    });

    console.log(`🎬 ${action} by ${socket.userName} in room ${roomId}`);
  }

  private async handleCreateRoom(socket: CustomSocket, data: any): Promise<void> {
    const { roomName, movieId, isPrivate = false, password = '', maxParticipants = 10 } = data;

    if (!socket.userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    await connectDB();

    // Generate unique room ID
    const roomId = this.generateRoomId();

    // Create room in database
    const room = await WatchPartyRoom.create({
      roomId,
      name: roomName,
      hostId: socket.userId,
      hostName: socket.userName,
      movieId,
      participants: [{
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id,
        joinedAt: new Date(),
        isHost: true,
        isMuted: false,
        isVideoOff: false
      }],
      isPrivate,
      password,
      maxParticipants,
      isActive: true,
      createdAt: new Date()
    });

    // Add to user's rooms
    await User.findByIdAndUpdate(socket.userId, {
      $push: { watchPartyRooms: room._id }
    });

    // Initialize room in memory
    this.rooms.set(roomId, room.participants);

    // Join host to room
    socket.join(roomId);

    socket.emit('room-created', {
      room: {
        id: roomId,
        name: roomName,
        movieId,
        isPrivate,
        maxParticipants,
        participantCount: 1,
        createdAt: room.createdAt
      }
    });

    console.log(`🏠 ${socket.userName} created room ${roomId}`);
  }

  private async handleGetMyRooms(socket: CustomSocket): Promise<void> {
    if (!socket.userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    await connectDB();

    const user = await User.findById(socket.userId).populate('watchPartyRooms');
    const rooms = await WatchPartyRoom.find({
      _id: { $in: user.watchPartyRooms },
      isActive: true
    }).populate('hostId');

    const roomDetails = rooms.map(room => ({
      id: room.roomId,
      name: room.name,
      movieId: room.movieId,
      participantCount: room.participants.length,
      maxParticipants: room.maxParticipants,
      isPrivate: room.isPrivate,
      createdAt: room.createdAt,
      hostName: room.hostName
    }));

    socket.emit('my-rooms', roomDetails);
  }

  private async handleGetPublicRooms(socket: CustomSocket): Promise<void> {
    await connectDB();

    const rooms = await WatchPartyRoom.find({
      isActive: true,
      isPrivate: false
    }).populate('hostId').limit(50);

    const roomDetails = rooms.map(room => ({
      id: room.roomId,
      name: room.name,
      movieId: room.movieId,
      participantCount: room.participants.length,
      maxParticipants: room.maxParticipants,
      hostName: room.hostName,
      createdAt: room.createdAt
    }));

    socket.emit('public-rooms', roomDetails);
  }

  private generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Handle disconnection
  private async handleDisconnection(socket: CustomSocket): Promise<void> {
    console.log(`👋 User disconnected: ${socket.id}`);

    // Find and remove user from all rooms
    for (const [roomId, participants] of this.rooms.entries()) {
      const participantIndex = participants.findIndex(p => p.socketId === socket.id);

      if (participantIndex !== -1) {
        participants.splice(participantIndex, 1);
        this.rooms.set(roomId, participants);

        // Update room in database
        await WatchPartyRoom.findOneAndUpdate(
          { roomId },
          {
            $pull: { participants: { userId: socket.userId } }
          }
        );

        // Notify remaining participants
        participants.forEach(p => {
          if (p.socketId !== socket.id) {
            this.io.to(p.socketId).emit('user-left', {
              socketId: socket.id,
              userId: socket.userId,
              userName: socket.userName
            });
          }
        });

        // Clean up empty rooms
        if (participants.length === 0) {
          this.rooms.delete(roomId);
          await WatchPartyRoom.deleteOne({ roomId });
        }

        break;
      }
    }

    // Clean up user mapping
    const customSocket = socket as CustomSocket;
    if (customSocket.userId) {
      this.userSockets.delete(customSocket.userId);
    }
  }

  // Graceful shutdown
  public shutdown(): void {
    console.log('🔄 Shutting down Socket.io server...');

    this.io.close(() => {
      console.log('✅ Socket.io server closed');
      mongoose.connection.close();
      process.exit(0);
    });
  }
}

// Start server
const server = new SocketServer();

// Handle graceful shutdown
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

export default server;
