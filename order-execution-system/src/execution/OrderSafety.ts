import { OrderRequest, ExecutionRecord } from "../types";

export class OrderSafety {
  constructor(private maxVolumePerTrade = 10, private maxOpenTradesPerSymbol = 3) {}

  async validate(request: OrderRequest, currentOpenTrades: ExecutionRecord[]): Promise<{ ok: boolean; reason?: string }>
  {
    if (!request.symbol) return { ok: false, reason: "missing-symbol" };
    if (request.volume <= 0) return { ok: false, reason: "invalid-volume" };
    if (request.volume > this.maxVolumePerTrade) return { ok: false, reason: "volume-limit" };

    const openForSymbol = currentOpenTrades.filter(t => t.status === "FILLED" || t.status === "SENT").length;
    if (openForSymbol >= this.maxOpenTradesPerSymbol) return { ok: false, reason: "too-many-open-trades-for-symbol" };

    return { ok: true };
  }
}
