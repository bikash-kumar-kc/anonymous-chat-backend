// Admin Router Controller

import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { blacklist, rooms } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";
import { redis } from "../config/redis.js";
import { getIo } from "../config/socket.js";
import bcrypt from "bcryptjs";

export const handleAdminLogin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    const valid = bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!valid) {
      console.error(`Invalid password!!!`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        username,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JST_EXPIRES_IN },
    );

    console.log(`token: ${token}`);
    res.cookie("jwtToken", token, {
      maxAge: 1000 * 60 * 60 * 2,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(201).json({ token: token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error:
        process.env.ENVIRONMENT === "production"
          ? "server error !!!"
          : "failed to generate token !!",
    });
  }
};

export const getActiveRooms = async (req, res, next) => {
  try {
    const activeRooms = await db
      .select()
      .from(rooms)
      .where(eq(rooms.isActive, true))
      .orderBy(desc(rooms.createdAt));

    const enriched = await Promise.all(
      activeRooms.map(async (room) => {
        const userCount = await redis.scard(`room:${room.id}:users`);
        const userIds = await redis.smembers(`room:${room.id}:users`);

        const users = await Promise.all(
          userIds.map(async (uid) => {
            const user = await redis.hgetall(`user:${uid}`);
            return {
              userId: uid,
              displayName: user?.displayName || "unknown",
              joinedAt: user?.lastSeen,
            };
          }),
        );

        return {
          ...room,
          liveUserCount: userCount,
          liveUsers: users,
        };
      }),
    );

    return res.status(200).json({ rooms: enriched });
  } catch (error) {
    console.error("GET /admin/rooms error:", error);
    return next(error);
  }
};

export const deactivateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res.status(401).json({ error: "Room id is required !!!" });
    }

    await db.update(rooms).set({ isActive: false }).where(eq(rooms.id, id));

    const userIds = await redis.smembers(`room:${id}:users`);

    const io = getIo();
    io.to(id).emit("room_closed", {
      message: "This room has been closed by an admin .Try reconnect.",
    });

    io.in(id).disconnectSockets(); // to disconnect all socect from room

    for (const uid of userIds) {
      await redis.del(`user:${uid}`);
    }

    await redis.del(`room:${id}:users`);

    return res.json({ msg: `room id: ${id} deactivated successfully!` });
  } catch (err) {
    console.error("DELETE /admin/rooms/:id error:", err);
    next(err);
  }
};

export const getBlackListedIps = async (req, res, next) => {
  try {
    const permanent = await db.select().from(blacklist);

    await redis.zremrangebyscore("blacklist:ip:temp", 0, Date.now());
    const tempBans = await redis.zrangebyscore(
      "blacklist:ip:temp",
      Date.now(),
      "+inf",
      "WITHSCORES",
    );

    const temp = [];

    for (let i = 0; i < tempBans.length; i += 2) {
      temp.push({
        hashedIp: tempBans[i],
        expiredAt: new Date(parseInt(tempBans[i + 1])).toISOString(),
      });
    }

    return res.json({ permanent, temp });
  } catch (error) {
    console.error("GET /admin/blacklist error:", error);
    next(error);
  }
};

export const handleBlackListIp = async (req, res, next) => {
  const { hashedIp, type, reason } = req.body;

  try {
    if (!hashedIp) {
      return res.status(400).json({ error: "rawIp" });
    }

    if (type === "temporary") {
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      await redis.zadd("blacklist:ip:temp", expiresAt, hashedIp);
    } else {
      await redis.sadd("blacklist:ip", hashedIp);
      await db
        .insert(blacklist)
        .values({
          hashedIp,
          type: "permanent",
          reason: reason || "Manual ban by admin",
        })
        .onConflictDoNothing();
    }

    return res.json({ msg: `hashedIp:${hashedIp} got blacklist !!!` });
  } catch (error) {
    console.error("POST /admin/blacklist error:", error);
    next(error);
  }
};

export const removeBlackListIp = async (req, res, next) => {
  try {
    const { hashedIp } = req.params;

    await redis.srem("blacklist:ip", hashedIp);
    await redis.zrem("blacklist:ip:temp", hashedIp);
    await db.delete(blacklist).where(eq(blacklist.hashedIp, hashedIp));

    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE /admin/blacklist error:", error);
    next(error);
  }
};

export const getActiveUsers = async (req, res, next) => {
  try {
    const userKeys = await redis.keys("user:*");

    if (!userKeys.length) {
      console.log("No users in the application !!!");
      return res.json({ users: [], total: 0 });
    }

    const users = await Promise.all(
      userKeys.map(async (key) => {
        const user = await redis.hgetall(key);
        if (!user || !user.userId) return null;

        return {
          userId: user.userId,
          displayName: user.displayName,
          roomId: user.roomId,
        };
      }),
    );

    return res.status(200).json({ users });
  } catch (error) {
    console.error("GET /admin/users error:", error);
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await redis.hgetall(`user:${userId}`);

    if (!user || !user.userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const allStikes = await redis.zrangebyscore(
      `strikes:${userId}`,
      "-inf",
      "+inf",
      "WITHSCORES",
    );

    const strikeHistory = [];

    for (let i = 0; i < allStikes.length; i += 2) {
      strikeHistory.push({
        strikeId: allStikes[i],
        timeStamp: new Date(parseInt(allStikes[i + 1])).toISOString(),
      });
    }

    const banCount = parseInt(
      (await redis.get(`bancount:${user.hashedIp}`)) || 0,
    );

    return res.json({
      userId: user.userId,
      displayName: user.displayName,
      hashedIp: user.hashedIp,
      roomId: user.roomId || null,
      socketId: user.socketId,
      location: {
        lat: parseFloat(user.lat) || null,
        lng: parseFloat(user.lng) || null,
      },

      status: user.status,
      lastSeen: new Date(parseInt(user.lastSeen)).toISOString(),
      moderation: {
        strikeHistory,
        totalStrikes: strikeHistory.length,
        banCount,
      },
    });
  } catch (error) {
    console.error("GET /admin/users/:userId error:", error);
    next(error);
  }
};

export const removeUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await redis.hgetall(`user:${userId}`);

    if (!user || !user.userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const io = getIo();

    const socket = io.sockets.sockets.get(user.socketId);
    if (socket) {
      socket.emit("kicked", { message: "You have been removed by an admin" });
      setTimeout(() => {
        socket.disconnect();
      }, 1000);
    }

    if (user.roomId) {
      await redis.srem(`room:${user.roomId}:users`, userId);
      io.to(user.roomId).emit("user_left", {
        message: " A user has left the area",
      });
    }

    await redis.del(`user:${userId}`);

    return res.json({ msg: `User with userId : ${userId} is removed` });
  } catch (error) {
    console.error('DELETE /admin/users/:userId error:', error)
    next(error);
  }
};
