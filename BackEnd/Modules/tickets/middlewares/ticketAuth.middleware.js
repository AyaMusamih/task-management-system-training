const { getTicketFlags } = require("../utils/ticket-premissions.util");
const prisma = require("../../prismaClient");

const checkUpdatePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const ticket = await prisma.ticket.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, assigneeId: true, status: true },
    });

    if (!ticket) {
      const err = new Error("Ticket Not Found");
      err.status = 404;
      return next(err);
    }

    const { canUpdateStatus } = getTicketFlags(ticket, user);

    if (!canUpdateStatus) {
     const err = new Error("You can only update status for tickets assgined to you");
     err.status = 403;
     return next(err)
    }
    req.ticket = ticket;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkUpdatePermission,
};
