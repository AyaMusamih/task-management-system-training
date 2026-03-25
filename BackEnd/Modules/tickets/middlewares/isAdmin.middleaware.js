const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      const err = new Error("Admin Access Only");
      err.status = 403;
      next(err);
    }
   return  next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  isAdmin,
}
