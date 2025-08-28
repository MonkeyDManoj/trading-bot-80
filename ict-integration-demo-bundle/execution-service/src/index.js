import express from 'express';
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
app.use(express.json());

let paused = false;

// control endpoints for Deployment Manager / Dashboard Backend
app.post('/api/control', (req, res) => {
  const { action } = req.body;
  if (action === 'pause') {
    paused = true;
    logger.warn('Execution paused via control API');
    return res.json({ ok:true, action:'paused' });
  } else if (action === 'resume') {
    paused = false;
    logger.info('Execution resumed via control API');
    return res.json({ ok:true, action:'resumed' });
  }
  return res.status(400).json({ ok:false, error:'unknown_action' });
});

app.get('/api/status', (req,res)=> res.json({ ok:true, paused }));

// enqueue execution (simulated)
app.post('/api/execute', (req,res)=>{
  if (paused) return res.status(503).json({ ok:false, error:'execution_paused' });
  // simulate immediate execution and return fake order id
  const id = 'ord-'+Date.now();
  logger.info({ id, order:req.body }, 'Order executed (simulated)');
  return res.json({ ok:true, id });
});

const port = Number(process.env.PORT||3001);
app.listen(port, ()=> logger.info({ port }, 'Execution Service listening'));
