const authService = require('./auth.service');
const userService = require('../user/user.service')
const bcrypt = require('bcrypt');

const register = async (req, res , next) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await userService.findUserByEmail(email);
        if(existingUser) {
            return res.status(409).json({
                success: false,
                error: "User already exists"
            });
        }
const hashedPassword = await bcrypt.hash(password, 10);

        const user = await authService.registerUser(name, email, hashedPassword);

        res.status(201).json({
            success: true,
            data: user
        });
    }catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
try {
    const { accessToken, refreshToken, user } = await authService.login(
      req.body.email,
      req.body.password,
    );
    res.status(200).json({
      success: true,
      message: "Login Successful",
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
    register,
    login
}