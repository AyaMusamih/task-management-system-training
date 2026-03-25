const { getTicketFlags } = require("../tickets/utils/ticket-premissions.util");
const prisma = require("../prismaClient");

const checkUpdatePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const ticket = await prisma.ticket.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, assigneeId: true },
    });

    if (!ticket) return res.status(404).json({ message: "Ticket Not Found" });

    const { canUpdateStatus } = getTicketFlags(ticket, user);

    if (!canUpdateStatus) {
      return res.status(403).json({
        message: "You can only update status for tickets assgined to you",
      });
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
