import { redis } from "../config/redis.js";

export const isUserAlreadyExist = async (hashedIp) => {
  if (!hashedIp) {
    return;
  }

  const userId = await redis.get(`userHashedIp:${hashedIp}`);

  if (!userId) {
    return false;
  }

  const isUserInfo = await redis.exists(`user:${userId}`);

  if (isUserInfo) {
   return true;
  }

  return false;
};
