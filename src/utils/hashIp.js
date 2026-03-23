import crypto from "crypto";

export function hashIp(rawIp) {
  // const salt = crypto.randomBytes(16).toString("hex");
  const hashedIp = crypto
    .createHmac("sha256", process.env.IP_SALT)
    .update(rawIp)
    .digest("hex");

  if (!hashedIp) {
    throw new Error("Failed to hash IP");
  }

  return { hashedIp };
}
