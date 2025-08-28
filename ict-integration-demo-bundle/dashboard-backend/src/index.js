import 'dotenv/config';
import express from 'express';
import Redis from 'ioredis';
import fetch from 'node-fetch';
import { logger } from './utils/logger.js';

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
const EXEC_URL = process.env.EXEC_URL || 'http://execution-service:3001';

app.get('/api/trades', async (req,res)=>{
  const bot = req.query.bot || 'demoBot';
  const key = `risk:trades:${bot}`;
  const raw = await redis.lrange(key, 0, 199);
  const trades = raw.map(r=>{ try{return JSON.parse(r);}catch(e){return null}}).filter(Boolean);
  res.json({ ok:true, trades });
});

app.get('/api/metrics', async (req,res)=>{
  const bot = req.query.bot || 'demoBot';
  const key = `risk:account:${bot}`;
  const state = await redis.hgetall(key);
  res.json({ ok:true, metrics: state });
});

app.get('/api/status', async (req,res)=>{
  try{
    const r = await fetch(`${EXEC_URL}/api/status`);
    const json = await r.json();
    res.json({ ok:true, execStatus: json });
  }catch(e){
    res.json({ ok:false, error: String(e) });
  }
});

// actions: pause/resume via exec service
app.post('/api/actions', async (req,res)=>{
  const { action } = req.body;
  if(!['pause','resume'].includes(action)) return res.status(400).json({ ok:false, error:'invalid_action' });
  try{
    const r = await fetch(`${EXEC_URL}/api/control`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action }) });
    const json = await r.json();
    res.json({ ok:true, result: json });
  }catch(e){ res.status(500).json({ ok:false, error: String(e) }); }
});

const port = Number(process.env.PORT||4000);
app.listen(port, ()=> logger.info({ port }, 'Dashboard Backend listening'));
