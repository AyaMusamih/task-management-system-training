
const getTicketFlags = (ticket, user) => {
  const isAdmin = user.role === "ADMIN";
  const isAssignedToMe = ticket.assigneeId?.toString() === user.id.toString();

  return {
    canEdit: isAdmin,
    canUpdateStatus: isAdmin || isAssignedToMe,
    assignedToMe: isAssignedToMe,
  };
};

const attachPermissionFlags = (result, user) => {
  return {
    ...result,
    items: result.items.map((ticket) => ({
      ...ticket,
      permissions: getTicketFlags(ticket, user),
    })),
  };
};

module.exports = {
  getTicketFlags,
  attachPermissionFlags,
};
