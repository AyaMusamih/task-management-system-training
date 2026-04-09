const prisma = require("../prismaClient");
const {Prisma} = require("../../prisma/generated")
const { TicketStatus, COMPLETED_STATUSES } = require("../Enums/enums");
const {
  normalizeDateRange,
  buildFiltersApplied,
  buildBaseWhere,
  isOverdue,
  getChartRange,
  getIsoWeekLabel,
  getIsoWeekSortKey,
  calcDelta,
  getPreviousRange
} = require("./utils/report.utils");

const getStatusSummary = async (where, now) => {
  const statusCounts = await prisma.ticket.groupBy({
    by: ["status"],
    where,
    _count: { _all: true },
  });

  const total = statusCounts.reduce((sum, row) => sum + row._count._all, 0);
  if(!where.status){}
  const completed =
    statusCounts.find((row) => row.status === TicketStatus.DONE)?._count._all ||
    0;
  const inProgress =
    statusCounts.find((row) => row.status === TicketStatus.IN_PROGRESS)?._count
      ._all || 0;

  const overdue = await prisma.ticket.count({
    where: {
      ...where,
      deadline: { lt: now },
      status: { not: TicketStatus.DONE },
    },
  });
  return {
    total,
    completed,
    in_progress: inProgress,
    overdue,
  };
};