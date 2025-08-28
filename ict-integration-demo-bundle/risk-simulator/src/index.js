import 'dotenv/config';
import Redis from 'ioredis';
import { logger } from './utils/logger.js';
import { pushClosedTrade } from '../../helpers/pushClosedTrade.js';

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
const BOT_ID = process.env.BOT_ID || 'demoBot';

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function initAccount(){
  // initialize account state
  await redis.hmset(`risk:account:${BOT_ID}`, { equity: 10000, realizedToday: 0, highestEquityToday: 10000, totalHighestEquity: 10000 });
  console.log('Account initialized');
}

let counter = 0;
async function simulateTradeClose(){
  counter++;
  const pnl = Math.round((Math.random()*400 - 100)); // -100..300
  const trade = { id: 't-'+Date.now(), symbol: 'EURUSD', side: (Math.random()>0.5?'buy':'sell'), entry:1.1, stop:1.09, pnl, closedAt: Date.now() };
  // update account
  const key = `risk:account:${BOT_ID}`;
  const state = await redis.hgetall(key);
  const equity = Number(state.equity || 10000) + pnl;
  const realizedToday = Number(state.realizedToday || 0) + (pnl>0? pnl: 0);
  const highestEquityToday = Math.max(Number(state.highestEquityToday||10000), equity);
  const totalHighestEquity = Math.max(Number(state.totalHighestEquity||10000), equity);
  await redis.hmset(key, { equity, realizedToday, highestEquityToday, totalHighestEquity });
  // push closed trade
  await pushClosedTrade(process.env.REDIS_URL||'redis://redis:6379', BOT_ID, trade);
  console.log('Simulated closed trade:', trade.id, 'pnl', pnl);
}

async function main(){
  await initAccount();
  while(true){
    await simulateTradeClose();
    await sleep(5000); // every 5s
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });
