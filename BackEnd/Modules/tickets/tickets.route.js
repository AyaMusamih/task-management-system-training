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
const commentsController = require("../comments/comments.controller");
const { addCommentSchema } = require("../comments/schema/addComment.schema");
const auditRouter = require("../audit/audit.routes");

router.use(authMiddleware);

router.get(
  "/getTickets",
  validate({ query: getTicketsSchema }),
  ticketController.getTickets,
);
router.get(
  "/:id",
  validate({ params: updateTicketParamSchema }),
  ticketController.getTicketById,
);
router.get(
  "/:id/comments",
  validate({ params: updateTicketParamSchema }),
  commentsController.getTicketComments,
);
router.post(
  "/:id/comments",
  validate({ params: updateTicketParamSchema, body: addCommentSchema }),
  commentsController.addTicketComment,
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

router.use("/:id/audit", auditRouter);

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

router.delete("/permanent", isAdmin, ticketController.deleteAllPermanent);

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
