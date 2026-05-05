import { redis } from '../../config/redis.js'
import { MAX_USER_KNOW_TIME } from '../../constants/ttl-constants.js';

export async function assignRoom(socket, userId, roomId) {
  // add user to room set in Redis
  await redis.sadd(`room:${roomId}:users`, userId)
  await redis.expires(`room:${roomId}:users`,MAX_USER_KNOW_TIME);

  // update user's roomId in Redis
  await redis.hset(`user:${userId}`, 'roomId', roomId);

  // join socket room
  socket.join(roomId);
}