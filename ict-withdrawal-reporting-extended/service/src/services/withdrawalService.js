import fetch from 'node-fetch';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

export class WithdrawalService {
  constructor(providerUrl, providerSecret) {
    this.providerUrl = providerUrl;
    this.providerSecret = providerSecret;
  }

  async triggerWithdrawal(amount, account) {
    logger.info({ amount, account }, 'Triggering withdrawal');
    if (!this.providerUrl) {
      return { success: true, amount, txId: 'mock-' + Date.now() };
    }
    try {
      const payload = { amount, account, ts: Date.now() };
      const body = JSON.stringify(payload);
      let headers = { 'Content-Type': 'application/json' };
      if (this.providerSecret) {
        const sig = crypto.createHmac('sha256', this.providerSecret).update(body).digest('hex');
        headers['X-Signature'] = sig;
      }
      const res = await fetch(this.providerUrl, { method: 'POST', headers, body });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error('provider error: ' + txt);
      }
      const data = await res.json();
      return { success: true, ...data };
    } catch (e) {
      logger.error({ err: String(e) }, 'withdrawal failed');
      return { success: false, error: String(e) };
    }
  }
}
