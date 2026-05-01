const prisma = require("../prismaClient");

const normalizeId = (id) => (typeof id === "bigint" ? id : BigInt(id));

const getTicketOrThrow = async (ticketId) => {
	const ticket = await prisma.ticket.findUnique({
		where: { id: normalizeId(ticketId) },
		select: {
			id: true,
			status: true,
			assigneeId: true,
			sprintId: true,
			deletedAt: true,
		},
	});

	if (!ticket) {
		const err = new Error("Ticket not found");
		err.status = 404;
		throw err;
	}

	return ticket;
};

const ensureCanViewTicketComments = (ticket, user) => {

	if (ticket.deletedAt) {
		const err = new Error("ticket not found");
		err.status = 404;
		throw err;
	}
    if (user.role === "ADMIN") return;

	const userId = normalizeId(user.id);
	const isAssignedToUser = ticket.assigneeId?.toString() === userId.toString();
	const isScopedBacklog = ticket.status === "SCOPED_BACKLOG";
	const isSprintTicket = ticket.sprintId != null;

	if (!isAssignedToUser || (!isScopedBacklog && !isSprintTicket)) {
		const err = new Error("Can't view commnets on this ticket");
		err.status = 403;
		throw err;
	}
};

const ensureCanCreateComment = (ticket, user) => {

	if (ticket.deletedAt) {
		const err = new Error("Can't add comment on deleted ticket");
		err.status = 403;
		throw err;
	}
	if (user.role === "ADMIN") return;

	const userId = normalizeId(user.id);
	const isAssignedToUser = ticket.assigneeId?.toString() === userId.toString();

	if (!isAssignedToUser) {
		const err = new Error("Can't add comment on this ticket");
		err.status = 403;
		throw err;
	}
};

const getTicketComments = async (ticketId, user) => {
	const ticket = await getTicketOrThrow(ticketId);
	ensureCanViewTicketComments(ticket, user);

	const comments = await prisma.comment.findMany({
		where: { ticketId: ticket.id },
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			content: true,
			createdAt: true,
			updatedAt: true,
			author: { select: { id: true, name: true, email: true } },
		},
	});

	return comments;
};

const createTicketComment = async (ticketId, content, user) => {
	const ticket = await getTicketOrThrow(ticketId);
	ensureCanCreateComment(ticket, user);

	return await prisma.comment.create({
		data: {
			content,
			ticketId: ticket.id,
			authorId: normalizeId(user.id),
		},
		select: {
			id: true,
			content: true,
			createdAt: true,
			updatedAt: true,
			author: { select: { id: true, name: true, email: true } },
		},
	});
};

module.exports = {
	getTicketComments,
	createTicketComment,
};
