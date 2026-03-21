// import { hashIp } from '../utils/hashIp.js'
import { isBlacklisted, checkConnectionRate } from '../utils/blacklist.js'
import { redis } from '../config/redis.js'

export async function socketAuthMiddleware(socket, next) {
  try {
    const { sessionToken } = socket.handshake.auth

    if (!sessionToken) {
      return next(new Error('MISSING_TOKEN'))
    }

    // validate token from Redis
    const raw = await redis.get(`session_token:${sessionToken}`)
    if (!raw) {
      return next(new Error('INVALID_TOKEN'))
    }

    const { lat, lng, hashedIp } = JSON.parse(raw)

    // delete token immediately — single use only
    await redis.del(`session_token:${sessionToken}`)

    // bot detection
    const isBot = await checkConnectionRate(hashedIp)
    if (isBot) {
      return next(new Error('CONNECTION_REFUSED'))
    }

    // blacklist check
    const { blacklisted, type } = await isBlacklisted(hashedIp)
    if (blacklisted) {
      const err = new Error('CONNECTION_REFUSED')
      err.data = { type }
      return next(err)
    }

    // attach to socket for handlers
    socket.hashedIp = hashedIp
    socket.lat = lat
    socket.lng = lng

    next()

  } catch (err) {
    console.error('socketAuthMiddleware error:', err)
    next(new Error('INTERNAL_ERROR'))
  }
}