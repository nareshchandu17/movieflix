import { spawn } from 'child_process';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log("🚀 Initializing MovieFlix Background Services...");
    
    // 1. Start Notification Worker
    try {
      await import('@/lib/queue/workers/notificationWorker');
      console.log("✅ Notification Worker activated.");
    } catch (error) {
      console.error("❌ Failed to initialize background workers:", error);
    }

    // 2. Start Standalone WebSocket Server (Port 3001)
    // Only attempt to start in a non-production environment or if explicitly requested
    if (process.env.NODE_ENV === 'development') {
      try {
        // Use a simple guard to avoid multiple spawns during HMR if possible
        // Note: NEXT_RUNTIME='nodejs' instrumentation runs once on server start
        const socketServer = spawn('node', ['websocket-server.js'], {
          stdio: 'inherit',
          shell: true,
          detached: false, // Tie to parent process
        });

        socketServer.on('error', (err) => {
          console.error('❌ Failed to start background Socket.io server:', err);
        });

        console.log("📡 Background Socket.io Server (3001) starting...");
      } catch (error) {
        console.error("❌ Error spawning socket server:", error);
      }
    }
  }
}
