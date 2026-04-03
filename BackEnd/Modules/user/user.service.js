const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: BigInt(id) },
  });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: { id: true, passwordHash: true },
  });

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    const err = new Error("Invalid current password");
    err.status = 401;
    throw err;
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });
};

module.exports = { findUserByEmail, findUserById, changePassword };
