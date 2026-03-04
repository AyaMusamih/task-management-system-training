/**
 * validation middleware for body, query, and params.
 * @param {Object} schemas - Map of request locations to Zod schemas
 * @example validate({ body: userSchema, query: filterSchema })
 */
const validate = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    for (const [location, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[location]);

      if (!result.success) {
        const formatted = result.error.issues.map((e) => ({
          param: e.path.length > 0 ? e.path.join(".") : location,
          msg: e.message,
          location: location,
        }));

        errors.push(...formatted);
      } else {
        req[location] = result.data;
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors,
      });
    }

    next();
  };
};

module.exports = validate;
