import Redis from 'ioredis'
import 'dotenv/config'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASS || undefined,
  maxRetriesPerRequest: null // required for BullMQ
});



export async function connectRedis() {
  // test connection on startup
  await redis.ping()
}

export { redis }