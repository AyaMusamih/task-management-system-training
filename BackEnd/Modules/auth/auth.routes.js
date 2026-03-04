const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validateBody = require("../Middlewares/validation");
const registerUserSchema = require("../zodSchemas/RegisterUser");

router.post('/register', validateBody(registerUserSchema) , authController.register )

router.post('/login');

module.exports = router;

