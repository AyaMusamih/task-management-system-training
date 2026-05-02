const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require("../Middlewares/validation");
const registerUserSchema = require("./schema/RegisterUser");
const loginSchema = require("./schema/login.schema");
const {refreshSchema, forgotPasswordSchema, resetPasswordSchema} = require("./schema/resetAuth.schema")
const loginRateLimit = require("../Middlewares/loginRateLimit.middleware");

router.post('/register', validate({body: registerUserSchema}) , authController.register )

router.post('/login', loginRateLimit, validate({body: loginSchema}), authController.login);

router.post('/refresh',  authController.refresh)

router.post('/logout',  authController.logout);

router.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);

router.post('/reset-password', validate({ body: resetPasswordSchema }), authController.resetPassword);

module.exports = router;

