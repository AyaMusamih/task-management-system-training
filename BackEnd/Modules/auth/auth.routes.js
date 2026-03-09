const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require("../Middlewares/validation");
const registerUserSchema = require("./schema/RegisterUser");
const loginSchema = require("./schema/login.schema");


router.post('/register', validate({ body: registerUserSchema }), authController.register)

router.post('/login', validate({ body: loginSchema }), authController.login);

module.exports = router;

