import { redis } from "../config/redis.js";

export const isUserAlreadyExist = async (hashedIp) => {
  if (!hashedIp) {
    console.log(`hashed ip is missing`);
    return;
  }

  const userId = await redis.get(`userHashedIp:${hashedIp}`);

  if (!userId) {
    return false;
  }

  const isUserInfo = await redis.exists(`user:${userId}`);

  if (isUserInfo.roomId) {
    return true;
  }

  return false;
};
