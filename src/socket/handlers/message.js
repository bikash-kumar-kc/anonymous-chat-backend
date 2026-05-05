import { redis } from "../../config/redis.js";
import { moderationQueue } from "../../queues/index.js";
import leoProfanity from "leo-profanity";
import { insertMessage } from "../../db/queries/messages.js";

// load default dictionary on startup
leoProfanity.loadDictionary();

export async function onMessage(io, socket, { content, roomId }) {
  try {
    const { userId, displayName } = socket;

    // 1. basic validation
    if (!content || typeof content !== "string") {
      console.log("no content !");
      return;
    }
    if (!roomId) {
      console.log("no roomId");
      return;
    }

    const trimmed = content.trim();
    console.log("got messaged: ", trimmed);
    if (trimmed.length === 0 || trimmed.length > 500) {
      socket.emit("message_rejected", { reason: "Invalid message length" });
      return;
    }

    // 2. membership check
    const isMember = await redis.sismember(`room:${roomId}:users`, userId);
    let setTimeOutActivated;
    if (!isMember) {
      clearTimeout(setTimeOutActivated);
      io.to(roomId).emit("disconnect", {
        reason: "io server disconnect",
        msg: "userId is missing !!!",
      });
      setTimeOutActivated = setTimeout(() => {
        socket.disconnect();
      }, 2000);
      return;
    }

    // 3. sync bad-words check (fast, ~1ms)
    if (leoProfanity.check(trimmed)) {
      socket.emit("message_rejected", {
        reason: "Message contains inappropriate language",
      });
      return;
    }

    const { id: messageId, sentAt } = await insertMessage(
      roomId,
      userId,
      trimmed,
      displayName,
    );

    // 5. broadcast immediately (optimistic)
    io.to(roomId).emit("message", {
      messageId,
      displayName,
      userId,
      content: trimmed,
      timestamp: sentAt,
    });

    // 6. push to moderation queue async
    await moderationQueue.add("moderate", {
      messageId,
      content: trimmed,
      userId,
      roomId,
      socketId: socket.id,
      hashedIp: socket.hashedIp,
    });
  } catch (err) {
    console.error("onMessage error:", err);
  }
}
