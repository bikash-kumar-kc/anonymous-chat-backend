import { Worker } from 'bullmq'
import { redis } from '../../config/redis.js'
import { getIo } from '../../config/socket.js'

export function startNotificationWorker() {
  return new Worker('notification', async (job) => {
    const { userId, socketId, type, message, messageId } = job.data

    const io = getIo();

    // find socket by id
    const socket = io.sockets.sockets.get(socketId);

    if (!socket) return // user already disconnected, skip silently

    if (type === 'message_flagged') {
      const strikes = parseInt(await redis.hget(`user:${userId}`, 'strikes')) || 0
      socket.emit('message_flagged', {
        messageId,
        warning: 'Your message was removed for violating community guidelines',
        strikesRemaining: Math.max(0, 3 - strikes)
      })
      return
    }

    if (type === 'warning') {
      socket.emit('warned', { message })
      return
    }

    if (type === 'banned_temp') {
      socket.emit('banned', { message, type: 'temporary' })
      socket.disconnect();
      return
    }

    if (type === 'banned_permanent') {
      socket.emit('banned', { message, type: 'permanent' })
      socket.disconnect()
      return
    }

  }, {
    connection: redis,
    concurrency: 10
  })
}