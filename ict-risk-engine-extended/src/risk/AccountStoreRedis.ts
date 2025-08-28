import Redis from 'ioredis';

export class AccountStoreRedis {
  private redis: Redis;
  private key: string;

  constructor(botId: string, url: string) {
    this.redis = new Redis(url);
    this.key = `risk:account:${botId}`;
  }

  async getState() {
    const data = await this.redis.hgetall(this.key);
    return {
      equity: Number(data.equity || 10000),
      realizedToday: Number(data.realizedToday || 0),
      highestEquityToday: Number(data.highestEquityToday || 10000),
      totalHighestEquity: Number(data.totalHighestEquity || 10000)
    };
  }

  async setState(state: any) {
    await this.redis.hmset(this.key, state);
  }

  async resetDay() {
    const state = await this.getState();
    await this.setState({
      ...state,
      realizedToday: 0,
      highestEquityToday: state.equity
    });
  }
}
