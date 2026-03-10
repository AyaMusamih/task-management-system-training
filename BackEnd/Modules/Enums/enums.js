const {TicketStatus , Priority} = require('../../prisma/generated');

const viewEnum = {
    sprint: "sprint",
    scoped: "scoped",
    all: "all"
};

const sortEnum = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    priority: "priority",
    deadline: "deadline",
    status: "status"
}

module.exports = {
    viewEnum,
    TicketStatus,
    Priority,
    sortEnum
}