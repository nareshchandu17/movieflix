export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { spawn } = require('child_process');
    console.log("🚀 Initializing MovieFlix Background Services...");
    
    // Background workers removed in favor of direct Upstash execution

    if (process.env.NODE_ENV === 'development') {
      try {
        // Use the production-ready socket server which supports notifications
        const socketServer = spawn('npx', ['ts-node', 'server/socket-server.ts'], {
          stdio: 'inherit',
          shell: true,
          detached: false,
        });

        socketServer.on('error', (err: any) => {
          console.error('❌ Failed to start background Socket.io server:', err);
        });

        console.log("📡 Background Socket.io Server (3001) starting...");
      } catch (error) {
        console.error("❌ Error spawning socket server:", error);
      }
    }
  }
}
