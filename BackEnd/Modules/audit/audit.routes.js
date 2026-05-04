const express = require("express");
const router = express.Router({ mergeParams: true }); 
const { getAuditLog } = require("./audit.controller");
const isAdmin = require("../Middlewares/isAdmin.middleware");

router.get("/", isAdmin, getAuditLog);

module.exports = router;