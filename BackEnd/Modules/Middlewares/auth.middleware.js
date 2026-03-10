const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("No token provided");
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token,jwtSecret);
    req.user = decoded; 
    next();
  } catch (e) {
    const err = new Error(
      e.name === "TokenExpiredError" ? "Token expired" : "Invalid token"
    );
    err.status = 401;
    next(err);
  }
};

module.exports = authMiddleware;