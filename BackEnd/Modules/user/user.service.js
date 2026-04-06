const { bigint } = require("zod");
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

const getUsers = async ({ page, limit }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {
    role: "USER",
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total, page: Number(page), limit: Number(limit) };
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) {
    const err = new Error("User Not Found");
    err.status = 404;
    throw err;
  }
  return user;
};

const updateProfile = async (userId, data) => {
  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;

  const currentUser = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
  if (data.email && data.email !== currentUser.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const error = new Error("This email is already taken by another account");
      error.status = 409;
      throw error;
    }
  }

  const updated = await prisma.user.update({
    where: { id: BigInt(userId) },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return updated;
};

module.exports = {
  findUserByEmail,
  findUserById,
  changePassword,
  getUsers,
  getProfile,
  updateProfile,
};
