import { redis } from '../../config/redis.js'
import { leaveRoom } from '../rooms/leaveRoom.js'

export async function onDisconnect(io, socket) {
  try {
    const { userId } = socket
    if (!userId) return

    const user = await redis.hgetall(`user:${userId}`);
    if (!user) return

    console.log(`❌ ${user.displayName} disconnected`)

  } catch (err) {
    console.error('onDisconnect error:', err)
  }
}