const { z } = require("zod");
const {strongPasswordSchema} = require("../../utils/schema.utils")

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .nonempty({ message: "Current password is required" }),
    newPassword: strongPasswordSchema,
    confirmPassword: z
      .string()
      .trim()
      .nonempty({ message: "Confirm password is required" }),
  })
  .strict()
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

module.exports = { changePasswordSchema };
