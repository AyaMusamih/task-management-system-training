const express = require("express");
const router = express.Router();

const authMiddleware = require("../Middlewares/auth.middleware");
const validate = require("../Middlewares/validation");
const userController = require("./user.controller");
const { changePasswordSchema } = require("./schema/changePassword.schema");
const { updateProfileSchema } = require("./schema/updateProfile.schema");

router.use(authMiddleware);

router.get("", userController.getProfile);

router.put(
	"",
	validate({ body: updateProfileSchema }),
	userController.updateProfile,
);

router.put(
	"/password",
	validate({ body: changePasswordSchema }),
	userController.changePassword,
);

module.exports = router;
