const { z } = require("zod");
const { bigIntIdSchema } = require("../../utils/schema.utils");

const sprintShape = {
  name: z
    .string()
    .trim()
    .min(4, "Name is too short")
    .max(100, "Name is too long"),
  startDate: z
    .string()
    .datetime({ message: "Invalid ISO date string" })
    .transform((val) => new Date(val)),
  endDate: z
    .string()
    .datetime({ message: "Invalid ISO date string" })
    .transform((val) => new Date(val)),
};

const createSprintSchema = z
  .object(sprintShape)
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after the start date",
    path: ["endDate"],
  })
  .strict();

const updateSprintSchema = z
  .object(sprintShape)
  .partial()
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true; 
    },
    {
      message: "End date must be after the start date",
      path: ["endDate"],
    }
  )
  .strict();
const updateSprintParamSchema = z
  .object({
    id: bigIntIdSchema,
  })
  .strict();

const SprintRequestSchema =  z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
    })
  .strict();

module.exports = {
  createSprintSchema,
  updateSprintSchema,
  updateSprintParamSchema,
  SprintRequestSchema,
};
