import { OrderRequest } from "../types";

export interface BrokerAdapter {
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendOrder(request: OrderRequest): Promise<{ brokerOrderId: string; filled?: boolean; filledPrice?: number }>;
  cancelOrder?(brokerOrderId: string): Promise<boolean>;
  getLatency?(): number;
}
