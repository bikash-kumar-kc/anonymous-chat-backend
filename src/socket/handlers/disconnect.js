import { redis } from "../../config/redis.js";
import { leaveRoom } from "../rooms/leaveRoom.js";

export async function onDisconnect(io, socket) {
  try {
    const { userId, roomId } = socket;
    if (!userId) return;

   
    await leaveRoom(io,userId,roomId);
    await redis.hset(`user:${userId}`, "roomId", "");

  } catch {
    void 0;
  }
}
