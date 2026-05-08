import { v4 as uuidv4 } from "uuid";
import { redis } from "../../config/redis.js";
import { generateDisplayName } from "../../utils/nameGenerator.js";
import { clearExpiredStrikes } from "../../utils/strikes.js";
import { findOrCreateRoom } from "../rooms/findOrCreate.js";
import { assignRoom } from "../rooms/assignRoom.js";
import { isUserAlreadyExist } from "../../utils/isUserAlreadyExist.js";
import { MAX_USER_KNOW_TIME } from "../../constants/ttl-constants.js";

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

    // user returned within two hrs;
    const isExists = await isUserAlreadyExist(socket.hashedIp);

    if (!isExists) {
      // generate anonymous identity
      const userId = uuidv4();
      const displayName = generateDisplayName();

      await redis.set(`userHashedIp:${socket.hashedIp}`, userId);
      await redis.expire(`userHashedIp:${socket.hashedIp}`, MAX_USER_KNOW_TIME);

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

      await redis.expire(`user:${userId}`, MAX_USER_KNOW_TIME);
    }

    const userId = await redis.get(`userHashedIp:${socket.hashedIp}`);

    const values = await redis.hmget(`user:${userId}`, [
      "userId",
      "displayName",
    ]);

    // attach to socket for use in other handlers
    socket.userId = values[0];
    socket.displayName = values[1];

    // find existing room or create new one
    const roomId = await findOrCreateRoom(parseFloat(lat), parseFloat(lng));

    if (!isExists) {
      // assign user to room
      await assignRoom(socket, userId, roomId);
    } else {
      await redis.sadd(`room:${roomId}:users`, userId) 
      await redis.hset(`user:${userId}`, "roomId", roomId);
      socket.join(roomId);
    }

    // notify user they are connected
    socket.emit("connected", {
      userId: values[0],
      displayName: values[1],
      roomId,
    });

    // notify room a new user joined
    socket.to(roomId).emit("user_joined", {
      message: `${values[1]} has joined the area`,
    });

    console.log(` ${values[1]} connected → room ${roomId}`);
  } catch (err) {
    console.error("onConnection error:", err);
    socket.emit("error", { message: "Failed to connect" });
    socket.disconnect();
  }
}
