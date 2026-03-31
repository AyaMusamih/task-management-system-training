const prisma = require("../prismaClient");

const create = async (payload) => {
  return await prisma.sprint.create({
    data: {
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      createdAt: new Date(),
      isActive: calculateIsActive(payload.startDate, payload.endDate),
    },
  });
};

const update = async (id, data) => {
  const currentSprint = await prisma.sprint.findUnique({
    where: { id },
    select: { startDate: true, endDate: true },
  });

  if (!currentSprint) {
    const err = new Error("Sprint not found");
    err.status = 404;
    throw err;
  }
  const newStart = data.startDate || currentSprint.startDate;
  const newEnd = data.endDate || currentSprint.endDate;

  if (newStart >= newEnd) {
    const err = new Error("start Date should be before end date");
    err.status = 422;
    throw err;
  }

  const isActive = calculateIsActive(newStart, newEnd);

  return await prisma.sprint.update({
    where: { id },
    data: {
      ...data,
      isActive,
    },
  });
};

const findAll = async (page, limit, user) => {
  let where = {};

  if (user.role !== "ADMIN") {
    where = {
      tickets: {
        some: {
          assigneeId: BigInt(user.id),
          deletedAt: null,
        },
      },
    };
  }
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.sprint.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
        _count: {
          select: { tickets: { where: { deletedAt: null } } },
        },
      },
    }),
    prisma.sprint.count({where}),
  ]);

  return {
    items,
    paginationMeta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

const findOne = async (id, user) => {

  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      tickets: {
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          assigneeId: true, 
          assignee: { select: { id: true, name: true } }
        }
      },
      _count: {
        select: { tickets: { where: { deletedAt: null } } }
      }
    }
  });
  if (!sprint) {
    const err = new Error("Sprint not found");
    err.status = 404;
    throw err;
  }
  if (user.role !== "ADMIN") {
    const isAssigned = sprint.tickets.some(t => t.assigneeId === BigInt(user.id));

    if (!isAssigned) {
      const err = new Error("Access Denied: You are not assigned to any tickets in this sprint.");
      err.status = 403;
      throw err;
    }
    sprint.tickets = sprint.tickets.filter(t => t.assigneeId === BigInt(user.id));
  }

  return sprint;
};

const remove = async (id) => {

  const sprint = await prisma.sprint.findUnique({
    where: { id },
  });

  if (!sprint) {
    const err = new Error("Sprint not found");
    err.status = 404;
    throw err;
  }
  return await prisma.sprint.delete({
    where: { id },
  });
};

const calculateIsActive = (start, end) => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  return now >= startDate && now <= endDate;
};

module.exports = {
  create,
  update,
  findAll,
  findOne,
  remove
};
