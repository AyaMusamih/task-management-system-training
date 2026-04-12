const reportService = require("./reports.service");

const getAdminReport = async (req, res, next) => {
    try{
         const data = await reportService.getAdminReport(req.query);
         return res.status(200).json({
      success: true,
      data,
    });
    }
    catch(err){
        next(err)
    }
}

const getMyReport = async (req, res, next) => {
  try {
    const user_id = BigInt(req.user.id);
    const data = await reportService.getMyReport(user_id, req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
    getAdminReport,
    getMyReport
}