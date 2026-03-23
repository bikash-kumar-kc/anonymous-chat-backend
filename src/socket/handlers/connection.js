import { v4 as uuidv4 } from "uuid";
import { redis } from "../../config/redis.js";
import { generateDisplayName } from "../../utils/nameGenerator.js";
import { clearExpiredStrikes } from "../../utils/strikes.js";
import { findOrCreateRoom } from "../rooms/findOrCreate.js";
import { assignRoom } from "../rooms/assignRoom.js";

export async function onConnection(io, socket) {
  try {
    const lat = socket.lat;
    const lng = socket.lng;

    // validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      socket.emit("error", { message: "Invalid coordinates" });
      socket.disconnect();
      return;
    }

    // generate anonymous identity
    const userId = uuidv4();
    const displayName = generateDisplayName();

    // store session in Redis with 2hr TTL
    await redis.hset(`user:${userId}`, {
      userId,
      displayName,
      hashedIp: socket.hashedIp,
      lat,
      lng,
      roomId: "",
      socketId: socket.id,
      lastSeen: Date.now(),
      strikes: 0,
      status: "active",
    });

    await redis.expire(`user:${userId}`, 2 * 60 * 60);

    // attach to socket for use in other handlers
    socket.userId = userId;
    socket.displayName = displayName;

    // clean any expired strikes from previous sessions
    await clearExpiredStrikes(userId);

    // find existing room or create new one
    const roomId = await findOrCreateRoom(parseFloat(lat), parseFloat(lng));

    // assign user to room
    await assignRoom(socket, userId, roomId);

    // notify user they are connected
    socket.emit("connected", {
      userId,
      displayName,
      roomId,
    });

    // notify room a new user joined
    socket.to(roomId).emit("user_joined", {
      message: `${displayName} has joined the area`,
    });

    console.log(`✅ ${displayName} connected → room ${roomId}`);
  } catch (err) {
    console.error("onConnection error:", err);
    socket.emit("error", { message: "Failed to connect" });
    socket.disconnect();
  }
}
