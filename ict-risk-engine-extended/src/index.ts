import 'dotenv/config';
import { AccountStoreRedis } from './risk/AccountStoreRedis.js';
import { RiskService } from './risk/RiskService.js';
import { RiskMiddleware } from './middleware/RiskMiddleware.js';
import { DailyResetScheduler } from './risk/DailyResetScheduler.js';
import { logger } from './utils/logger.js';

async function main() {
  const store = new AccountStoreRedis('demoBot', process.env.REDIS_URL || 'redis://localhost:6379');
  const risk = new RiskService(store, {
    perTradeRisk: Number(process.env.PER_TRADE_RISK) || 0.01,
    dailyDrawdownCap: Number(process.env.DAILY_DRAWDOWN_CAP) || 0.05,
    totalDrawdownCap: Number(process.env.TOTAL_DRAWDOWN_CAP) || 0.10,
    consistencyRule: Number(process.env.CONSISTENCY_RULE) || 0.25
  });
  const rmw = new RiskMiddleware(risk);

  new DailyResetScheduler(async () => { await store.resetDay(); logger.info('Daily reset done'); }).start();

  const setup = { id: 't1', symbol: 'EURUSD', entry: 1.1010, stop: 1.0990 };
  await rmw.handle(setup, async (s, opts) => {
    logger.info({ s, opts }, 'Would execute trade');
  });

  await risk.onTradeClosed(200);
}

main().catch(e => { console.error(e); process.exit(1); });
