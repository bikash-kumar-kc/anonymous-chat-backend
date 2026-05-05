import { Queue } from 'bullmq'
import { redis } from '../config/redis.js'

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  },
  removeOnComplete: 100, // keep last 100 completed jobs
  removeOnFail: 200      // keep last 200 failed jobs
};

export const moderationQueue = new Queue('moderation', {
  connection: redis,
  defaultJobOptions
})

export const deletionQueue = new Queue('deletion', {
  connection: redis,
  defaultJobOptions
})

export const strikeQueue = new Queue('strike', {
  connection: redis,
  defaultJobOptions
})

export const notificationQueue = new Queue('notification', {
  connection: redis,
  defaultJobOptions
})

export const ghostCleanupQueue = new Queue('ghost-cleanup', {
  connection: redis,
  defaultJobOptions
});