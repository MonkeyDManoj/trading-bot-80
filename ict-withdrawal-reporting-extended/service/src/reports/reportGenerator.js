import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { logger } from '../utils/logger.js';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

async function sendSlackNotification(webhookUrl, text) {
  if (!webhookUrl) return { ok: false, reason: 'no_webhook' };
  try {
    const res = await fetch(webhookUrl, { method: 'POST', body: JSON.stringify({ text }), headers: {'Content-Type':'application/json'} });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    logger.error({ err: String(e) }, 'slack notify failed');
    return { ok: false, error: String(e) };
  }
}

async function sendEmail(smtpHost, smtpPort, user, pass, to, subject, text, attachments=[]) {
  if (!smtpHost || !to) return { ok: false, reason: 'email_not_configured' };
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort||587),
      secure: false,
      auth: { user, pass }
    });
    const info = await transporter.sendMail({ from: user, to, subject, text, attachments });
    return { ok: true, info };
  } catch (e) {
    logger.error({ err: String(e) }, 'email send failed');
    return { ok: false, error: String(e) };
  }
}

export async function generateDailyReport(redis, botId='demoBot', opts={}) {
  const accountKey = `risk:account:${botId}`;
  const state = await redis.hgetall(accountKey);
  const tradesKey = `risk:trades:${botId}`;
  const rawTrades = await redis.lrange(tradesKey, 0, 199);
  const trades = rawTrades.map(r => { try { return JSON.parse(r); } catch(e){ return null; }}).filter(Boolean);

  const outDir = process.env.REPORT_OUTPUT_DIR || './service/reports';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const filename = path.join(outDir, `daily_report_${botId}_${Date.now()}.csv`);

  const csvWriter = createObjectCsvWriter({
    path: filename,
    header: [
      {id: 'id', title: 'ID'},
      {id: 'symbol', title: 'Symbol'},
      {id: 'side', title: 'Side'},
      {id: 'entry', title: 'Entry'},
      {id: 'stop', title: 'Stop'},
      {id: 'pnl', title: 'PnL'},
      {id: 'closedAt', title:'ClosedAt'}
    ]
  });

  await csvWriter.writeRecords(trades.map(t => ({
    id: t.id, symbol: t.symbol, side: t.side, entry: t.entry, stop: t.stop, pnl: t.pnl || 0, closedAt: t.closedAt || ''
  })));

  const summary = {
    equity: Number(state.equity || 0),
    realizedToday: Number(state.realizedToday || 0),
    highestEquityToday: Number(state.highestEquityToday || 0),
    totalHighestEquity: Number(state.totalHighestEquity || 0),
    tradesCount: trades.length
  };
  const summaryFile = path.join(outDir, `summary_${botId}_${Date.now()}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  logger.info({ filename, summaryFile }, 'Daily report generated');

  // optional notifications
  const slack = process.env.SLACK_WEBHOOK_URL;
  if (slack) {
    try { await sendSlackNotification(slack, `Daily report for ${botId} generated: ${filename}`); } catch(e){}
  }
  const emailTo = process.env.REPORT_EMAIL_TO;
  if (emailTo && process.env.EMAIL_HOST) {
    try {
      await sendEmail(process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_USER, process.env.EMAIL_PASS, emailTo,
        `Daily report for ${botId}`, JSON.stringify(summary, null, 2), [{ filename: path.basename(filename), path: filename }]);
    } catch(e){}
  }

  return { filename, summaryFile, summary };
}
