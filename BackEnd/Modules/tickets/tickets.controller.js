const ticketService = require("./tickets.service");
const { attachPermissionFlags } = require("./utils/ticket-premissions.util");

const getTickets = async (req, res, next) => {
  try {
    const {
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
    } = req.query;

    const result = await ticketService.getTickets(
      req.user,
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
    );
    const resultWithFlags = attachPermissionFlags(result, req.user);

    res.status(200).json({
      success: true,
      ...resultWithFlags,
    });
  } catch (error) {
    next(error);
  }
};

const addTicket = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      deadline,
      assigneeId,
      sprintId,
    } = req.body;
    const payload = {
      title,
      description,
      status,
      priority,
      deadline: deadline ? new Date(deadline) : null,
      assigneeId: assigneeId ?? null,
      sprintId: sprintId ?? null,
    };

    const newTicket = await ticketService.createTicket(payload, req.user.id)
    res.status(201).json({
      message: "Ticket created successfully",
      data: newTicket,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTickets,
  addTicket,
};
