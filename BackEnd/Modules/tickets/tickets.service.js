const prisma = require("../prismaClient");

const getTickets = async (
  user,
  view,
  status,
  assignee,
  priority,
  startDate,
  endDate,
  page,
  limit,
  sortBy,
  search,
  deletedOnly,
  includeDeleted,
) => {
  const user_id = BigInt(user.id);
  const where = {};

  if (deletedOnly && user.role === "ADMIN") {
    where.deletedAt = { not: null };
  } else if (!includeDeleted && user.role === "ADMIN") {
    where.deletedAt = null;
  }

  if (user.role !== "ADMIN") {
    where.OR = [
      { sprintId: { not: null }, assigneeId: user_id },
      { status: "SCOPED_BACKLOG", assigneeId: user_id },
    ];
    where.deletedAt = null
  } else {
    if (assignee) where.assigneeId = BigInt(assignee);
  }
  if (view === "sprint") {
    where.sprintId = { not: null };
 
  }
  if (view === "scoped" && !status) where.status = "SCOPED_BACKLOG";
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }
  if (search) {
    where.title = {
      contains: search,
    };
  }

  const skip = (page - 1) * limit;
  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        sprint: { select: { id: true, name: true } },
      },
    }),
    prisma.ticket.count({ where }),
  ]);
  return {
    items: tickets,
    paginationMeta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const createTicket = async (payload, userId) => {
  const { sprintId, assigneeId, ...details } = payload;
  return await prisma.ticket.create({
    data: {
      ...details,
      createdBy: {
        connect: {
          id: BigInt(userId),
        },
      },
      assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
      sprint: sprintId ? { connect: { id: sprintId } } : undefined,
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

const updateTicket = async (id, payload) => {
  const { assigneeId, sprintId, ...data } = payload;

  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  if (assigneeId === null) {
    data.assignee = { disconnect: true };
  } else if (assigneeId) {
    data.assignee = { connect: { id: assigneeId } };
  }

  if (sprintId === null) {
    data.sprint = { disconnect: true };
  } else if (sprintId) {
    data.sprint = { connect: { id: sprintId } };
  }
  return await prisma.ticket.update({
    where: { id },
    data: data,
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

const updateTicketStatus = async (id, status, ticket, userRole) => {
  if (ticket.status === status) {
    const err = new Error("Ticket is already in this status");
    err.status = 400;
    throw err;
  }

  if (userRole !== "ADMIN") {
    const allowed = {
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["DONE"],
    };

    if (!allowed[ticket.status]?.includes(status)) {
      const err = new Error(
        `Cannot transition from ${ticket.status} to ${status}`,
      );
      err.status = 409;
      throw err;
    }
  }
  return await prisma.ticket.update({
    where: { id: BigInt(id) },
    data: { status },
  });
};

const deleteTicket = async (id) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: BigInt(id) } });
  
  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  if (ticket.deletedAt) {
    const err = new Error("Ticket already deleted");
    err.status = 400;
    throw err;
  }

  return await prisma.ticket.update({
    where: { id: BigInt(id) },
    data: { deletedAt: new Date() },
  });
};

const restoreTicket = async (id) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: BigInt(id) } });

  if (!ticket || !ticket.deletedAt) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  return await prisma.ticket.update({
    where: { id: BigInt(id) },
    data: { deletedAt: null },
  });
};

const deletePermanent = async (id) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: BigInt(id) } });

  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  if (!ticket.deletedAt) {
    const err = new Error("Ticket is not deleted");
    err.status = 400;
    throw err;
  }

  return await prisma.ticket.delete({
    where: { id: BigInt(id) },
  });
};

const deleteAllPermanent = async () => {
  const result = await prisma.ticket.deleteMany({
    where: {
      deletedAt: { not: null },
    },
  });
  console.log(result);
  return result; 
};

module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  restoreTicket,
  deletePermanent,
  deleteAllPermanent
};
