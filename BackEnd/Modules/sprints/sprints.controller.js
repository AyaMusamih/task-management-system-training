const sprintService = require("./sprints.service");

const create = async (req, res, next) => {
  try {
    const created = await sprintService.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate } = req.body;
    const payload = {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
    const updated = await sprintService.update(id, payload);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  update
};
