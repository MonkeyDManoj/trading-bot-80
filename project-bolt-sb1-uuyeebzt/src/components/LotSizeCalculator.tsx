import React, { useState } from 'react';
import { calculateLotSize, formatCurrency } from '../utils/calculations';
import { Calculator, DollarSign } from 'lucide-react';

interface LotSizeCalculatorProps {
  accountEquity: number;
}

export const LotSizeCalculator: React.FC<LotSizeCalculatorProps> = ({ accountEquity }) => {
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopLossInPips, setStopLossInPips] = useState(20);
  const [pipValue, setPipValue] = useState(10);

  const riskAmount = (accountEquity * riskPercent) / 100;
  const lotSize = calculateLotSize(accountEquity, riskPercent, stopLossInPips, pipValue);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Calculator className="w-5 h-5" />
        Lot Size Calculator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Risk Percentage
          </label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Math.max(0.1, Math.min(5, parseFloat(e.target.value) || 0)))}
            min="0.1"
            max="5"
            step="0.1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="text-xs text-gray-500 mt-1">Max: 5%</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Stop Loss (Pips)
          </label>
          <input
            type="number"
            value={stopLossInPips}
            onChange={(e) => setStopLossInPips(Math.max(1, parseFloat(e.target.value) || 0))}
            min="1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Pip Value ($)
          </label>
          <input
            type="number"
            value={pipValue}
            onChange={(e) => setPipValue(Math.max(0.1, parseFloat(e.target.value) || 0))}
            min="0.1"
            step="0.1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Risk Amount</div>
            <div className="text-xl font-bold text-red-500 flex items-center justify-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatCurrency(riskAmount)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Recommended Lot Size</div>
            <div className="text-2xl font-bold text-blue-500">
              {lotSize.toFixed(2)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Account Equity</div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(accountEquity)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
        <div className="text-sm text-blue-300">
          <strong>Calculation:</strong> Risk Amount ÷ (Stop Loss × Pip Value) = Lot Size<br />
          <strong>Formula:</strong> {formatCurrency(riskAmount)} ÷ ({stopLossInPips} × ${pipValue}) = {lotSize.toFixed(2)}
        </div>
      </div>
    </div>
  );
};