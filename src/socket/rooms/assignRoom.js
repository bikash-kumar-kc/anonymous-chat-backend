import { redis } from '../../config/redis.js'

export async function assignRoom(socket, userId, roomId) {
  // add user to room set in Redis
  await redis.sadd(`room:${roomId}:users`, userId)

  // update user's roomId in Redis
  await redis.hset(`user:${userId}`, 'roomId', roomId);

  // join socket room
  socket.join(roomId);
}