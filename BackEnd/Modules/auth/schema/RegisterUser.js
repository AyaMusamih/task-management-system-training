const { z } = require("zod");
const {strongPasswordSchema} = require("../../utils/schema.utils")

const registerUserSchema = z.object({
    name: z
        .string()
        .trim()
        .nonempty({ message: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(100, { message: "Name must be at most 100 characters long" }),

    email: z
        .string()
        .trim()
        .nonempty({ message: "Email is required" })
        .max(255, { message: "Email must be at most 255 characters long" })
        .email("Invalid email format"),

    password: strongPasswordSchema,
}).strict();

module.exports = registerUserSchema;