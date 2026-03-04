const prisma  = require('../prismaClient');



const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email }
    })
};

const registerUser = async (name, email, hashedPassword) => {
    const newUser = await prisma.user.create({
        data :{
            name,
            email,
            passwordHash: hashedPassword
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    })

    return {
        ...newUser,
        id: newUser.id.toString()
    };
};
module.exports = {
    findUserByEmail,
    registerUser
};