import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import WebSocket from 'ws';
import { BrokerAdapter } from './BrokerAdapter';
import { OrderRequest } from '../types';

export interface TradeLockerConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret?: string;
  timeoutMs?: number;
  wsUrl?: string;
}

export type TradeLockerOnUpdate = (update: { orderId: string; status: string; filledPrice?: number; raw?: any }) => void;

export class TradeLockerAdapter implements BrokerAdapter {
  name = 'tradelocker';
  private client!: AxiosInstance;
  private ws?: WebSocket;
  private connected = false;
  private onUpdate?: TradeLockerOnUpdate;

  constructor(private cfg: TradeLockerConfig, onUpdate?: TradeLockerOnUpdate) {
    this.onUpdate = onUpdate;
  }

  async connect() {
    this.client = axios.create({ baseURL: this.cfg.baseUrl, timeout: this.cfg.timeoutMs ?? 10000 });
    try {
      const res = await this.request('GET', '/v1/ping');
      if (res && res.status === 200) this.connected = true;
    } catch (err) {
      this.connected = false;
      throw new Error('tradelocker-connect-failed: ' + String(err));
    }

    if (this.cfg.wsUrl) {
      this.initWebSocket(this.cfg.wsUrl);
    }
  }

  private initWebSocket(wsUrl: string) {
    this.ws = new WebSocket(wsUrl, { headers: { 'X-API-KEY': this.cfg.apiKey } });
    this.ws.on('open', () => console.log('tradelocker-ws-open'));
    this.ws.on('message', (msg) => this.handleWsMessage(msg.toString()));
    this.ws.on('close', () => {
      console.log('tradelocker-ws-closed, reconnect in 2s');
      setTimeout(() => this.initWebSocket(wsUrl), 2000);
    });
    this.ws.on('error', (e) => console.error('tradelocker-ws-error', e));
  }

  private handleWsMessage(raw: string) {
    try {
      const data = JSON.parse(raw);
      if (data && data.type === 'order.update' && this.onUpdate) {
        this.onUpdate({ orderId: data.orderId, status: data.status, filledPrice: data.filledPrice, raw: data });
      }
    } catch (e) { console.warn('invalid-ws-payload', e); }
  }

  async disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close();
    this.connected = false;
  }

  async sendOrder(request: OrderRequest) {
    if (!this.connected) await this.connect();
    const payload = this.mapToTradeLockerPayload(request);
    try {
      const res = await this.request('POST', '/v1/orders', payload);
      const body = res.data;
      if (body.error) throw new Error(String(body.error));
      return { brokerOrderId: body.orderId as string, filled: body.status === 'accepted', filledPrice: body.filledPrice };
    } catch (err: any) {
      throw new Error('tradelocker-send-order-failed: ' + String(err?.message ?? err));
    }
  }

  async cancelOrder(brokerOrderId: string) {
    if (!this.connected) await this.connect();
    try {
      const res = await this.request('POST', `/v1/orders/${brokerOrderId}/cancel`);
      return res.status === 200;
    } catch (err) { return false; }
  }

  async getOrderStatus(brokerOrderId: string) {
    if (!this.connected) await this.connect();
    const res = await this.request('GET', `/v1/orders/${brokerOrderId}`);
    return res.data;
  }

  private mapToTradeLockerPayload(req: OrderRequest) {
    return {
      clientOrderId: req.clientId ?? undefined,
      symbol: req.symbol,
      side: req.side.toLowerCase(),
      qty: req.volume,
      type: req.type?.toLowerCase() ?? 'market',
      price: req.price,
      meta: req.meta ?? {},
    };
  }

  private async request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, data?: any) {
    const ts = Date.now().toString();
    const headers: Record<string, string> = { 'X-API-KEY': this.cfg.apiKey, 'X-TS': ts };
    if (this.cfg.apiSecret) {
      const pre = `${ts}.${method}.${path}.${data ? JSON.stringify(data) : ''}`;
      const sig = crypto.createHmac('sha256', this.cfg.apiSecret).update(pre).digest('hex');
      headers['X-SIGNATURE'] = sig;
    }
    return this.client.request({ url: path, method, data, headers });
  }
}
