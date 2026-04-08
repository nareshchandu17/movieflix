import { io } from "socket.io-client";

// Initialize socket connection
// Point directly to the standalone Socket.io server we built for dev
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const socket = io(URL, {
  autoConnect: false, // Don't connect until needed
});
