export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  dailyStartBalance: number;
  totalProfit: number;
  dailyProfit: number;
  maxDailyProfit: number;
  isKillSwitchActive: boolean;
  createdAt: string;
  lastResetDate: string;
}

export interface Trade {
  id: string;
  accountId: string;
  symbol: string;
  lotSize: number;
  entryPrice: number;
  exitPrice?: number;
  type: 'BUY' | 'SELL';
  status: 'OPEN' | 'CLOSED';
  pnl: number;
  timestamp: string;
  approvalStatus: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface RiskParameters {
  maxDailyDrawdownPercent: number;
  maxTotalDrawdownPercent: number;
  maxSingleDayProfitPercent: number;
  defaultRiskPercentPerTrade: number;
}

export interface TradeApprovalRequest {
  symbol: string;
  lotSize: number;
  type: 'BUY' | 'SELL';
  riskAmount: number;
}

export interface ApprovalResult {
  approved: boolean;
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}