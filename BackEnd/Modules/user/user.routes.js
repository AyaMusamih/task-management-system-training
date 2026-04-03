const express = require("express");
const router = express.Router();

const authMiddleware = require("../Middlewares/auth.middleware");
const validate = require("../Middlewares/validation");
const userController = require("./user.controller");
const { changePasswordSchema } = require("./schema/changePassword.schema");

router.use(authMiddleware);

router.put(
	"/password",
	validate({ body: changePasswordSchema }),
	userController.changePassword,
);

module.exports = router;
