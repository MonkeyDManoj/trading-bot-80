export type Side = "BUY" | "SELL";

export interface OrderRequest {
  clientId?: string;
  symbol: string;
  side: Side;
  volume: number;
  price?: number;
  type?: "MARKET" | "LIMIT" | "STOP";
  meta?: Record<string, any>;
}

export interface ExecutionRecord {
  id: string;
  request: OrderRequest;
  status: "PENDING" | "SENT" | "FILLED" | "REJECTED" | "FAILED" | "CANCELLED";
  attempts: number;
  error?: string;
  brokerOrderId?: string;
  timestamp: number;
  latencyMs?: number;
  slippage?: number;
}
