const { ZodError } = require("zod");

const validateBody = (schema) => {
    return (req, res, next) => {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                errors: [
                    { param: "body", msg: "Request body is required and cannot be empty", location: "body" }
                ],
            });
        }

        const result = schema.safeParse(req.body);

        if (!result.success) {
            const formattedErrors = (result.error instanceof ZodError && Array.isArray(result.error.issues))
                ? result.error.issues.map((e) => ({
                    param: e.path?.[0] || "body",
                    msg: e.message || "Invalid input",
                    location: "body",
                }))
                : [
                    {
                        param: "body",
                        msg: result.error?.message || "Invalid input",
                        location: "body",
                    }
                ];

            return res.status(400).json({
                success: false,
                errors: formattedErrors,
            });
        }

        next();
    };
};

module.exports = validateBody;