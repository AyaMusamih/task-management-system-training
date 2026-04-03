const express = require("express");
const router = express.Router();

const authMiddleware = require("../Middlewares/auth.middleware");
const validate = require("../Middlewares/validation");
const isAdmin = require("../Middlewares/isAdmin.middleware");
const userController = require("./user.controller");
const {paginationSchema} = require("../utils/schema.utils")

router.use(authMiddleware);
router.use(isAdmin);

router.get('/users', validate({query: paginationSchema}), userController.getUsers);

module.exports = router;


