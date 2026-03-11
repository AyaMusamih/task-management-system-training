const ticketService = require("./tickets.service")

const getTickets = async (req, res, next) => {
    try {
        const {
            view, status, assignee, priority, startDate, endDate, page, limit, sortBy, search
        } = req.query;
        const result = await ticketService.getTickets(
            view, status, assignee, priority, startDate, endDate, page, limit, sortBy,search
        );

        res.status(200).json({
            success: true,
            ...result
        })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    getTickets
}