const { z } = require("zod");

const addCommentSchema = z
  .object({
    content: z.string().trim().min(1, "Content is required").max(1000),
  })
  .strict();

module.exports = {
  addCommentSchema,
};
