const { z } = require("zod");

const createSprintSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(4, "Name is too short")
      .max(100, "Name is too long"),
    startDate: z.string().datetime({ message: "Invalid ISO date string" }),
    endDate: z.string().datetime({ message: "Invalid ISO date string" }),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: "End date must be after the start date",
      path: ["endDate"],
    },
  );

  module.exports = {
    createSprintSchema,
  }
