const express = require('express');
const router = express.Router();
const validate = require("../Middlewares/validation")
const {getTicketsSchema} = require("../tickets/schema/getTicketsSchema")
const ticketController = require("./tickets.controller")

router.get('/getTickets',validate({query:getTicketsSchema}), ticketController.getTickets )


module.exports = router
