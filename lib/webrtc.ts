/**
 * WebRTC implementation for video streaming in watch parties
 */

export interface PeerConnection {
  id: string;
  stream?: MediaStream;
  peer: RTCPeerConnection;
  connection?: any; // SimplePeer connection
}

export interface VideoStream {
  userId: string;
  stream: MediaStream;
  isScreenShare?: boolean;
  isAudioOnly?: boolean;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  videoConstraints: boolean | MediaTrackConstraints;
  audioConstraints: boolean | MediaTrackConstraints;
}

class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private screenStream: MediaStream | null = null;
  private onStreamCallbacks: ((stream: VideoStream) => void)[] = [];
  private onPeerCallbacks: ((peer: PeerConnection) => void)[] = [];

  constructor(private config: Partial<WebRTCConfig> = {}) {
    this.setupDefaultConfig();
  }

  private setupDefaultConfig() {
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      videoConstraints: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user'
      },
      audioConstraints: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      },
      ...this.config
    };
  }

  /**
   * Initialize local media stream (camera + microphone)
   */
  async initializeLocalStream(): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: typeof this.config.videoConstraints === 'boolean' ? true : this.config.videoConstraints,
        audio: typeof this.config.audioConstraints === 'boolean' ? true : this.config.audioConstraints
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Notify callbacks
      this.onStreamCallbacks.forEach(callback => {
        callback({
          userId: 'local',
          stream: this.localStream!,
          isAudioOnly: false
        });
      });

      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  /**
   * Initialize screen sharing
   */
  async initializeScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      } as MediaStreamConstraints);

      // Notify callbacks
      this.onStreamCallbacks.forEach(callback => {
        callback({
          userId: 'local-screen',
          stream: this.screenStream!,
          isScreenShare: true,
          isAudioOnly: false
        });
      });

      return this.screenStream;
    } catch (error) {
      console.error('Error accessing screen share:', error);
      throw new Error('Failed to access screen sharing');
    }
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;

      // Notify callbacks
      this.onStreamCallbacks.forEach(callback => {
        callback({
          userId: 'local-screen',
          stream: null as any,
          isScreenShare: true
        });
      });
    }
  }

  /**
   * Create peer connection for a remote user
   */
  createPeerConnection(userId: string, isInitiator: boolean = false): PeerConnection {
    try {
      const configuration = {
        iceServers: this.config.iceServers
      };

      const rtcPeerConnection = new RTCPeerConnection(configuration);
      
      const peerConnection: PeerConnection = {
        id: userId,
        peer: rtcPeerConnection,
        connection: null // Will be set when using SimplePeer
      };

      // Store peer connection
      this.peers.set(userId, peerConnection);

      // Setup event handlers
      this.setupPeerEvents(rtcPeerConnection, userId);

      // Notify callbacks
      this.onPeerCallbacks.forEach(callback => callback(peerConnection));

      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw new Error('Failed to create peer connection');
    }
  }

  /**
   * Setup peer connection event handlers
   */
  private setupPeerEvents(rtcPeer: RTCPeerConnection, userId: string) {
    // Handle ICE candidates
    rtcPeer.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer via signaling
        this.sendSignalingMessage(userId, {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    rtcPeer.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, rtcPeer.connectionState);
      
      if (rtcPeer.connectionState === 'connected') {
        console.log(`Successfully connected to ${userId}`);
      } else if (rtcPeer.connectionState === 'disconnected' || 
                 rtcPeer.connectionState === 'failed') {
        console.log(`Disconnected from ${userId}`);
        this.peers.delete(userId);
      }
    };

    // Handle remote streams
    rtcPeer.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onStreamCallbacks.forEach(callback => {
          callback({
            userId,
            stream: event.streams[0],
            isAudioOnly: !event.streams[0].getVideoTracks().length
          });
        });
      }
    };
  }

  /**
   * Create and send offer
   */
  async createOffer(userId: string): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) return;

    try {
      const offer = await peer.peer.createOffer();
      await peer.peer.setLocalDescription(offer);
      
      this.sendSignalingMessage(userId, {
        type: 'offer',
        offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  /**
   * Handle and create answer
   */
  async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) return;

    try {
      await peer.peer.setRemoteDescription(offer);
      const answer = await peer.peer.createAnswer();
      await peer.peer.setLocalDescription(answer);
      
      this.sendSignalingMessage(userId, {
        type: 'answer',
        answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  /**
   * Handle answer
   */
  async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) return;

    try {
      await peer.peer.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(userId: string, candidate: RTCIceCandidate): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) return;

    try {
      await peer.peer.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  /**
   * Add local stream to all peer connections
   */
  addLocalStreamToPeers(): void {
    if (!this.localStream) return;

    this.peers.forEach((peer) => {
      this.localStream!.getTracks().forEach(track => {
        peer.peer.addTrack(track, this.localStream!);
      });
    });
  }

  /**
   * Send signaling message (to be implemented with socket.io)
   */
  private sendSignalingMessage(userId: string, message: any): void {
    // This will be implemented with socket.io
    console.log('Sending signaling message to', userId, message);
    // socket.emit('signaling', { targetUserId: userId, message });
  }

  /**
   * Close all peer connections
   */
  closeAllConnections(): void {
    this.peers.forEach((peerConnection) => {
      peerConnection.peer.close();
    });
    this.peers.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): { totalConnections: number; activeConnections: number } {
    const total = this.peers.size;
    const active = Array.from(this.peers.values()).filter(
      peer => peer.peer.connectionState === 'connected'
    ).length;

    return { totalConnections: total, activeConnections: active };
  }

  /**
   * Subscribe to stream events
   */
  onStream(callback: (stream: VideoStream) => void): () => void {
    this.onStreamCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.onStreamCallbacks.indexOf(callback);
      if (index > -1) {
        this.onStreamCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to peer events
   */
  onPeer(callback: (peer: PeerConnection) => void): () => void {
    this.onPeerCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.onPeerCallbacks.indexOf(callback);
      if (index > -1) {
        this.onPeerCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Check WebRTC support
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && 
              typeof navigator.mediaDevices.getUserMedia === 'function' && 
              typeof RTCPeerConnection !== 'undefined');
  }

  /**
   * Get available media devices
   */
  async getAvailableDevices(): Promise<{ video: MediaDeviceInfo[]; audio: MediaDeviceInfo[] }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');

      return { video: videoDevices, audio: audioDevices };
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return { video: [], audio: [] };
    }
  }
}

export default WebRTCManager;
