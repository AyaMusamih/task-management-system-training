const express = require("express");
const router = express.Router();
const validate = require("../Middlewares/validation");
const sprintController = require("./sprints.controller");
const authMiddleware = require("../Middlewares/auth.middleware");
const {createSprintSchema} = require("./schema/createSprint.schema");
const isAdmin = require("../Middlewares/isAdmin.middleware");

router.use(authMiddleware);
router.use(isAdmin)

router.post('/create-sprint', validate({ body: createSprintSchema }), sprintController.create);

module.exports = router;