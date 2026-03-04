const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const { findUserByEmail } = require("../user/user.service");
const { generateAuthSession } = require("./utils/auth.util");

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
      role: true,
    },
  });
  const { accessToken, refreshToken } = await generateAuthSession(newUser);

  return {
    user: {
      ...newUser,
      id: newUser.id.toString(),
    },
    accessToken,
    refreshToken,
  };
};

const login = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error("Invalid Email or Password");
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const err = new Error("Invalid Email or Password");
    err.status = 401;
    throw err;
  }

  const { accessToken, refreshToken } = await generateAuthSession(user);

  return {
    user: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

module.exports = {
  login,
  registerUser,
};
