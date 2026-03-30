const express = require("express");
const router = express.Router();
const validate = require("../Middlewares/validation");
const sprintController = require("./sprints.controller");
const authMiddleware = require("../Middlewares/auth.middleware");
const {
  createSprintSchema,
  updateSprintSchema,
  updateSprintParamSchema,
} = require("./schema/createSprint.schema");
const isAdmin = require("../Middlewares/isAdmin.middleware");

router.use(authMiddleware);
router.use(isAdmin);

router.post(
  "/create",
  validate({ body: createSprintSchema }),
  sprintController.create,
);

router.patch(
  "/update",
  validate({ param: updateSprintParamSchema, body: updateSprintSchema }),
  sprintController.update,
);

module.exports = router;
