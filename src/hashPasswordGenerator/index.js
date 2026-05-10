import bcrypt from "bcryptjs";

export const generateHash = async (password) => {
  if (!password || !password.trim()) {
    return;
  }

  await bcrypt.hash(password, 12);

  return;
};

