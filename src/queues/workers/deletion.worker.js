import { Worker } from 'bullmq'
import { redis } from '../../config/redis.js'
import { deleteMessage } from '../../db/queries/messages.js'
import { getIo } from '../../config/socket.js'

export function startDeletionWorker() {
  return new Worker('deletion', async (job) => {
    const { messageId, roomId } = job.data

    // mark deleted in Postgres
    await deleteMessage(messageId)

    // tell room to remove message from UI
    const io = getIo();
    io.to(roomId).emit('message_deleted', { messageId })

  }, {
    connection: redis,
    concurrency: 5
  })
}