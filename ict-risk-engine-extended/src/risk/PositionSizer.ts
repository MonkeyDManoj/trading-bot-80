import instruments from '../../instruments.json' assert { type: 'json' };

export class PositionSizer {
  static calculate(symbol: string, equity: number, perTradeRisk: number, entry: number, stop: number) {
    const meta = (instruments as any)[symbol];
    if (!meta) {
      return { lots: 0, reason: 'unknown_symbol' };
    }
    const riskAmount = equity * perTradeRisk;
    const distance = Math.abs(entry - stop);
    if (distance <= 0) return { lots: 0, reason: 'invalid_stop' };
    const riskPerLot = distance / meta.tickSize * meta.pipValue;
    const lots = riskAmount / riskPerLot;
    return { lots, reason: 'ok', meta };
  }
}
