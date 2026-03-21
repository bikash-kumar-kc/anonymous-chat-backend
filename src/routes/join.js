import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { redis } from '../config/redis.js'
import { hashIp } from '../utils/hashIp.js'
import { isBlacklisted } from '../utils/blacklist.js'

export const joinRouter = Router()

joinRouter.post('/join', async (req, res) => {
  try {
    const { lat, lng } = req.body

    // validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid coordinates' })
    }

    const parsedLat = parseFloat(lat)
    const parsedLng = parseFloat(lng)

    // validate coordinate ranges
    if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({ error: 'Coordinates out of range' })
    }

    // get and hash IP
    const rawIp =
      req.headers['x-forwarded-for']?.split(',')[0].trim()
      || req.socket.remoteAddress

    const hashedIp = hashIp(rawIp)

    // blacklist check before issuing token
    const { blacklisted, type } = await isBlacklisted(hashedIp)
    if (blacklisted) {
      return res.status(403).json({
        error: type === 'permanent'
          ? 'You are permanently banned'
          : 'You are temporarily banned. Try again later.'
      })
    }

    // generate a short-lived session token
    // this is passed as socket handshake auth
    const sessionToken = uuidv4()

    // store token in Redis with 60 second TTL
    // socket must connect within 60 seconds or token expires
    await redis.set(
      `session_token:${sessionToken}`,
      JSON.stringify({ lat: parsedLat, lng: parsedLng, hashedIp }),
      'EX', 60
    )

    return res.status(200).json({ sessionToken })

  } catch (err) {
    console.error('POST /join error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})