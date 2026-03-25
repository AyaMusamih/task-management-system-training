const { z } = require("zod");
const {addTicketSchema} = require("./addTicket.schema")
const { bigIntIdSchema } = require("../utils/schema.utils");
const { TicketStatus } = require("../../../prisma/generated");

const updateTicketSchema = addTicketSchema.partial();
const updateTicktParamSchema = z.object({
    id: bigIntIdSchema 
});
const updateStatusSchema = z.object({
  status: z.enum(Object.values(TicketStatus), {
    required_error: "Status is required",
    invalid_type_error: "Invalid status value"
  })
}).strict();

module.exports = {
    updateTicketSchema,
    updateTicktParamSchema,
    updateStatusSchema
}