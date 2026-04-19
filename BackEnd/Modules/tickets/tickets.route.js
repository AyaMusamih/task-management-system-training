const express = require("express");
const router = express.Router();
const validate = require("../Middlewares/validation");
const { getTicketsSchema } = require("../tickets/schema/getTicketsSchema");
const { addTicketSchema } = require("./schema/addTicket.schema");
const {
  updateTicketSchema,
  updateTicketParamSchema,
  updateTicketStatusSchema,
} = require("./schema/updateTicket.schema");
const {
  checkUpdatePermission,
} = require("./middlewares/ticketAuth.middleware");
const isAdmin = require("../Middlewares/isAdmin.middleware");
const ticketController = require("./tickets.controller");
const authMiddleware = require("../Middlewares/auth.middleware");

router.use(authMiddleware);

router.get(
  "/getTickets",
  validate({ query: getTicketsSchema }),
  ticketController.getTickets,
);
router.post(
  "",
  isAdmin,
  validate({ body: addTicketSchema }),
  ticketController.addTicket,
);
router.patch(
  "/:id/status",
  checkUpdatePermission,
  validate({ params: updateTicketParamSchema, body: updateTicketStatusSchema }),
  ticketController.updateTicketStatus,
);

router.patch(
  "/:id",
  isAdmin,
  validate({ params: updateTicketParamSchema, body: updateTicketSchema }),
  ticketController.updateTicket,
);

router.patch(
  "/:id/restore",
  isAdmin,
  validate({ params: updateTicketParamSchema }),
  ticketController.restoreTicket,
);

router.delete(
  "/:id",
  isAdmin,
  validate({ params: updateTicketParamSchema }),
  ticketController.deleteTicket,
);

router.delete(
  "/:id/permanent",
  isAdmin,
  validate({ params: updateTicketParamSchema }),
  ticketController.deletePermanent,
);

module.exports = router;
