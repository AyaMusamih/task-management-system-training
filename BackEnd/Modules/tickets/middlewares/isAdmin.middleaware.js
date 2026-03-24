
const isAdmin = (req, res, next) => {
    if (!req.user === 'ADMIN'){
        return res.status(401).json({message: 'This action is Admin only'})
    }
}