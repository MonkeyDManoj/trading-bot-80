import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";
import { ExecutionRecord, OrderRequest } from "../types";
import { BrokerAdapter } from "../broker/BrokerAdapter";
import { TradeLocker } from "../tradeLocker/TradeLocker";
import { ExecutionQueue } from "./ExecutionQueue";
import { OrderSafety } from "./OrderSafety";

export class ExecutionService {
  private executionQueue: ExecutionQueue;
  private records = new Map<string, ExecutionRecord>();
  private safety: OrderSafety;
  private broadcasts = new Set<WebSocket>();

  constructor(private broker: BrokerAdapter, private locker: TradeLocker) {
    this.executionQueue = new ExecutionQueue(this.broker, this.locker, (t, p) => this.broadcast(t, p));
    this.safety = new OrderSafety();
  }

  async start() { await this.broker.connect(); }
  async stop() { await this.broker.disconnect(); }

  async submitOrder(req: OrderRequest) {
    const id = uuidv4();
    const rec: ExecutionRecord = { id, request: req, status: "PENDING", attempts: 0, timestamp: Date.now() };

    const openTrades = Array.from(this.records.values()).filter(r => r.request.symbol === req.symbol);
    const safety = await this.safety.validate(req, openTrades);
    if (!safety.ok) { rec.status = "REJECTED"; rec.error = safety.reason; this.records.set(id, rec); this.broadcast("execution.rejected", rec); return rec; }

    if (req.clientId) {
      const existing = Array.from(this.records.values()).find(r => r.request.clientId === req.clientId);
      if (existing) return existing;
    }

    this.records.set(id, rec);
    this.executionQueue.enqueue(id, rec);
    this.broadcast("execution.queued", rec);
    return rec;
  }

  getStatus(id: string) { return this.records.get(id); }

  attachWebSocket(ws: WebSocket) { this.broadcasts.add(ws); ws.on("close", () => this.broadcasts.delete(ws)); }

  private broadcast(topic: string, payload: any) {
    const msg = JSON.stringify({ topic, payload });
    for (const ws of this.broadcasts) if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }

  // Called by Broker Adapter (onUpdate) to process external status updates
  public processExternalUpdate(update: { orderId: string; status: string; filledPrice?: number; raw?: any }) {
    const rec = Array.from(this.records.values()).find(r => r.brokerOrderId === update.orderId);
    if (!rec) return;
    if (update.status === 'filled') {
      rec.status = 'FILLED';
      rec.timestamp = Date.now();
      rec.slippage = update.filledPrice ? Math.abs((rec.request.price ?? update.filledPrice) - update.filledPrice) : rec.slippage;
      this.broadcast('execution.filled', rec);
    } else if (update.status === 'cancelled') {
      rec.status = 'CANCELLED';
      this.broadcast('execution.cancelled', rec);
    } else if (update.status === 'rejected') {
      rec.status = 'REJECTED';
      this.broadcast('execution.rejected', rec);
    }
  }
}
