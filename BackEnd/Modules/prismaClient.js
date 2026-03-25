require('dotenv').config();
const { PrismaClient } = require('../prisma/generated');
const prisma = new PrismaClient();
BigInt.prototype.toJSON = function () {
    return this.toString();
};

module.exports = prisma;