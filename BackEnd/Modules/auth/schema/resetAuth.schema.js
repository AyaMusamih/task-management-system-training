const { z } = require("zod");

const refreshSchema = z.object({ refreshToken: z.string().min(1) }).strict();

module.exports = {
  refreshSchema,
};
