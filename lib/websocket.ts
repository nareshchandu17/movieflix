import { Server as ServerIO, Socket } from 'socket.io';
import { createServer } from 'http';
import RedisManager from './redis';
import { AuthManager } from './auth-v2';

interface ClientInfo {
  socketId: string;
  userId: string;
  profileId: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  userAgent: string;
  ip: string;
  isOnline(): boolean;
}

interface SyncData {
  type: string;
  data: any;
  timestamp: number;
  source: string;
  deviceId?: string;
}

export class WebSocketManager {
  private io: ServerIO | null = null;
  private connectedClients: Map<string, ClientInfo> = new Map();
  private profileRooms: Map<string, Set<string>> = new Map();

  async initialize(port: number = 3001): Promise<void> {
    if (this.io) {
      console.log('🔌 WebSocket server already running');
      return;
    }

    try {
      const httpServer = createServer();
      this.io = new ServerIO(httpServer, {
        cors: {
          origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000", "http://localhost:3001"],
          methods: ["GET", "POST"],
          credentials: true
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true
      });

      // Authentication middleware
      this.io.use(async (socket: Socket, next: (err?: Error) => void) => {
        const token = socket.handshake.auth?.token;
        
        if (!token) {
          next(new Error('Authentication required'));
          return;
        }

        try {
          const decoded = AuthManager.verifyToken(token);
          if (!decoded) {
            next(new Error('Invalid token'));
            return;
          }

          if (!decoded.profileId) {
            next(new Error('Profile selection required'));
            return;
          }

          // Get device info from handshake data
          const deviceInfo: ClientInfo = {
            socketId: socket.id,
            userId: decoded.userId,
            profileId: decoded.profileId,
            deviceId: decoded.deviceId || 'unknown',
            deviceName: decoded.profileName || 'Unknown Device',
            deviceType: decoded.deviceType || 'web',
            userAgent: socket.handshake.headers['user-agent'] || 'Unknown',
            ip: socket.handshake.address || 'unknown',
            isOnline: () => true
          };

          // Add to connected clients
          this.connectedClients.set(socket.id, deviceInfo);
          
          // Join profile room
          this.joinProfileRoom(deviceInfo.profileId, socket.id);
          
          // Store socket reference in user session
          await RedisManager.setSession(
            deviceInfo.userId,
            deviceInfo.deviceId,
            {
              socketId: socket.id,
              connectedAt: Date.now(),
              lastPing: Date.now()
            }
          );

          // Extend socket interface
          (socket as any).userId = decoded.userId;
          (socket as any).profileId = decoded.profileId;
          (socket as any).deviceId = decoded.deviceId;
          
          next();
        } catch (error) {
          console.error('WebSocket auth error:', error);
          next(error);
        }
      });

      // Connection handling
      this.io.on('connection', (socket: Socket) => {
        const clientInfo = this.connectedClients.get(socket.id);
        
        console.log(`🔌 Client connected: ${clientInfo?.deviceName} (${clientInfo?.deviceType})`);
        
        socket.on('disconnect', async () => {
          const info = this.connectedClients.get(socket.id);
          if (info) {
            this.connectedClients.delete(socket.id);
            await RedisManager.updateDeviceStatus(info.deviceId, 'offline');
            
            // Leave profile room
            if (info.profileId) {
              this.leaveProfileRoom(info.profileId, socket.id);
            }
            
            console.log(`🔌 Client disconnected: ${info.deviceName}`);
          }
        });

        socket.on('error', (error: Error) => {
          console.error('WebSocket error:', error);
        });
      });

      console.log('🚀 WebSocket server initialized on port', port);
      
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket server:', error);
      throw error;
    }
  }

  private joinProfileRoom(profileId: string, socketId: string): void {
    if (!this.profileRooms.has(profileId)) {
      this.profileRooms.set(profileId, new Set());
    }
    
    const room = this.profileRooms.get(profileId);
    if (room) {
      room.add(socketId);
      
      const socket = this.io?.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(`profile:${profileId}`);
        const clientInfo = this.connectedClients.get(socketId);
        this.io?.to(`profile:${profileId}`).emit('device:connected', {
          socketId,
          deviceName: clientInfo?.deviceName || 'Unknown Device'
        });
      }
    }
  }

  private leaveProfileRoom(profileId: string, socketId: string): void {
    const room = this.profileRooms.get(profileId);
    if (room) {
      room.delete(socketId);
      const socket = this.io?.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(`profile:${profileId}`);
      }
      
      const clientInfo = this.connectedClients.get(socketId);
      this.io?.to(`profile:${profileId}`).emit('device:disconnected', {
        socketId,
        deviceName: clientInfo?.deviceName || 'Unknown Device'
      });
    }
  }

  // Emit sync event to all devices of a profile
  async emitToProfile(profileId: string, event: string, data: any): Promise<void> {
    if (!this.io) return;
    
    const syncData: SyncData = {
      type: event,
      data,
      timestamp: Date.now(),
      source: 'server'
    };

    // Store in Redis for persistence
    await RedisManager.emitSyncEvent(profileId, event, syncData);
    
    // Emit to all clients in profile room
    this.io.to(`profile:${profileId}`).emit(event, syncData);
  }

  // Emit sync event to specific device
  async emitToDevice(deviceId: string, event: string, data: any): Promise<void> {
    if (!this.io) return;
    
    // Find socket by deviceId
    let targetSocketId: string | null = null;
    for (const [socketId, clientInfo] of this.connectedClients.entries()) {
      if (clientInfo.deviceId === deviceId) {
        targetSocketId = socketId;
        break;
      }
    }
    
    if (!targetSocketId) return;
    
    const clientInfo = this.connectedClients.get(targetSocketId);
    if (!clientInfo) return;
    
    const syncData: SyncData = {
      type: event,
      data,
      timestamp: Date.now(),
      source: 'server',
      deviceId
    };

    // Store in Redis for persistence
    await RedisManager.emitSyncEvent(clientInfo.profileId, `device:${event}`, syncData);
    
    // Emit to specific device
    this.io.to(targetSocketId).emit(event, syncData);
  }

  // Get connected devices for a profile
  getConnectedDevices(profileId: string): Array<ClientInfo> {
    const devices: Array<ClientInfo> = [];
    
    for (const [socketId, clientInfo] of this.connectedClients.entries()) {
      if (clientInfo.profileId === profileId && clientInfo.isOnline()) {
        devices.push(clientInfo);
      }
    }
    
    return devices;
  }

  // Get all connected clients
  getAllConnectedClients(): Array<ClientInfo> {
    return Array.from(this.connectedClients.values());
  }

  // Get profile room members
  getProfileRoomMembers(profileId: string): Array<string> {
    const room = this.profileRooms.get(profileId);
    return room ? Array.from(room) : [];
  }

  // Disconnect all devices for a profile
  async disconnectProfileDevices(profileId: string): Promise<void> {
    const room = this.profileRooms.get(profileId);
    if (room) {
      const socketIds = Array.from(room);
      
      // Disconnect all sockets
      socketIds.forEach(socketId => {
        const socket = this.io?.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      });
      
      // Clear room
      this.profileRooms.delete(profileId);
      
      // Clear Redis sessions
      const patterns = [
        `session:${profileId}:*`
      ];
      
      for (const pattern of patterns) {
        try {
          await RedisManager.del(pattern);
        } catch (error) {
          console.error(`Failed to delete pattern ${pattern}:`, error);
        }
      }
      
      console.log(`📱 Disconnected ${socketIds.length} devices for profile ${profileId}`);
    }
  }

  // Broadcast message to all clients
  broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Get server statistics
  getStats(): any {
    if (!this.io) return null;
    
    return {
      connected: this.io.sockets.sockets.size,
      rooms: this.io.sockets.adapter.rooms.size,
      clients: this.connectedClients.size,
      profileRooms: this.profileRooms.size
    };
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    if (this.io) {
      await this.io.close();
      this.io = null;
      this.connectedClients.clear();
      this.profileRooms.clear();
      console.log('🔌 WebSocket server shutdown');
    }
  }

  // Helper method to get client by socket ID
  getClientBySocketId(socketId: string): ClientInfo | null {
    return this.connectedClients.get(socketId) || null;
  }
}

export default WebSocketManager;
