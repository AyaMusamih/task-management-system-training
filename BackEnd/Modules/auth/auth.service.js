const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const { findUserByEmail } = require("../user/user.service");
const { generateAuthSession, hashToken } = require("./utils/auth.util");
const { verifyRefreshToken } = require("./utils/jwt.util");

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

const refresh = async (token) => {
  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    const err = new Error("Invalid Token");
    err.status = 401;
    throw err;
  }
  const tokenHash = hashToken(token);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!storedToken) {
    await prisma.refreshToken.deleteMany({
      where: { userId: BigInt(decoded.id) },
    });
    const err = new Error("Invalid Token");
    err.status = 401;
    throw err;
  }
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { tokenHash } });
    const err = new Error("Refresh token expired");
    err.status = 401;
    throw err;
  }
  await prisma.refreshToken.delete({ where: { tokenHash } });
  const user = await findUserByEmail(decoded.email);
  return await generateAuthSession(user);
};

const logout = async (token) => {
  const tokenHash = hashToken(token);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });
  if (!storedToken) {
    return;
  }

  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
};

module.exports = {
  login,
  registerUser,
  refresh,
  logout,
};
