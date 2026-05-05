import { redis } from '../config/redis.js'

// permanent ban
export async function blacklistIp(hashedIp) {
  await redis.sadd('blacklist:ip', hashedIp)
};

// temporary ban
export async function tempBlacklistIp(hashedIp, durationSeconds) {
  const expiresAt = Date.now() + durationSeconds * 1000
  await redis.zadd('blacklist:ip:temp', expiresAt, hashedIp)
}

// check both permanent + temp
export async function isBlacklisted(hashedIp) {
  // check permanent
  const permanent = await redis.sismember('blacklist:ip', hashedIp)
  if (permanent) return { blacklisted: true, type: 'permanent' }

  // clean expired temp bans first
  await redis.zremrangebyscore('blacklist:ip:temp', 0, Date.now());

  // check temp
  const temp = await redis.zscore('blacklist:ip:temp', hashedIp)
  if (temp) return { blacklisted: true, type: 'temporary' }

  return { blacklisted: false }
}

// bot detection — too many connections in short window
export async function checkConnectionRate(hashedIp) {
  const key = `connrate:${hashedIp}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, 60) // 60 second window
  }

  if (attempts > 10) {
    await tempBlacklistIp(hashedIp, 60 * 60) // 1 hour ban
    return true
  }

  return false;
}