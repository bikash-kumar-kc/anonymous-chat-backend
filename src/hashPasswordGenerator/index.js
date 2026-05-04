import bcrypt from "bcryptjs";

const generateHash = async (password) => {
  if (!password || !password.trim()) {
    console.log(`
            no error
            `);
    return;
  }

  const hash = await bcrypt.hash(password, 12);

  console.log(`
   password:${password} hash password is: ${hash}`);

  return;
};

generateHash("lonelyKumar@anonymouschat")
