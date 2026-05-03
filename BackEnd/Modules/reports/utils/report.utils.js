const { COMPLETED_STATUSES } = require("../../Enums/enums");
 
const startOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};
 
const endOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};
 
const normalizeDateRange = (dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return null;
  const start = startOfDay(dateFrom || dateTo);
  const end = endOfDay(dateTo || dateFrom);
  return { start, end };
};
 
const formatDateOnly = (date) => date.toISOString().slice(0, 10);

const buildBaseWhere = ({ dateRange, status, assigneeId, sprintId }) => {
  const where = { deletedAt: null };
 
  if (dateRange) {
    where.createdAt = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }
 
  if (status) where.status = status;
  if (assigneeId) where.assigneeId = assigneeId;
  if (sprintId) where.sprintId = sprintId;
 
  return where;
};
 
const buildFiltersApplied = ({ dateRange, status, assigneeId, sprintId }) => {
  return {
    date_range: dateRange
      ? {
          from: formatDateOnly(dateRange.start),
          to: formatDateOnly(dateRange.end),
        }
      : null,
    status: status || null,
    assignee_id: assigneeId ? assigneeId.toString() : null,
    sprint_id: sprintId ? sprintId.toString() : null,
  };
};
 
const isOverdue = (ticket, now = new Date()) => {
  return (
    !!ticket.deadline &&
    ticket.deadline < now &&
    !COMPLETED_STATUSES.includes(ticket.status)
  );
};
 
const getChartRange = (dateRange, defaultDays = 42) => {
  if (dateRange) return dateRange;
 
  const end = endOfDay(new Date());
  const start = new Date(end);
  start.setDate(start.getDate() - defaultDays);
 
  return { start: startOfDay(start), end };
};

const getPreviousRange = (dateRange) => {
  if (!dateRange) return null;
  const durationMs = dateRange.end.getTime() - dateRange.start.getTime();
  const prevEnd = new Date(dateRange.start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return { start: prevStart, end: prevEnd };
};
 
const getIsoWeekParts = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
};
 
const getIsoWeekLabel = (date) => {
  const { year, week } = getIsoWeekParts(date);
  const paddedWeek = String(week).padStart(2, "0");
  return `${year}-W${paddedWeek}`;
};

const getIsoWeekSortKey = (date) => {
  const { year, week } = getIsoWeekParts(date);
  return year * 100 + week;
};

const calcDelta = (current, previous) => {
  if (current === 0 && previous === 0) return 0; 
  if (previous === 0) return null; 
  return Math.round(((current - previous) / previous) * 100) / 100;
};


module.exports = {
  normalizeDateRange,
  buildFiltersApplied,
  buildBaseWhere,
  isOverdue,
  getChartRange,
  formatDateOnly,
  getIsoWeekLabel,
  getIsoWeekSortKey,
  calcDelta,
  getPreviousRange,
  startOfDay,
  endOfDay
};