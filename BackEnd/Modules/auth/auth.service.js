const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const { findUserByEmail } = require("../user/user.service");
const { generateAuthSession, hashToken } = require("./utils/auth.util");
const { verifyRefreshToken } = require("./utils/jwt.util");
const userService = require("../user/user.service");
const { sendResetEmail } = require("./utils/emialHandler.util");
const crypto = require("crypto");

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

const forgotPassword = async (email) => {
  const user = await userService.findUserByEmail(email);
  if (!user) {
    return;
  }
  const rawToken = crypto.randomBytes(32).toString("hex");
  if (process.env.NODE_ENV === "dev") {
    console.log(`reset token: ${rawToken}`);
  }
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const created = await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashedToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });
  try {
    await sendResetEmail(email, rawToken);
  } catch (error) {
    await prisma.passwordResetToken.delete({ where: { id: created.id } });
    const err = new Error(
      "There is an error sending reset email, Please try again later",
    );
    err.status = 500;
    throw err;
  }
};

  const resetPassword = async (rawToken, newPassword) => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const token = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash: hashedToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) {
      const err = new Error("Invalid or expired password reset token");
      err.status = 400;
      throw err;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: token.userId },
        data: { passwordHash: newPasswordHash },
      });
      await tx.passwordResetToken.deleteMany({ where: { id: token.id } });
      await tx.refreshToken.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
  };


module.exports = {
  login,
  registerUser,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
