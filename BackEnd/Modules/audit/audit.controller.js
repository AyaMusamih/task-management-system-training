const { getTicketAuditLog } = require("./audit.service");

const getAuditLog = async (req, res, next) => {
  try {
    const logs = await getTicketAuditLog(req.params.id);
    res.json({ items: logs });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLog };