const authService = require('./auth.service');
const bcrypt = require('bcrypt');

const register = async (req, res , next) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await authService.findUserByEmail(email);
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

const login = async (req, res) => {

};

module.exports = {
    register,
    login
}