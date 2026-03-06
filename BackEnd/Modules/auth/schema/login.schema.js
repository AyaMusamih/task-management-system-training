const { z } = require('zod');

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .trim(),
  password: z
    .string({ required_error: "Password is required" }),
}).strict();

module.exports = loginSchema;