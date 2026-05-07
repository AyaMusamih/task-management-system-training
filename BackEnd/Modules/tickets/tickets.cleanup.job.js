const cron = require("node-cron");
const { cleanupExpiredTickets } = require("./tickets.service");

cron.schedule(
  "0 0 0 * * *",
  async () => {
    console.log(`[Cleanup Job] Started at ${new Date().toISOString()}`);
    try {
      const result = await cleanupExpiredTickets();
      console.log(`[Cleanup Job] Done. Deleted ${result.count} tickets.`);
    } catch (err) {
      console.error("[Cleanup Job] Failed:", err.message);
    }
  },
  {
    scheduled: true,
    timezone: "UTC",
  },
);

console.log("[Cleanup Job] Scheduled — runs daily at 00:00 UTC");
