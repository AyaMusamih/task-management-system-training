const { z } = require("zod");

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

    password: z
        .string()
        .trim()
        .nonempty({ message: "Password is required" })
        .min(6, { message: "Password must be at least 6 characters" })
        .max(100, { message: "Password is too long" }),
}).strict();

module.exports = registerUserSchema;