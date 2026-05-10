import { redis } from "../../config/redis.js";
import { deactivateRoom } from "../../db/queries/rooms.js";

export async function leaveRoom(io, userId, roomId) {
  if (!roomId) return;

  await redis.srem(`room:${roomId}:users`, userId);

  io.to(roomId).emit("user_left", {
    message: "A user has left the area",
  });

  const remaining = await redis.scard(`room:${roomId}:users`);
  if (remaining === 0) {
    await deactivateRoom(roomId);
  }
}
