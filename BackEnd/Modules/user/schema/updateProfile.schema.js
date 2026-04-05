const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z
    .string()
    .trim()
    .nonempty({ message: "Email is required" })
    .max(255, { message: "Email must be at most 255 characters long" })
    .email("Invalid email format"),
});

module.exports = { updateProfileSchema };
