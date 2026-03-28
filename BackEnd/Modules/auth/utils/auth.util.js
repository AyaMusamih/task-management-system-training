const prisma = require("../../prismaClient");
const crypto = require("crypto");
const { signAccessToken, signRefreshToken } = require("./jwt.util");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const saveRefreshToken = async (userId, tokenHash) => {
  return await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
};
const generateAuthSession = async (user) => {
  const payload = {
    id: user.id.toString(),
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await saveRefreshToken(user.id, hashToken(refreshToken));
  
  return { accessToken, refreshToken };
};
module.exports = {
    hashToken,
    generateAuthSession,
    saveRefreshToken
}
