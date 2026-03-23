import { Worker } from 'bullmq'
import OpenAI from 'openai'
import { redis } from '../../config/redis.js'
import { deletionQueue, strikeQueue, notificationQueue } from '../index.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// categories we care about
const FLAGGED_CATEGORIES = [
  'harassment',
  'harassment/threatening',
  'hate',
  'hate/threatening',
  'self-harm',
  'sexual',
  'violence'
];

export function startModerationWorker() {
  return new Worker('moderation', async (job) => {
    const { messageId, content, userId, roomId, socketId, hashedIp } = job.data;

    // call OpenAI moderation
    const response = await openai.moderations.create({ input: content });
    const result = response.results[0];

    if (!result.flagged) return // clean → do nothing;

    // check which categories were flagged
    const flaggedCategories = FLAGGED_CATEGORIES.filter(
      (cat) => result.categories[cat] === true
    );

    console.log(`⚠️ Message ${messageId} flagged: ${flaggedCategories.join(', ')}`);

    // trigger downstream queues in parallel
    await Promise.all([
      deletionQueue.add('delete', { messageId, roomId }),
      strikeQueue.add('strike', { userId, hashedIp }),
      notificationQueue.add('notify', {
        userId,
        socketId,
        type: 'message_flagged',
        messageId
      })
    ])

  }, {
    connection: redis,
    concurrency: 10 // process 10 moderation jobs at a time
  })
}