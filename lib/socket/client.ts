import { io } from "socket.io-client";

// Initialize socket connection
// Use the same host but ensure it works both locally and in production (if deployed custom)
const URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const socket = io(URL, {
  autoConnect: false, // Don't connect until needed
});
