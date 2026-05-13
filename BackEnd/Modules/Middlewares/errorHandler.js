const errorHandler = (err, req, res, next) => {
  if (err.constructor.name === "PrismaClientValidationError") {
    return res.status(400).json({
      success: false,
      error: "Invalid data sent to database",
    });
  }

  if (err.constructor.name === "PrismaClientKnownRequestError") {
    switch (err.code) {
      case "P2025":
        if (err.meta?.cause?.includes("nested connect")) {
          const model =
            err.meta.cause.match(/No '(\w+)' record/)?.[1] ?? "record";
          return res
            .status(422)
            .json({
              success: false,
              error: `Referenced ${model} does not exist`,
            });
        }
        return res
          .status(404)
          .json({ success: false, error: "Record not found" });
      case "P2003":
        return res.status(422).json({
          success: false,
          error: `Referenced ${err.meta?.field_name ?? "record"} does not exist`,
        });
      case "P2002":
        return res.status(422).json({
          success: false,
          error: "A record with this value already exists",
        });
      case "P2014":
        return res.status(422).json({
          success: false,
          error: "Operation would violate a required relation",
        });
      case "P2011":
        return res
          .status(422)
          .json({ success: false, error: "A required field was sent as null" });
      case "P2006":
        return res.status(422).json({
          success: false,
          error: "Invalid value provided for a field",
        });
    }
  }
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        success: false,
        error: message,
    });
};

module.exports = errorHandler;