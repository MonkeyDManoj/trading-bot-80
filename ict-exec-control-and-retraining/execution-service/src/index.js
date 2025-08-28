import express from 'express';
import 'dotenv/config';
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express();
app.use(express.json());

// internal state
let paused = false;

// control endpoint for Deployment Manager
app.post('/api/control', (req, res) => {
  const { action } = req.body;
  if (!action) return res.status(400).json({ ok: false, error: 'no_action' });
  if (action === 'pause') {
    paused = true;
    logger.warn('Execution paused via control API');
    // TODO: implement safe stop of order processing, flush queues, persist in-progress trades
    return res.json({ ok: true, action: 'paused' });
  } else if (action === 'resume') {
    paused = false;
    logger.info('Execution resumed via control API');
    // TODO: resume processing
    return res.json({ ok: true, action: 'resumed' });
  }
  return res.status(400).json({ ok: false, error: 'unknown_action' });
});

app.get('/api/status', (req, res) => {
  res.json({ ok: true, paused });
});

// stub endpoints representing execution behavior
app.post('/api/execute', (req, res) => {
  if (paused) return res.status(503).json({ ok: false, error: 'execution_paused' });
  // In a real service, you'd enqueue the order and respond with order id / status
  return res.json({ ok: true, message: 'order enqueued (stub)' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info({ port }, 'Execution service stub listening');
});
