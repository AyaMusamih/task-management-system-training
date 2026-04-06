const authService = require("./auth.service");
const userService = require("../user/user.service");
const bcrypt = require("bcrypt");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("./utils/auth.util");

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const { user, accessToken, refreshToken } = await authService.registerUser(
      name,
      email,
      hashedPassword,
    );

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(
      req.body.email,
      req.body.password,
    );

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refresh(refreshToken);
    setRefreshTokenCookie(res, newRefreshToken);
    res.status(200).json({
      success: true,
      data: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(200).json({ success: true, data: null });
    }
    console.log(refreshToken);
    await authService.logout(refreshToken);
    clearRefreshTokenCookie(res);
    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
      success: true,
      data: "Reset Link sent if email exsists",
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      data: null,
      message: "Password has been successfully reset",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
