const prisma = require("../prismaClient");

const isPremium = async (req, res, next) => {
  try {
    const now = new Date();
    const hasActivePremium =
      req.user.plan === "PREMIUM" && (!user.premiumUntil || user.premiumUntil > now);

    if (!hasActivePremium) {
      const err = new Error("Premium Access Only");
      err.status = 403;
      return next(err);
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = isPremium;
