/**
 * Usage (Node/TS):
 *   import { pushClosedTrade } from './helpers/pushClosedTrade.js';
 *   await pushClosedTrade(redisUrl, 'demoBot', tradeObject);
 *
 * tradeObject should be a plain JSON object with at least { id, symbol, side, entry, stop, pnl, closedAt }
 */
import Redis from 'ioredis';

export async function pushClosedTrade(redisUrl, botId, trade) {
  const r = new Redis(redisUrl);
  const key = `risk:trades:${botId}`;
  await r.lpush(key, JSON.stringify(trade));
  // keep list capped to 1000
  await r.ltrim(key, 0, 999);
  r.disconnect();
}
