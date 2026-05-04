import crypto from "crypto";

export function hashIp(rawIp,id) {
  // const salt = crypto.randomBytes(16).toString("hex");
  const modifiedIp = rawIp+id;
  const hashedIp = crypto
    .createHmac("sha256", process.env.IP_SALT)
    .update(modifiedIp)
    .digest("hex");

  if (!hashedIp) {
    throw new Error("Failed to hash IP");
  }

  return { hashedIp };
}
