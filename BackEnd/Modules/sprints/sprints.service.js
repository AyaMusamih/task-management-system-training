const prisma = require("../prismaClient");

const create = async (payload) => {
    return await prisma.sprint.create({
        data: {
            name: payload.name,
            startDate: new Date (payload.startDate),
            endDate: new Date (payload.endDate),
            createdAt: new Date(),
        }
    })
};

module.exports = {
    create
}

