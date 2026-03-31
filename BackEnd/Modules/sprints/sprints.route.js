const express = require("express");
const router = express.Router();
const validate = require("../Middlewares/validation");
const sprintController = require("./sprints.controller");
const authMiddleware = require("../Middlewares/auth.middleware");
const {
  createSprintSchema,
  updateSprintSchema,
  updateSprintParamSchema,
  SprintRequestSchema,
} = require("./schema/sprint.schema");
const isAdmin = require("../Middlewares/isAdmin.middleware");

router.use(authMiddleware);

router.post(
  "/create",
  isAdmin,
  validate({ body: createSprintSchema }), 
  sprintController.create,
);

router.patch(
  "/update/:id",
  isAdmin,
  validate({ params: updateSprintParamSchema, body: updateSprintSchema }),
  sprintController.update,
);

router.get(
  "",
  validate({ query: SprintRequestSchema }),
  sprintController.getSprints,
);

router.get(
  "/:id",
  validate({ params: updateSprintParamSchema }),
  sprintController.getById,
);

router.delete(
  "/:id",
  isAdmin, 
  validate({ params: updateSprintParamSchema }),
  sprintController.deleteSprint
);

module.exports = router;
