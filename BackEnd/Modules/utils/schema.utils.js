const { z } = require('zod');

const bigIntIdSchema = z
  .string()                              
  .trim()
  .regex(/^\d+$/, "Id must be a Positive Integer")
  .transform((val) => BigInt(val))
  .refine((val) => val > 0n, "ID must be greater than 0");

module.exports = { bigIntIdSchema };