import 'dotenv/config';
import express from 'express';
import { createRedis } from './utils/redisClient.js';
import { logger } from './utils/logger.js';
import { generateDailyReport } from './reports/reportGenerator.js';
import { WithdrawalService } from './services/withdrawalService.js';
import cron from 'cron';

const app = express();
app.use(express.json());

const redis = createRedis(process.env.REDIS_URL || 'redis://localhost:6379');
const withdrawalProvider = process.env.WITHDRAWAL_PROVIDER_URL || '';
const providerSecret = process.env.WITHDRAWAL_PROVIDER_SECRET || '';
const reportCron = process.env.REPORT_CRON || '0 5 * * *';
const reportOutput = process.env.REPORT_OUTPUT_DIR || './service/reports';
const withdrawalSvc = new WithdrawalService(withdrawalProvider, providerSecret);
const WITHDRAWAL_AUTH = process.env.WITHDRAWAL_AUTH_TOKEN || '';

// Trigger manual withdrawal (requires auth header)
app.post('/api/withdraw', async (req, res) => {
  const auth = req.header('X-WITHDRAWAL-AUTH') || '';
  if (!WITHDRAWAL_AUTH || auth !== WITHDRAWAL_AUTH) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  const { amount, account } = req.body;
  if (!amount) return res.status(400).json({ ok: false, error: 'amount_required' });
  const r = await withdrawalSvc.triggerWithdrawal(amount, account || 'default');
  return res.json({ ok: r.success, detail: r });
});

// Generate report on demand (and optionally notify)
app.post('/api/reports/daily', async (req, res) => {
  try {
    const r = await generateDailyReport(redis, req.body.botId || 'demoBot');
    return res.json({ ok: true, ...r });
  } catch (e) {
    logger.error({ err: String(e) }, 'report generation failed');
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// Download report (serve reports directory)
app.use('/reports', express.static(reportOutput));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// schedule daily report
try {
  const c = new cron.CronJob(reportCron, async () => {
    try {
      await generateDailyReport(redis, 'demoBot');
    } catch (e) {
      logger.error({ err: String(e) }, 'scheduled report failed');
    }
  });
  c.start();
  logger.info({ schedule: reportCron }, 'Report scheduler started');
} catch (e) {
  logger.warn('Failed to start report scheduler', e);
}

const port = Number(process.env.PORT || 8086);
app.listen(port, () => logger.info({ port }, 'Withdrawal & Reporting service listening'));
