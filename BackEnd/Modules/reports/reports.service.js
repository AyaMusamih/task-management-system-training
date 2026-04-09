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


 const buildChart = async (filters, chartRange) => {
  // Pre-fill week bucket
  let current = new Date(chartRange.start);
  const buckets = new Map();
  while (current <= chartRange.end) {
    const key = getIsoWeekSortKey(current);
    if (!buckets.has(key)) {
      buckets.set(key, {
        week: getIsoWeekLabel(current),
        completed: 0,
        in_progress: 0,
        overdue: 0,
      });
    }
    current.setDate(current.getDate() + 1);
  }
 
  // mySql: YEARWEEK(date, 3) uses ISO week numbering (week starts monday)
  // returns one row per (week,status) 
  const rows = await prisma.$queryRaw`
    SELECT
      YEARWEEK(createdAt, 3) AS sort_key,
      DATE_FORMAT(MIN(createdAt), '%x-W%v') AS week,
      status,
      COUNT(*) AS count,
      SUM(
        CASE
          WHEN deadline < NOW()
            AND status NOT IN (${Prisma.join(COMPLETED_STATUSES)})
          THEN 1 ELSE 0
        END
      ) AS overdue_count
    FROM tickets
    WHERE deletedAt IS NULL
      AND createdAt BETWEEN ${chartRange.start} AND ${chartRange.end}
      ${filters.sprintId   ? Prisma.sql`AND sprintId   = ${BigInt(filters.sprintId)}`   : Prisma.empty}
      ${filters.assigneeId ? Prisma.sql`AND assigneeId = ${BigInt(filters.assigneeId)}` : Prisma.empty}
      ${filters.status     ? Prisma.sql`AND status      = ${filters.status}`             : Prisma.empty}
    GROUP BY YEARWEEK(createdAt, 3), status
    ORDER BY sort_key
  `;
 
  rows.forEach((row) => {
    const key = Number(row.sort_key);
    const bucket = buckets.get(key);
    if (!bucket) return;
 
    const count = Number(row.count);
    const overdueCount = Number(row.overdue_count);
 
    if (COMPLETED_STATUSES.includes(row.status)) bucket.completed += count;
    if (row.status === TicketStatus.IN_PROGRESS) bucket.in_progress += count;
    bucket.overdue += overdueCount;
  });
 
  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map((entry) => entry[1]);
};

const buildMembers = async (where, now) => {
  const memberWhere = { ...where };
  if (!memberWhere.assigneeId) memberWhere.assigneeId = { not: null };

  const [grouped, overdueGrouped] = await Promise.all([
    prisma.ticket.groupBy({
      by: ["assigneeId", "status"],
      where: memberWhere,
      _count: { _all: true },
    }),
    prisma.ticket.groupBy({
      by: ["assigneeId"],
      where: {
        ...memberWhere,
        deadline: { lt: now },
        status: { notIn: COMPLETED_STATUSES },
      },
      _count: { _all: true },
    }),
  ]);

  // Guard against unexpected non-array results
  if (!Array.isArray(grouped) || !Array.isArray(overdueGrouped)) {
    console.error("Unexpected groupBy result:", { grouped, overdueGrouped });
    return [];
  }

  const assigneeIds = Array.from(
    new Set(grouped.map((row) => row.assigneeId).filter(Boolean)),
  );

  if (assigneeIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true },
  });

  // Normalize IDs to string for consistent map key comparison
  const userMap = new Map(users.map((user) => [String(user.id), user]));
  const countsMap = new Map();

  for (const row of grouped) {
    if (!row.assigneeId) continue;
    const key = String(row.assigneeId);
    const current = countsMap.get(key) ?? {
      assigned: 0,
      completed: 0,
      in_progress: 0,
    };
    current.assigned += row._count._all;
    if (row.status === TicketStatus.DONE) current.completed += row._count._all;
    if (row.status === TicketStatus.IN_PROGRESS) current.in_progress += row._count._all;
    countsMap.set(key, current);
  }

  const overdueMap = new Map(
    overdueGrouped
      .filter((row) => row.assigneeId != null)
      .map((row) => [String(row.assigneeId), row._count._all]),
  );

  return assigneeIds.map((assigneeId) => {
    const key = String(assigneeId);
    const user = userMap.get(key);
    const counts = countsMap.get(key) ?? { assigned: 0, completed: 0, in_progress: 0 };
    const overdue = overdueMap.get(key) ?? 0;
    const completionRate =
      counts.assigned > 0
        ? Number((counts.completed / counts.assigned).toFixed(2))
        : 0;

    return {
      user_id: key,
      name: user?.name ?? "unknown",
      assigned: counts.assigned,
      completed: counts.completed,
      in_progress: counts.in_progress,
      overdue,
      completion_rate: completionRate,
    };
  });
};
