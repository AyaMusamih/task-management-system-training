const prisma = require("../prismaClient");

const getTickets = async (user, view, status, assignee, priority, startDate, endDate, page, limit, sortBy, search) => {
    const user_id =BigInt(user.id)
    const where = {deletedAt: null};

    if (user.role !== "ADMIN") {
        where.OR = [
            { sprintId: { not: null }, assigneeId: user_id },
            { status: "SCOPED_BACKLOG", assigneeId: user_id },
        ];
    } else {
        if (assignee) where.assigneeId = BigInt(assignee);
    }
        if (view === "sprint") {
        where.sprintId = {not: null};
        where.sprint = {is: {isActive: true}};
    }
    if (view === "scoped" && !status) where.status = "SCOPED_BACKLOG";
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }
    if (search) {
        where.title = {
            contains: search,
            mode: "insensitive"
        };
    }

    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
            where,
            skip,
            take: limit,
            orderBy: {[sortBy]: "desc"},
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                deadline: true,
                createdAt: true,
                updatedAt: true,
                assignee: {select: {id: true, name: true, email: true}},
                createdBy: {select: {id: true, name: true}},
                sprint: {select: {id: true, name: true}},
            }
        }),
        prisma.ticket.count({where})
    ]);
    return {
        items: tickets,
        paginationMeta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    };
};
module.exports = {
    getTickets
}