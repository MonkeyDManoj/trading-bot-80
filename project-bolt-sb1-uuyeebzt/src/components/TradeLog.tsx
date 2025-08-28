import React, { useState } from 'react';
import { Trade, Account } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Download, FileText, Filter } from 'lucide-react';

interface TradeLogProps {
  trades: Trade[];
  account: Account;
}

export const TradeLog: React.FC<TradeLogProps> = ({ trades, account }) => {
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  const filteredTrades = trades.filter(trade => 
    trade.accountId === account.id && (filter === 'ALL' || trade.status === filter)
  );

  const exportToCSV = () => {
    const headers = ['Date', 'Symbol', 'Type', 'Lot Size', 'Entry Price', 'Exit Price', 'Status', 'P&L', 'Approval Status'];
    const rows = filteredTrades.map(trade => [
      new Date(trade.timestamp).toLocaleString(),
      trade.symbol,
      trade.type,
      trade.lotSize.toString(),
      trade.entryPrice.toString(),
      trade.exitPrice?.toString() || '',
      trade.status,
      formatCurrency(trade.pnl),
      trade.approvalStatus
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${account.name}_trades_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Trade Log
        </h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'ALL' | 'OPEN' | 'CLOSED')}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Trades</option>
            <option value="OPEN">Open Trades</option>
            <option value="CLOSED">Closed Trades</option>
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors"
            disabled={filteredTrades.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No trades found for this account</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-3 px-2">Date/Time</th>
                <th className="text-left py-3 px-2">Symbol</th>
                <th className="text-left py-3 px-2">Type</th>
                <th className="text-right py-3 px-2">Lot Size</th>
                <th className="text-right py-3 px-2">Entry</th>
                <th className="text-right py-3 px-2">Exit</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-right py-3 px-2">P&L</th>
                <th className="text-center py-3 px-2">Approval</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map(trade => (
                <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-700 hover:bg-opacity-50">
                  <td className="py-3 px-2 text-gray-300">
                    {new Date(trade.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-white font-medium">
                    {trade.symbol}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-white">
                    {trade.lotSize}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-300">
                    {trade.entryPrice.toFixed(5)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-300">
                    {trade.exitPrice ? trade.exitPrice.toFixed(5) : '-'}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.status === 'OPEN' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className={`py-3 px-2 text-right font-bold ${
                    trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatCurrency(trade.pnl)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.approvalStatus === 'APPROVED' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {trade.approvalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};