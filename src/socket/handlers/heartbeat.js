import { redis } from '../../config/redis.js'

export async function onHeartbeat(socket) {
  try {
    const { userId } = socket
    if (!userId) return

    await redis.hset(`user:${userId}`, 'lastSeen', Date.now());
    await redis.expire(`user:${userId}`, 2 * 60 * 60)
    socket.emit('heartbeat_ack');

  } catch {
    void 0;
  }
};


