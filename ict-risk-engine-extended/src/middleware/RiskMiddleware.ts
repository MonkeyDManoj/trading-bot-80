import { RiskService } from '../risk/RiskService.js';
import { logger } from '../utils/logger.js';

export class RiskMiddleware {
  constructor(private risk: RiskService) {}

  async handle(setup: any, next: (setup: any, opts?: { lots?: number }) => Promise<void>) {
    const res = await this.risk.determineRisk(setup.symbol, setup.entry, setup.stop);
    logger.info({ setupId: setup.id, res }, 'Risk check');
    if (res.allowedLots <= 0) {
      logger.warn({ setupId: setup.id, reason: res.reason }, 'Trade blocked');
      return;
    }
    await next(setup, { lots: res.allowedLots });
  }
}
