const ticketService = require("./tickets.service")
const {attachPermissionFlags} = require("./utils/ticket-premissions.util")

const getTickets = async (req, res, next) => {
    try {
        const {
            view, status, assignee, priority, startDate, endDate, page, limit, sortBy, search
        } = req.query;

        const result = await ticketService.getTickets(
           req.user, view, status, assignee, priority, startDate, endDate, page, limit, sortBy,search
        );
        const resultWithFlags = attachPermissionFlags(result, req.user)
        
        res.status(200).json({
            success: true,
            ...resultWithFlags
        })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    getTickets
}