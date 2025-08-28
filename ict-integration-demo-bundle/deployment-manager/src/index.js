import 'dotenv/config';
import Redis from 'ioredis';
import fetch from 'node-fetch';
import { logger } from './utils/logger.js';

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
const EXEC_URL = process.env.EXEC_URL || 'http://execution-service:3001';
const BOT_ID = process.env.BOT_ID || 'demoBot';
const CHECK_INTERVAL = Number(process.env.CHECK_INTERVAL || 5000);
const DAILY_CAP = Number(process.env.DAILY_DD_CAP || 0.05);
const TOTAL_CAP = Number(process.env.TOTAL_DD_CAP || 0.10);

async function getState(){
  const key = `risk:account:${BOT_ID}`;
  return await redis.hgetall(key);
}

let paused = false;
async function check(){
  try{
    const state = await getState();
    const equity = Number(state.equity||10000);
    const highest = Number(state.highestEquityToday||10000);
    const totalHigh = Number(state.totalHighestEquity||10000);
    const dailyDD = (highest - equity)/Math.max(1, highest);
    const totalDD = (totalHigh - equity)/Math.max(1, totalHigh);
    logger.info({ dailyDD, totalDD, equity}, 'monitor');
    if((dailyDD>=DAILY_CAP || totalDD>=TOTAL_CAP) && !paused){
      // trigger pause
      await fetch(`${EXEC_URL}/api/control`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'pause' }) });
      paused = true;
      logger.warn('Triggered pause due to drawdown');
    } else if((dailyDD<DAILY_CAP && totalDD<TOTAL_CAP) && paused){
      await fetch(`${EXEC_URL}/api/control`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'resume' }) });
      paused = false;
      logger.info('Resumed execution as drawdown recovered');
    }
  }catch(e){ logger.error({err:String(e)}, 'check failed'); }
}

setInterval(check, CHECK_INTERVAL);
logger.info('Deployment Manager started');
