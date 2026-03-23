import { Worker } from 'bullmq'
import { redis } from '../../config/redis.js'
import { handleStrike } from '../../utils/strikes.js'
import { notificationQueue } from '../index.js'

export function startStrikeWorker() {
  return new Worker('strike', async (job) => {
    const { userId, hashedIp } = job.data;

    const user = await redis.hgetall(`user:${userId}`);
    if (!user) return

    const result = await handleStrike(userId, hashedIp)

    if (result.action === 'none') return

    if (result.action === 'warn') {
      await notificationQueue.add('notify', {
        userId,
        socketId: user.socketId,
        type: 'warning',
        message: `Final warning — one more violation in 24 hours will get you banned`
      })
    }

    if (result.action === 'banned_temp') {
      await notificationQueue.add('notify', {
        userId,
        socketId: user.socketId,
        type: 'banned_temp',
        message: 'You have been banned for 24 hours due to repeated violations'
      })
    }

    if (result.action === 'banned_permanent') {
      await notificationQueue.add('notify', {
        userId,
        socketId: user.socketId,
        type: 'banned_permanent',
        message: 'You have been permanently banned'
      })
    }

  }, {
    connection: redis,
    concurrency: 5
  })
}