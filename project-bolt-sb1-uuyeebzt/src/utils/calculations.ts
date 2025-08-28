import { Account, RiskParameters, TradeApprovalRequest, ApprovalResult } from '../types';

export const calculateDrawdownPercent = (currentBalance: number, peakBalance: number): number => {
  if (peakBalance <= 0) return 0;
  return Math.max(0, ((peakBalance - currentBalance) / peakBalance) * 100);
};

export const calculateDailyDrawdownPercent = (currentBalance: number, dailyStartBalance: number): number => {
  if (dailyStartBalance <= 0) return 0;
  return Math.max(0, ((dailyStartBalance - currentBalance) / dailyStartBalance) * 100);
};

export const calculateLotSize = (
  accountEquity: number,
  riskPercent: number,
  stopLossInPips: number,
  pipValue: number = 10 // Standard for most pairs
): number => {
  const riskAmount = (accountEquity * riskPercent) / 100;
  const lotSize = riskAmount / (stopLossInPips * pipValue);
  return Math.round(lotSize * 100) / 100; // Round to 2 decimal places
};

export const validateTrade = (
  account: Account,
  tradeRequest: TradeApprovalRequest,
  riskParams: RiskParameters
): ApprovalResult => {
  const { currentBalance, dailyStartBalance, initialBalance, dailyProfit, maxDailyProfit } = account;
  
  // Check if kill switch is active
  if (account.isKillSwitchActive) {
    return {
      approved: false,
      reason: 'Kill switch is active - all trading disabled',
      riskLevel: 'CRITICAL'
    };
  }

  // Check daily drawdown limit
  const currentDailyDrawdown = calculateDailyDrawdownPercent(currentBalance, dailyStartBalance);
  const worstCaseBalance = currentBalance - tradeRequest.riskAmount;
  const potentialDailyDrawdown = calculateDailyDrawdownPercent(worstCaseBalance, dailyStartBalance);
  
  if (potentialDailyDrawdown > riskParams.maxDailyDrawdownPercent) {
    return {
      approved: false,
      reason: `Trade would exceed daily drawdown limit (${riskParams.maxDailyDrawdownPercent}%). Current: ${currentDailyDrawdown.toFixed(2)}%, Potential: ${potentialDailyDrawdown.toFixed(2)}%`,
      riskLevel: 'CRITICAL'
    };
  }

  // Check total drawdown limit
  const potentialTotalDrawdown = calculateDrawdownPercent(worstCaseBalance, initialBalance);
  
  if (potentialTotalDrawdown > riskParams.maxTotalDrawdownPercent) {
    return {
      approved: false,
      reason: `Trade would exceed total drawdown limit (${riskParams.maxTotalDrawdownPercent}%). Potential: ${potentialTotalDrawdown.toFixed(2)}%`,
      riskLevel: 'CRITICAL'
    };
  }

  // Check consistency rule (max 25% of total profit in single day)
  const totalProfit = Math.max(account.totalProfit, 1); // Avoid division by zero
  const currentDailyProfitPercent = (dailyProfit / totalProfit) * 100;
  
  if (currentDailyProfitPercent > riskParams.maxSingleDayProfitPercent && dailyProfit > 0) {
    return {
      approved: false,
      reason: `Daily profit exceeds consistency rule (${riskParams.maxSingleDayProfitPercent}% of total profit). Current: ${currentDailyProfitPercent.toFixed(2)}%`,
      riskLevel: 'HIGH'
    };
  }

  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  
  if (potentialDailyDrawdown > riskParams.maxDailyDrawdownPercent * 0.8) {
    riskLevel = 'HIGH';
  } else if (potentialDailyDrawdown > riskParams.maxDailyDrawdownPercent * 0.6) {
    riskLevel = 'MEDIUM';
  }

  return {
    approved: true,
    reason: 'Trade approved - within all risk parameters',
    riskLevel
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (percent: number, decimals: number = 2): string => {
  return `${percent.toFixed(decimals)}%`;
};