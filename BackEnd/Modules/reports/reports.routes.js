const express = require("express");
const router = express.Router();
const validate = require("../Middlewares/validation");
const {
  adminReportSchema,
  userReportSchema,
} = require("./schema/reports.schema");
const isAdmin = require("../Middlewares/isAdmin.middleware")
const authMiddleware = require("../Middlewares/auth.middleware");
const reportsController = require("./reports.controller")

router.use(authMiddleware)
router.get(
  "/admin",
  isAdmin,
  validate({ query: adminReportSchema }),
  reportsController.getAdminReport,
);


module.exports = router;