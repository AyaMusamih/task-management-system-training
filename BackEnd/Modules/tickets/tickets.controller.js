const { success } = require("zod");
const ticketService = require("./tickets.service");
const { attachPermissionFlags } = require("./utils/ticket-permissions.util");

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
      deletedOnly,
      includeDeleted,
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
      deletedOnly,
      includeDeleted,
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
      assigneeId,
      sprintId,
    };

    const newTicket = await ticketService.createTicket(payload, req.user.id);
    res.status(201).json({
      success: true,
      data: newTicket,
    });
  } catch (err) {
    next(err);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deadline, ...data } = req.body;
    const payload = {
      ...data,
      deadline: deadline ? new Date(deadline) : deadline,
    };
    const updated = await ticketService.updateTicket(id, payload);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await ticketService.updateTicketStatus(
      id,
      status,
      req.ticket,
      req.user.role,
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: Audit log ticket soft-delete.
    await ticketService.deleteTicket(id);
    res
      .status(200)
      .json({ success: true, message: "Ticket deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const restoreTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: Audit log ticket restore.
    await ticketService.restoreTicket(id);
    res.status(200).json({ success: true, message: "Ticket restored" });
  } catch (err) {
    next(err);
  }
};

const deletePermanent = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: Audit log ticket permanent delete.
    await ticketService.deletePermanent(id);
    res
      .status(200)
      .json({ success: true, message: "Ticket permanently deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTickets,
  addTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  restoreTicket,
  deletePermanent,
};
