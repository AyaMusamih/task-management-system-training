const { z } = require("zod");
const { TicketStatus } = require("../../Enums/enums");
const { bigIntIdSchema } = require("../../utils/schema.utils");

const hasValidDateRange = (data) => {
  if (data.date_from && data.date_to) return data.date_from <= data.date_to;
  return true;
};

const reportSchema = z
  .object({
    date_from: z.coerce.date().optional(),
    date_to: z.coerce.date().optional(),
    status: z.enum(Object.values(TicketStatus)).optional(),
    sprint_id: bigIntIdSchema.optional(),
  })
  .strict();

const adminReportSchema = reportSchema
  .extend({
    assignee_id: bigIntIdSchema.optional(),
  })
  .strict()
  .refine(hasValidDateRange, {
    message: "date_from must be before date_to",
    path: ["date_from"],
  });

const adminExportSchema = reportSchema
  .extend({
    assignee_id: bigIntIdSchema.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(5000).optional(),
  })
  .strict()
  .refine(hasValidDateRange, {
    message: "date_from must be before date_to",
    path: ["date_from"],
  });

const userReportSchema = reportSchema.refine(hasValidDateRange, {
  message: "date_from must be before date_to",
  path: ["date_from"],
});

module.exports = {
  adminReportSchema,
  adminExportSchema,
  userReportSchema,
};
