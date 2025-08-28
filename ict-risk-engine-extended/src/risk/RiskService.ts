import { AccountStoreRedis } from './AccountStoreRedis.js';
import { PositionSizer } from './PositionSizer.js';
import { logger } from '../utils/logger.js';

export class RiskService {
  constructor(
    private store: AccountStoreRedis,
    private cfg: {
      perTradeRisk: number,
      dailyDrawdownCap: number,
      totalDrawdownCap: number,
      consistencyRule: number
    }
  ) {}

  async determineRisk(symbol: string, entry: number, stop: number) {
    const state = await this.store.getState();
    const equity = state.equity;
    const baseline = equity * this.cfg.perTradeRisk;

    const { lots, reason } = PositionSizer.calculate(symbol, equity, this.cfg.perTradeRisk, entry, stop);
    if (reason !== 'ok') return { allowedLots: 0, reason };

    // Drawdown checks simplified
    const dailyDrawdown = (state.highestEquityToday - equity) / state.highestEquityToday;
    if (dailyDrawdown >= this.cfg.dailyDrawdownCap) return { allowedLots: 0, reason: 'daily_dd_exceeded' };

    const totalDrawdown = (state.totalHighestEquity - equity) / state.totalHighestEquity;
    if (totalDrawdown >= this.cfg.totalDrawdownCap) return { allowedLots: 0, reason: 'total_dd_exceeded' };

    return { allowedLots: lots, reason: 'ok' };
  }

  async onTradeClosed(pnl: number) {
    const state = await this.store.getState();
    const equity = state.equity + pnl;
    const realizedToday = pnl > 0 ? state.realizedToday + pnl : state.realizedToday;
    const highestEquityToday = Math.max(state.highestEquityToday, equity);
    const totalHighestEquity = Math.max(state.totalHighestEquity, equity);
    await this.store.setState({ equity, realizedToday, highestEquityToday, totalHighestEquity });
    logger.info({ pnl, equity }, 'Trade closed updated');
  }
}
