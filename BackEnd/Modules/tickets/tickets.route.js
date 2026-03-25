const express = require("express");
const router = express.Router();
const validate = require("../Middlewares/validation");
const { isAdmin } = require("./middlewares/isAdmin.middleaware");
const { getTicketsSchema } = require("../tickets/schema/getTicketsSchema");
const { addTicketSchema } = require("./schema/addTicket.schema");
const {
  updateTicketSchema,
  updateTicktParamSchema,
} = require("./schema/updateTicket.schema");
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
  "/:id",
  isAdmin,
  validate({ params: updateTicktParamSchema, body: updateTicketSchema }),
  ticketController.updateTicket,
);

module.exports = router;
