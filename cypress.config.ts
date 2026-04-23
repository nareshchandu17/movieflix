import { defineConfig } from "cypress";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";
let virtualSockets = new Map();

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      let eventHistory: any[] = [];

      on("task", {
        async socketAction(data: any) {
          const key = `${data.roomId}_${data.userName}`;

          if (data.type === "join") {
            if (virtualSockets.has(key)) return { status: "already_connected" };

            return new Promise((resolve, reject) => {
              const socket = io(SOCKET_URL, {
                transports: ["websocket"],
                reconnection: false,
              });
              const timeout = setTimeout(() => reject("Socket connection timeout"), 5000);

              socket.on("connect", () => {
                clearTimeout(timeout);
                socket.emit("join-room", { roomId: data.roomId, userName: data.userName });
                
                socket.on("chat-message", (msg: any) => {
                  eventHistory.push({ type: "chat", data: msg });
                });
                socket.on("play", () => {
                  eventHistory.push({ type: "play" });
                });
                socket.on("pause", () => {
                  eventHistory.push({ type: "pause" });
                });

                virtualSockets.set(key, socket);
                resolve({ status: "connected", id: socket.id });
              });

              socket.on("connect_error", (err) => {
                clearTimeout(timeout);
                reject(err.message);
              });
            });
          }

          if (data.type === "chat") {
            const socket = virtualSockets.get(key);
            if (socket) {
              socket.emit("chat-message", { 
                roomId: data.roomId, 
                message: data.message,
                userName: data.userName
              });
              return { status: "sent" };
            }
            return { status: "not_found" };
          }

          if (data.type === "emit-event") {
             const socket = virtualSockets.get(key);
             if (socket) {
               socket.emit(data.event, { roomId: data.roomId });
               return { status: "emitted" };
             }
             return { status: "not_found" };
          }

          if (data.type === "disconnect") {
            const socket = virtualSockets.get(key);
            if (socket) {
              socket.disconnect();
              virtualSockets.delete(key);
              return { status: "disconnected" };
            }
            return { status: "not_found" };
          }

          if (data.type === "get-history") {
            const history = [...eventHistory];
            eventHistory = [];
            return history;
          }

          return null;
        },
      });
    },
  },
});
