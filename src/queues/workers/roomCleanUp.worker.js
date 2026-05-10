import { Worker } from "bullmq";
import { db } from "../../config/db.js";
import { messages, rooms } from "../../db/schema.js";
import { and, eq, lt } from "drizzle-orm";
import { redis } from "../../config/redis.js";
import { getIo } from "../../config/socket.js";

const ROOM_MAX_AGE = 2 * 60 * 60 * 1000;

export const startRoomCleanupWorker = () => {
  return new Worker(
    "room-cleanup",
    async (_job) => {
      const cutoffTime = new Date(Date.now() - ROOM_MAX_AGE);
      let cleanedRooms = 0;
      let failedRooms = 0;

      try {
        const oldRooms = await db
          .select()
          .from(rooms)
          .where(
            and(eq(rooms.isActive, true), lt(rooms.createdAt, cutoffTime)),
          );

        if (!oldRooms.length) {
          return { cleanedRooms, notifiedUsers: 0 };
        }

        for (const room of oldRooms) {
          try {
            await cleanupSingleRoom(room);
            cleanedRooms++;
          } catch (error) {
            void error;
            failedRooms++;
          }
        }
      } catch (error) {
        void error;
      }

      return { cleanedRooms, failedRooms:failedRooms };
    },
    {
      connection: redis,
      concurrency: 1,
    },
  );
};

async function cleanupSingleRoom(room) {
  const roomId = room.id;

  try {
    // removing all user information on this room...
    const users = await redis.smembers(`room:${roomId}:users`);
    for (const userId of users) {
      await redis.del(`user:${userId}`);
    }
    // removing users from the this room
    await redis.del(`room:${roomId}:users`);

    // deleting all messages of that room...
    await db.delete(messages).where(eq(messages.roomId, roomId));

    const io = getIo();

    io.to(roomId).emit("room-deleted", {
      msg: `roomId: ${roomId} is deleted. Please re-connect again!`,
    });

    const sockets = await io.in(roomId).fetchSockets();

    for (const socket of sockets) {
      socket.leave(roomId);
    }

    // deleting room finally ...

    await db.delete(rooms).where(eq(rooms.id, roomId));
    return true;
  } catch (error) {
    void error;
  }
}
