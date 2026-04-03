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
    const users = await userService.getUsers({ page, limit});
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};


module.exports = {
	changePassword,
    getUsers
};
