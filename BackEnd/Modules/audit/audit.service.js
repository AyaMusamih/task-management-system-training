const prisma = require("../prismaClient");
const normalizeId = (id) => (typeof id === "bigint" ? id : BigInt(id));

const getTicketAuditLog = async (ticketId) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: normalizeId(ticketId) },
  });

  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  const logs = await prisma.auditLog.findMany({
    where: { ticketId: normalizeId(ticketId) },
    orderBy: { createdAt: "asc" },
    select: {
      id:        true,
      action:    true,
      actorRole: true,
      oldValue:  true,
      newValue:  true,
      createdAt: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  
  return logs.map((log) => ({
    ...log,
    id:   log.id.toString(),
    user: { ...log.user, id: log.user.id.toString() },
  }));
};

module.exports = { getTicketAuditLog };