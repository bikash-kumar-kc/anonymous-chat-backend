import { Worker } from 'bullmq'
import { redis } from '../../config/redis.js'
import { leaveRoom } from '../../socket/rooms/leaveRoom.js'
import { getIo } from '../../config/socket.js'

const GHOST_THRESHOLD = 2 * 60 * 1000      // 2 minutes → suspected ghost
const DEFINITE_THRESHOLD = 5 * 60 * 1000   // 5 minutes → definite ghost

export function startGhostCleanupWorker() {
  return new Worker('ghost-cleanup', async () => {
    const io = getIo()
    const now = Date.now()

    // get all user keys
    const userKeys = await redis.keys('user:*')
    if (!userKeys.length) return

    for (const key of userKeys) {
      const user = await redis.hgetall(key)
      if (!user || !user.lastSeen || !user.userId) continue

      const timeSince = now - parseInt(user.lastSeen)

      if (timeSince >= DEFINITE_THRESHOLD) {
        // definite ghost → clean up
        console.log(`👻 Removing ghost user: ${user.displayName}`)

        if (user.roomId) {
          await leaveRoom(io, user.userId, user.roomId)
        }

        await redis.del(key)
        await redis.del(`strikes:${user.userId}`)

      } else if (timeSince >= GHOST_THRESHOLD) {
        // suspected ghost → mark it
        await redis.hset(key, 'status', 'suspected_ghost')
      }
    }

  }, {
    connection: redis,
    concurrency: 1 // run cleanup one at a time
  })
}