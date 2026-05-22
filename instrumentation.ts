export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { spawn } = require('child_process');
    console.log("🚀 Initializing MovieFlix Background Services...");
    
    // Background workers removed in favor of direct Upstash execution

    if (process.env.NODE_ENV === 'development') {
      console.log("📡 Real-time services routed via serverless Pusher Channels.");
    }
  }
}
