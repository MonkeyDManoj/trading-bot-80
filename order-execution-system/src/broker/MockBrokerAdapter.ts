import { BrokerAdapter } from "./BrokerAdapter";
import { OrderRequest } from "../types";

export class MockBrokerAdapter implements BrokerAdapter {
  name = "mock-broker";
  private connected = false;

  async connect() { this.connected = true; console.log('[MockBroker] connected'); }
  async disconnect() { this.connected = false; console.log('[MockBroker] disconnected'); }

  async sendOrder(request: OrderRequest) {
    if (!this.connected) throw new Error("broker-not-connected");
    await new Promise((r) => setTimeout(r, 50 + Math.random() * 200));
    if (Math.random() < 0.03) throw new Error("broker-reject: liquidity");
    const brokerOrderId = `MOCK-${Math.floor(Math.random() * 1e9)}`;
    return { brokerOrderId, filled: true, filledPrice: request.price ?? (1 + Math.random() * 0.001) };
  }

  getLatency() { return 50 + Math.random() * 200; }
}
