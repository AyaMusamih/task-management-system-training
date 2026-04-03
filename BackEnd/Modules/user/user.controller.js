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

module.exports = {
	changePassword,
};
