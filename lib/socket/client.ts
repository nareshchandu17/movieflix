import { io } from "socket.io-client";

// Initialize socket connection
// Point directly to the standalone Socket.io server we built for dev
// Use 127.0.0.1 explicitly to avoid IPv6 resolution issues on some systems
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://127.0.0.1:3001";

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"], // Allow both, prioritize websocket
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
