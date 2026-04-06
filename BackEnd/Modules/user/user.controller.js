const userService = require("./user.service");

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await userService.getUsers({ page, limit });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const data = await userService.getProfile(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    const updated = await userService.updateProfile(userId, { name, email });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
	console.log(err.status)
    next(err);
  }
};

module.exports = {
  changePassword,
  getUsers,
  getProfile,
  updateProfile,
};
