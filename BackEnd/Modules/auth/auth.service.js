const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { findUserByEmail } = require("../user/user.service");
const { signAccessToken, signRefreshToken } = require("./utils/jwt.utils");


const registerUser = async (name, email, hashedPassword) => {
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return {
    ...newUser,
    id: newUser.id.toString(),
  };
};
module.exports = {
  findUserByEmail,
  registerUser,
};
