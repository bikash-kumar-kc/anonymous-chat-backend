import { redis } from "../../config/redis.js";
import { db } from "../../config/db.js";
import { haversine } from "../../utils/haversine.js";
import { leaveRoom } from "../rooms/leaveRoom.js";
import { findOrCreateRoom } from "../rooms/findOrCreate.js";
import { assignRoom } from "../rooms/assignRoom.js";
import { getRoomById } from "../../db/queries/rooms.js";

// debounce map per userId
const reassignTimeouts = new Map();

export async function onLocationUpdate(io, socket, { lat, lng }) {
  try {
    const { userId } = socket;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    

    // debounce — wait 10s before acting on location change
    if (reassignTimeouts.has(userId)) {
      clearTimeout(reassignTimeouts.get(userId));
    };

    reassignTimeouts.set(
      userId,
      setTimeout(async () => {
        await handleLocationUpdate(
          io,
          socket,
          userId,
          parseFloat(lat),
          parseFloat(lng),
        );
        reassignTimeouts.delete(userId);
      }, 10000),
    );
  } catch (err) {
    console.error("onLocationUpdate error:", err);
  }
}

async function handleLocationUpdate(io, socket, userId, lat, lng) {
  const user = await redis.hgetall(`user:${userId}`);
  if (!user || !user.roomId) return;

  // get room center
  const room = await getRoomById(user.roomId);
  if (!room) return;

  const distance = haversine(
    { lat, lng },
    { lat: room.centerLat, lng: room.centerLng },
  );

  if (distance > 5) {
    // moved out of range
    await leaveRoom(io, userId, user.roomId);
    socket.leave(user.roomId);

    // find or create room near new location
    const newRoomId = await findOrCreateRoom(lat, lng);
    await assignRoom(socket, userId, newRoomId);

    // update location in Redis
    await redis.hset(`user:${userId}`, { lat, lng, lastSeen: Date.now() });

    socket.emit("room_reassigned", {
      message: "You have been moved to a nearby room",
      roomId: newRoomId,
    });
  } else {
    // still in range — just update location
    await redis.hset(`user:${userId}`, { lat, lng, lastSeen: Date.now() });
  }
}
