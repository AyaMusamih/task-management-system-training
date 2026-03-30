const sprintService = require("./sprints.service");

const create = async (req, res, next) => {
  const created = await sprintService.create(req.body);
  res.status(201).json({ success: true, data: created });
};

module.exports = {
    create
}
