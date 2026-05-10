import { logger } from "../config/logger.js";

export const socketLogger = (socket, next) => {
  try {
    logger.info({
      type: "SOCKET_CONNECT",
      socketId: socket.id,
      hashedIp: socket.hashedIp,
      lng: socket.lng,
      lat: socket.lat,
    });

    socket.onAny((event) => {
      logger.info({
        type: "SOCKET_EVENT",
        event,
        socketId: socket.id,
        userId: socket.userId,
        hashedIp: socket.hashedIp,
        roomId: socket.roomId,
        displayName: socket.displayName,
      });
    });

    socket.on("disconnect", (reason) => {
      const date = new Date();

      logger.info({
        type: "SOCKET_DISCONNECT",
        socketId: socket.id,
        userId: socket.userId,
        roomId: socket.roomId,
        date,
        reason,
      });
    });
    next();
  } catch (error) {
    next(error);
  }
};
