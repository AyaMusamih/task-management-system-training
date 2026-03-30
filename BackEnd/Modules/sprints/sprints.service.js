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

const update = async (id, payload) => {
    const sprint = prisma.sprint.findUnique({where: {id}});

    if(!sprint){
    const err = new Error("Sprint not found");
    err.status = 404;
    throw err;
    }
    return await prisma.sprint.update({where: {id}, data: payload});

}

module.exports = {
    create,
    update
}

