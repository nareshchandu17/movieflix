import { defineConfig } from "cypress";

// Socket.io has been migrated to Pusher real-time communication.
// Kept cypress config skeleton for backward compatibility.
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      let eventHistory: unknown[] = [];

      on("task", {
        async socketAction(data: any) {

          if (data.type === "join") {
            return { status: "connected", id: "mock-pusher-cypress-id" };
          }
          if (data.type === "chat" || data.type === "emit-event" || data.type === "disconnect") {
            return { status: "success" };
          }
          if (data.type === "get-history") {
            return [];
          }
          return null;
        },
      });
    },
  },
});
