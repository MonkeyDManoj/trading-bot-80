import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import { WebSocketServer } from 'ws';
import { ExecutionService } from './execution/ExecutionService';
import { MockBrokerAdapter } from './broker/MockBrokerAdapter';
import { TradeLockerAdapter } from './broker/TradeLockerAdapter';
import { InMemoryTradeLocker } from './tradeLocker/InMemoryTradeLocker';
import { RedisTradeLocker } from './tradeLocker/RedisTradeLocker';

const PORT = Number(process.env.PORT || 3001);

async function main() {
  const app = express();
  app.use(bodyParser.json());
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  const useRedis = String(process.env.USE_REDIS || 'false') === 'true';
  const locker = useRedis ? new RedisTradeLocker(process.env.REDIS_URL || 'redis://localhost:6379', Number(process.env.REDIS_LOCK_TTL_MS || 30000)) : new InMemoryTradeLocker();

  let brokerAdapter;
  let execService: ExecutionService;

  if (process.env.TRADELOCKER_BASE_URL && process.env.TRADELOCKER_API_KEY) {
    const adapter = new TradeLockerAdapter({ baseUrl: process.env.TRADELOCKER_BASE_URL, apiKey: process.env.TRADELOCKER_API_KEY, apiSecret: process.env.TRADELOCKER_API_SECRET, wsUrl: process.env.TRADELOCKER_WS_URL }, (update) => {
      setImmediate(() => execService.processExternalUpdate(update));
    });
    brokerAdapter = adapter;
  } else {
    brokerAdapter = new MockBrokerAdapter();
  }

  execService = new ExecutionService(brokerAdapter, locker);
  await execService.start();

  wss.on('connection', (ws) => { execService.attachWebSocket(ws); ws.send(JSON.stringify({ topic: 'connection', payload: { ok: true } })); });

  app.post('/order', async (req, res) => {
    try { const rec = await execService.submitOrder(req.body); res.json(rec); }
    catch (err: any) { res.status(500).json({ error: String(err?.message ?? err) }); }
  });

  app.get('/status/:id', (req, res) => { const rec = execService.getStatus(req.params.id); if (!rec) return res.status(404).json({ error: 'not-found' }); res.json(rec); });
  app.get('/health', (_, res) => res.json({ ok: true, time: Date.now() }));

  server.listen(PORT, () => console.log(`Order Execution System listening on ${PORT}`));
}

main().catch(e => console.error(e));
