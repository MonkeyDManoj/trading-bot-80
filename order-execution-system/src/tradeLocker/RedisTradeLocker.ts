import { createClient, RedisClientType } from 'redis';
import { TradeLocker } from './TradeLocker';

export class RedisTradeLocker implements TradeLocker {
  private client: RedisClientType;
  private prefix = 'lock:';

  constructor(private url: string, private defaultTtl = 30_000) {
    this.client = createClient({ url });
    this.client.on('error', (e) => console.error('redis-error', e));
  }

  async connect() {
    if (!this.client.isOpen) await this.client.connect();
  }

  async lock(key: string, ttlMs = this.defaultTtl): Promise<boolean> {
    await this.connect();
    const res = await this.client.set(this.prefix + key, '1', { NX: true, PX: ttlMs });
    return res === 'OK';
  }

  async unlock(key: string): Promise<void> {
    await this.connect();
    await this.client.del(this.prefix + key);
  }

  async isLocked(key: string): Promise<boolean> {
    await this.connect();
    const ttl = await this.client.pTTL(this.prefix + key);
    return ttl > 0;
  }
}
