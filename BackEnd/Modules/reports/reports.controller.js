const reportService = require("./reports.service");
const { pipeline } = require("stream");
const { promisify } = require("util");
const pipelineAsync = promisify(pipeline);

const getAdminReport = async (req, res, next) => {
  try {
    const data = await reportService.getAdminReport(req.query);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getMyReport = async (req, res, next) => {
  try {
    const user_id = BigInt(req.user.id);
    const data = await reportService.getMyReport(user_id, req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getAdminReportExport = async (req, res, next) => {
  try {
    const { stream, filename } = await reportService.getAdminReportExportStream(
      req.query,
    );
    // Santise filename before embedding it in the header
    const safeFilename = filename
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/"/g, "");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename}"`,
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200);

    await pipelineAsync(stream, res);
  } catch (err) {
    if (res.headersSent) {
      return next(err);
    }
    next(err);
  }
};

module.exports = {
  getAdminReport,
  getMyReport,
  getAdminReportExport,
};
