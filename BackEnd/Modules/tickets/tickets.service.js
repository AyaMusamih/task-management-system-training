const prisma = require("../prismaClient");
const {startOfDay, endOfDay} = require("../reports/utils/report.utils")

const getTickets = async (filters) => {
  const {
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
    sprintId,
  } = filters;
  const user_id = BigInt(user.id);
  const where = {};
  const resolvedSortBy = sortBy || (deletedOnly ? "deletedAt" : "deadline");

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
    where.deletedAt = null;
  } else {
    if (assignee) where.assigneeId = BigInt(assignee);
  }
  if (sprintId) {
    where.sprintId = BigInt(sprintId);
  }
  else if (view === "sprint") {
    where.sprintId = { not: null };
  }
  const statusList = Array.isArray(status) ? status : null;
  if (view === "scoped" && !status) where.status = "SCOPED_BACKLOG";
  if (statusList?.length) {
    where.status = { in: statusList };
  } else if (status) {
    where.status = status;
  }
  if (priority) where.priority = priority;
if ((startDate || endDate) && filters.deletedOnly) {
  where.deletedAt = {};
  if (startDate) where.deletedAt.gte = startOfDay(startDate);
  if (endDate) where.deletedAt.lte = endOfDay(endDate);
} else if (startDate || endDate) {
  where.deadline = {};
  if (startDate) where.deadline.gte = startOfDay(startDate);
  if (endDate) where.deadline.lte = endOfDay(endDate);
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
      orderBy: { [resolvedSortBy]: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        deadline: true,
        deletedAt: true,
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

const getTicketById = async (id, user) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      deadline: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      assigneeId: true,
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      sprint: { select: { id: true, name: true } },
    },
  });

  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  if (user.role !== "ADMIN") {
    if (ticket.deletedAt) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const userId = BigInt(user.id);
    const isAssignedToUser = ticket.assigneeId?.toString() === userId.toString();
    const isScopedBacklog = ticket.status === "SCOPED_BACKLOG";
    const isSprintTicket = ticket.sprint?.id != null;

    if (!isAssignedToUser || (!isScopedBacklog && !isSprintTicket)) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
  }

  return {
    items: [ticket],
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

const cleanupExpiredTickets = async () => {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 30);

  const result = await prisma.ticket.deleteMany({
    where: {
      deletedAt: {
        not: null,
        lt: cutoff,
      },
    },
  });

  console.log(`[Cleanup] Permanently deleted ${result.count} expired tickets.`);
  return result;
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  restoreTicket,
  deletePermanent,
  deleteAllPermanent,
  cleanupExpiredTickets
};
