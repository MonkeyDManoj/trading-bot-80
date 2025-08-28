export interface TradeLocker {
  lock(key: string, ttlMs?: number): Promise<boolean>;
  unlock(key: string): Promise<void>;
  isLocked(key: string): Promise<boolean>;
}
