/**
 * helpers/pushClosedTrade.js
 * Usage: import { pushClosedTrade } from './helpers/pushClosedTrade.js';
 * pushClosedTrade(redisUrl, botId, tradeObject)
 */
import Redis from 'ioredis';

export async function pushClosedTrade(redisUrl, botId, trade) {
  const r = new Redis(redisUrl);
  const key = `risk:trades:${botId}`;
  await r.lpush(key, JSON.stringify(trade));
  await r.ltrim(key, 0, 999);
  r.disconnect();
}
