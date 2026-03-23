import { redis } from '../../config/redis.js'

export async function onHeartbeat(socket) {
  try {
    const { userId } = socket
    if (!userId) return

    await redis.hset(`user:${userId}`, 'lastSeen', Date.now())
    socket.emit('heartbeat_ack');

  } catch (err) {
    console.error('onHeartbeat error:', err)
  }
}