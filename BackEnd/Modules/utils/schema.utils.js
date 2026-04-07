const { z } = require('zod');

const bigIntIdSchema = z
  .string()                              
  .trim()
  .regex(/^\d+$/, "Id must be a Positive Integer")
  .transform((val) => BigInt(val))
  .refine((val) => val > 0n, "ID must be greater than 0");

const strongPasswordSchema = z
  .string()
  .trim()
  .nonempty({ message: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters" })
  .max(100, { message: "Password is too long" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message:
      "Password must contain uppercase, lowercase, number and special character",
  });  

  const paginationSchema =  z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
    })
  .strict();

module.exports = { bigIntIdSchema, strongPasswordSchema, paginationSchema };