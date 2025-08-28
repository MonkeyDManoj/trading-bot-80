import { TradeLocker } from "./TradeLocker";

export class InMemoryTradeLocker implements TradeLocker {
  private locks = new Map<string, number>();

  async lock(key: string, ttlMs = 30_000): Promise<boolean> {
    const now = Date.now();
    const expires = this.locks.get(key);
    if (expires && expires > now) return false;
    this.locks.set(key, now + ttlMs);
    return true;
  }

  async unlock(key: string): Promise<void> {
    this.locks.delete(key);
  }

  async isLocked(key: string): Promise<boolean> {
    const expires = this.locks.get(key);
    return !!expires && expires > Date.now();
  }
}
