import crypto from 'crypto'

export function hashIp(rawIp) {
  return crypto
    .createHmac('sha256', process.env.IP_SALT)
    .update(rawIp)
    .digest('hex')
}