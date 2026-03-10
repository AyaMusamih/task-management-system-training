require('dotenv').config();
const { PrismaClient } = require('../prisma/generated');
const prisma = new PrismaClient();

module.exports = prisma;