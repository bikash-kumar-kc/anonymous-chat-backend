import { redis } from '../config/redis.js'
import { blacklistIp, tempBlacklistIp } from './blacklist.js'

const STRIKE_WINDOW = 24 * 60 * 60 * 1000 // 24 hours
export const MAX_STRIKES = 3
const STRIKE_CLEANUP = 48*60*60;

export async function addStrike(userId,hashedIp) {
  const now = Date.now();
  const key = `strikes:${hashedIp}`;

  await redis.zadd(key, now, `strike:${now}`);
  await redis.expire(key, STRIKE_CLEANUP) // auto clean after 48hr inactivity

  return await getRecentStrikeCount(userId)
}

export async function getRecentStrikeCount(userId) {
  const windowStart = Date.now() - STRIKE_WINDOW;
  return await redis.zcount(`strikes:${userId}`, windowStart, '+inf')
}

export async function clearExpiredStrikes(userId) {
  const windowStart = Date.now() - STRIKE_WINDOW
  await redis.zremrangebyscore(`strikes:${userId}`, 0, windowStart)
};

export async function resetStrikes(userId) {
  await redis.del(`strikes:${userId}`)
};

// handle full strike logic including ban decision
export async function handleStrike(userId, hashedIp) {
  const recentStrikes = await addStrike(userId,hashedIp);

  if (recentStrikes === 2) {
    return { action: 'warn', strikesRemaining: 1 }
  };

  if (recentStrikes >= MAX_STRIKES) {
    const banCount = parseInt(await redis.get(`bancount:${hashedIp}`)) || 0

    if (banCount >= 2) {
      await blacklistIp(hashedIp);
      await resetStrikes(hashedIp);
      return { action: 'banned_permanent' }
    } else {
      await tempBlacklistIp(hashedIp, 24 * 60 * 60);
      await redis.incr(`bancount:${hashedIp}`);
      await redis.expire(`bancount:${hashedIp}`, 30 * 24 * 60 * 60) // remember 30 days
      await resetStrikes(hashedIp);
      return { action: 'banned_temp' }
    }
  }

  return { action: 'none', strikesRemaining: MAX_STRIKES - recentStrikes }
};