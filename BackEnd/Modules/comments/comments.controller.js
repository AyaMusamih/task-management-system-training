const commentsService = require("./commets.service");

const getTicketComments = async (req, res, next) => {
	try {
		const { id } = req.params;
		const comments = await commentsService.getTicketComments(id, req.user);
		res.status(200).json({ success: true, data: comments });
	} catch (err) {
		next(err);
	}
};

const addTicketComment = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { content } = req.body;
		const created = await commentsService.createTicketComment(
			id,
			content,
			req.user,
		);
		res.status(201).json({ success: true, data: created });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getTicketComments,
	addTicketComment,
};
