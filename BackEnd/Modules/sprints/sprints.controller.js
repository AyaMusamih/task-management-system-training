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
    const updated = await sprintService.update(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const getSprints = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const user = req.user;
    const data = await sprintService.findAll(page, limit, user);
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sprint = await sprintService.findOne(id, req.user);
    
    res.status(200).json({
      success: true,
      data: sprint
    });
  } catch (err) {
    next(err);
  }
};

const deleteSprint = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await sprintService.remove(id);

    res.status(200).json({
      success: true,
      message: `Sprint has been permanently deleted.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  update,
  getSprints,
  getById,
  deleteSprint
};
