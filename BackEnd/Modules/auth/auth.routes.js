const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require("../Middlewares/validation");
const registerUserSchema = require("./schema/RegisterUser");
const loginSchema = require("./schema/login.schema");
const {refreshSchema} = require("./schema/resetAuth.schema")


router.post('/register', validate({body: registerUserSchema}) , authController.register )

router.post('/login', validate({body: loginSchema}), authController.login);

router.post('/refresh', validate({body: refreshSchema}), authController.refresh)

module.exports = router;

