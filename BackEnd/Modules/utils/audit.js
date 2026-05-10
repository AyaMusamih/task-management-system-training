const prisma = require("../prismaClient");

async function audit({ ticketId, actorId, actorRole, action, oldValue, newValue, tx }) {
  const db = tx ?? prisma;
  return db.auditLog.create({
    data: {
      ticketId,
      actorId:  BigInt(actorId),
      actorRole,
      action,
      oldValue:  oldValue ?? undefined,
      newValue:  newValue ?? undefined,
    },
  });
}

module.exports = { audit };