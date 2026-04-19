const {z} = require("zod");
const {viewEnum, Priority, TicketStatus,sortEnum} = require("../../Enums/enums");


const getTicketsSchema = z.object({
    view: z.enum(Object.values(viewEnum)).optional(),
    status: z.enum(Object.values(TicketStatus)).optional(),
    priority: z.enum(Object.values(Priority)).optional(),
    sortBy: z.enum(Object.values(sortEnum)).default("createdAt").optional(),
    search:z.string().trim().max(100).optional(),
    assignee: z.coerce.number().int().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    deletedOnly: z.coerce.boolean().optional(),
    includeDeleted: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(20).default(20),
}).refine((data) => {
    if (data.startDate && data.endDate) return data.startDate <= data.endDate;
    return true;
}, {
    message: "Start date must be before end date",
    path: ["startDate"]
});

module.exports = {
    getTicketsSchema
}