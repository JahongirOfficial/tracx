/**
 * Daily billing CRON job.
 * Runs every night at 00:05 and deducts:
 *   vehicleCount × 1,000 UZS from each non-trial businessman's balance.
 *
 * Uses node-cron for scheduling.
 * If node-cron is unavailable, falls back to a daily setInterval.
 */

const { dailyChargeAll } = require('../services/balance.service');
const logger = require('../utils/logger');

let cron;
try {
  cron = require('node-cron');
} catch {
  cron = null;
}

const runBilling = async () => {
  logger.info('[Billing] Starting daily charge...');
  try {
    const count = await dailyChargeAll();
    logger.info(`[Billing] Done — ${count} businesses charged.`);
  } catch (err) {
    logger.error('[Billing] Error during daily charge:', err);
  }
};

const startBillingJob = () => {
  if (cron) {
    // Every day at 00:05
    cron.schedule('5 0 * * *', runBilling, { timezone: 'Asia/Tashkent' });
    logger.info('[Billing] CRON job scheduled (00:05 Tashkent)');
  } else {
    // Fallback: run once a day using setInterval (24h)
    const MS_24H = 24 * 60 * 60 * 1000;
    setInterval(runBilling, MS_24H);
    logger.warn('[Billing] node-cron not found — using setInterval fallback (24h)');
  }
};

module.exports = { startBillingJob, runBilling };
