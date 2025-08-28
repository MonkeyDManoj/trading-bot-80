import { ExecutionRecord, OrderRequest } from "../types";
import { BrokerAdapter } from "../broker/BrokerAdapter";
import { TradeLocker } from "../tradeLocker/TradeLocker";
import { sleep } from "../utils/helpers";

export class ExecutionQueue {
  private queue: string[] = [];
  private store = new Map<string, ExecutionRecord>();
  private processing = false;

  constructor(private broker: BrokerAdapter, private locker: TradeLocker, private emitEvent: (t: string, p: any) => void) {}

  enqueue(id: string, rec: ExecutionRecord) {
    this.store.set(id, rec);
    this.queue.push(id);
    this.kick();
  }

  get(id: string) { return this.store.get(id); }

  async kick() {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const id = this.queue.shift()!;
        const rec = this.store.get(id);
        if (!rec || rec.status !== "PENDING") continue;
        await this.processRecord(rec);
      }
    } finally { this.processing = false; }
  }

  private async processRecord(rec: ExecutionRecord) {
    const maxAttempts = 5;
    const baseDelay = 200;
    const lockKey = this.createLockKey(rec.request);
    const locked = await this.locker.lock(lockKey, 10_000);
    if (!locked) { rec.status = "REJECTED"; rec.error = "trade-locked-duplicate"; this.emitEvent("execution.rejected", rec); return; }

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        rec.attempts = attempt;
        rec.status = "SENT";
        rec.timestamp = Date.now();
        this.emitEvent("execution.sent", rec);
        const start = Date.now();
        try {
          const res = await this.broker.sendOrder(rec.request);
          rec.brokerOrderId = res.brokerOrderId;
          rec.status = res.filled ? "FILLED" : "SENT";
          rec.latencyMs = Date.now() - start;
          rec.slippage = this.calculateSlippage(rec.request, res.filledPrice);
          this.emitEvent("execution.filled", rec);
          break;
        } catch (err: any) {
          rec.error = String(err?.message ?? err);
          this.emitEvent("execution.error", rec);
          if (attempt === maxAttempts) { rec.status = "FAILED"; this.emitEvent("execution.failed", rec); break; }
          await sleep(baseDelay * Math.pow(2, attempt - 1) + Math.random() * 100);
        }
      }
    } finally { await this.locker.unlock(lockKey); }
  }

  private createLockKey(req: OrderRequest) {
    if (req.clientId) return `client:${req.clientId}`;
    return `trade:${req.symbol}:${req.side}:${req.volume}:${req.type ?? "MARKET"}`;
  }

  private calculateSlippage(req: OrderRequest, filledPrice?: number) {
    if (!filledPrice || !req.price) return undefined;
    return Math.abs(filledPrice - req.price);
  }
}
