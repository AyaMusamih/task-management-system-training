const isAdmin = (req, res, next) => {
  try {
    if (!req.user === "ADMIN") {
      const err = new Error("Admin Access Only");
      err.status = 403;
      next(err);
    }
  } catch (err) {
    next(err);
  }
};
