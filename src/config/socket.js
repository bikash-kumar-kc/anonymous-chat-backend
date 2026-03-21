import { Server } from "socket.io";
import "dotenv/config";
import { registerHandlers } from "../socket/index.js";
import { socketAuthMiddleware } from "../middleware/socketAuth.js";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
    // kick client if no heartbeat for 2 minutes
    pingTimeout: 120000,
    pingInterval: 30000,
  });

  // auth middleware runs before every connection
  io.use(socketAuthMiddleware);

  // register all socket event handlers
  io.on("connection", (socket) => {
    registerHandlers(io, socket);
  });

  return io;
}

// workers use this to emit to rooms
export function getIo() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

export { io };
