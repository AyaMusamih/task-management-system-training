const { z } = require("zod");

const refreshSchema = z.object({ refreshToken: z.string().min(1) }).strict();
const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .nonempty({ message: "Email is required" })
      .max(255, { message: "Email must be at most 255 characters long" })
      .email("Invalid email format"),
  })
  .strict();
const resetPasswordSchema = z
  .object({
    token: z.string().nonempty({ message: "Reset token is required" }),
    newPassword: z
      .string()
      .trim()
      .nonempty({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100, { message: "Password is too long" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
        message:
          "Password must contain uppercase, lowercase, number and special character",
      }),
  })
  .strict();

module.exports = {
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
