import React, { useState } from 'react';
import { Account, RiskParameters, TradeApprovalRequest } from '../types';
import { validateTrade, formatCurrency } from '../utils/calculations';
import { CheckCircle, XCircle, AlertTriangle, FileCheck } from 'lucide-react';

interface TradeApprovalCheckerProps {
  account: Account;
  riskParams: RiskParameters;
}

export const TradeApprovalChecker: React.FC<TradeApprovalCheckerProps> = ({ account, riskParams }) => {
  const [tradeRequest, setTradeRequest] = useState<TradeApprovalRequest>({
    symbol: 'EURUSD',
    lotSize: 0.1,
    type: 'BUY',
    riskAmount: 100
  });

  const approval = validateTrade(account, tradeRequest, riskParams);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-500';
      case 'MEDIUM': return 'text-yellow-500';
      case 'HIGH': return 'text-orange-500';
      case 'CRITICAL': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'LOW': return <CheckCircle className="w-5 h-5" />;
      case 'MEDIUM': case 'HIGH': return <AlertTriangle className="w-5 h-5" />;
      case 'CRITICAL': return <XCircle className="w-5 h-5" />;
      default: return <FileCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <FileCheck className="w-5 h-5" />
        Trade Approval Checker
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Symbol
          </label>
          <input
            type="text"
            value={tradeRequest.symbol}
            onChange={(e) => setTradeRequest(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="EURUSD"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Lot Size
          </label>
          <input
            type="number"
            value={tradeRequest.lotSize}
            onChange={(e) => setTradeRequest(prev => ({ ...prev, lotSize: Math.max(0.01, parseFloat(e.target.value) || 0) }))}
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Type
          </label>
          <select
            value={tradeRequest.type}
            onChange={(e) => setTradeRequest(prev => ({ ...prev, type: e.target.value as 'BUY' | 'SELL' }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Risk Amount ($)
          </label>
          <input
            type="number"
            value={tradeRequest.riskAmount}
            onChange={(e) => setTradeRequest(prev => ({ ...prev, riskAmount: Math.max(1, parseFloat(e.target.value) || 0) }))}
            min="1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className={`p-4 rounded-lg border-2 ${
        approval.approved 
          ? 'bg-green-900 bg-opacity-30 border-green-500' 
          : 'bg-red-900 bg-opacity-30 border-red-500'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={approval.approved ? 'text-green-500' : 'text-red-500'}>
            {approval.approved ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <div>
            <div className={`text-2xl font-bold ${approval.approved ? 'text-green-500' : 'text-red-500'}`}>
              {approval.approved ? 'APPROVED' : 'REJECTED'}
            </div>
            <div className={`text-sm flex items-center gap-2 ${getRiskLevelColor(approval.riskLevel)}`}>
              {getRiskLevelIcon(approval.riskLevel)}
              Risk Level: {approval.riskLevel}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-300">
          <strong>Reason:</strong> {approval.reason}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Trade Details</div>
            <div className="text-white">
              {tradeRequest.symbol} • {tradeRequest.type} • {tradeRequest.lotSize} lots
            </div>
          </div>
          <div>
            <div className="text-gray-400">Risk Amount</div>
            <div className="text-white font-semibold">
              {formatCurrency(tradeRequest.riskAmount)}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Risk %</div>
            <div className="text-white font-semibold">
              {((tradeRequest.riskAmount / account.currentBalance) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};