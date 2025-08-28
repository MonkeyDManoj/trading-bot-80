import React from 'react';
import { Account, RiskParameters } from '../types';
import { calculateDrawdownPercent, calculateDailyDrawdownPercent, formatCurrency, formatPercentage } from '../utils/calculations';
import { AlertTriangle, Shield, TrendingUp, TrendingDown } from 'lucide-react';

interface RiskDashboardProps {
  account: Account;
  riskParams: RiskParameters;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({ account, riskParams }) => {
  const dailyDrawdown = calculateDailyDrawdownPercent(account.currentBalance, account.dailyStartBalance);
  const totalDrawdown = calculateDrawdownPercent(account.currentBalance, account.initialBalance);
  
  const getDailyDrawdownColor = () => {
    if (dailyDrawdown >= riskParams.maxDailyDrawdownPercent * 0.8) return 'text-red-500';
    if (dailyDrawdown >= riskParams.maxDailyDrawdownPercent * 0.6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTotalDrawdownColor = () => {
    if (totalDrawdown >= riskParams.maxTotalDrawdownPercent * 0.8) return 'text-red-500';
    if (totalDrawdown >= riskParams.maxTotalDrawdownPercent * 0.6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressBarColor = (current: number, max: number) => {
    const percent = (current / max) * 100;
    if (percent >= 80) return 'bg-red-500';
    if (percent >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Risk Dashboard
        </h2>
        {account.isKillSwitchActive && (
          <div className="flex items-center gap-2 text-red-500 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            KILL SWITCH ACTIVE
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Current Balance</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(account.currentBalance)}</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Daily P&L</div>
          <div className={`text-2xl font-bold flex items-center gap-1 ${account.dailyProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {account.dailyProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {formatCurrency(account.dailyProfit)}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total Profit</div>
          <div className={`text-2xl font-bold ${account.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(account.totalProfit)}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Account Equity</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(account.initialBalance + account.totalProfit)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Daily Drawdown</h3>
            <span className={`font-bold ${getDailyDrawdownColor()}`}>
              {formatPercentage(dailyDrawdown)} / {formatPercentage(riskParams.maxDailyDrawdownPercent)}
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(dailyDrawdown, riskParams.maxDailyDrawdownPercent)}`}
              style={{ width: `${Math.min((dailyDrawdown / riskParams.maxDailyDrawdownPercent) * 100, 100)}%` }}
            />
          </div>
          <div className="text-sm text-gray-400">
            Remaining: {formatCurrency(account.dailyStartBalance * (riskParams.maxDailyDrawdownPercent - dailyDrawdown) / 100)}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Total Drawdown</h3>
            <span className={`font-bold ${getTotalDrawdownColor()}`}>
              {formatPercentage(totalDrawdown)} / {formatPercentage(riskParams.maxTotalDrawdownPercent)}
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(totalDrawdown, riskParams.maxTotalDrawdownPercent)}`}
              style={{ width: `${Math.min((totalDrawdown / riskParams.maxTotalDrawdownPercent) * 100, 100)}%` }}
            />
          </div>
          <div className="text-sm text-gray-400">
            Remaining: {formatCurrency(account.initialBalance * (riskParams.maxTotalDrawdownPercent - totalDrawdown) / 100)}
          </div>
        </div>
      </div>

      {account.totalProfit > 0 && (
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Consistency Rule</h3>
          <div className="text-sm text-gray-400 mb-2">
            Daily profit as % of total profit: {formatPercentage((account.dailyProfit / account.totalProfit) * 100)} / {formatPercentage(riskParams.maxSingleDayProfitPercent)}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                (account.dailyProfit / account.totalProfit) * 100 > riskParams.maxSingleDayProfitPercent ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(((account.dailyProfit / account.totalProfit) * 100 / riskParams.maxSingleDayProfitPercent) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};