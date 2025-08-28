import React, { useState } from 'react';
import { Account, RiskParameters } from '../types';
import { formatCurrency } from '../utils/calculations';
import { User, Settings, Plus, RotateCcw, Power, PowerOff } from 'lucide-react';

interface AccountManagerProps {
  accounts: Account[];
  currentAccount: Account;
  riskParams: RiskParameters;
  onAccountSelect: (account: Account) => void;
  onAccountCreate: (name: string, initialBalance: number) => void;
  onAccountReset: (accountId: string) => void;
  onKillSwitchToggle: (accountId: string) => void;
  onRiskParamsUpdate: (params: RiskParameters) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  currentAccount,
  riskParams,
  onAccountSelect,
  onAccountCreate,
  onAccountReset,
  onKillSwitchToggle,
  onRiskParamsUpdate
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRiskSettings, setShowRiskSettings] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState(10000);
  const [tempRiskParams, setTempRiskParams] = useState(riskParams);

  const handleCreateAccount = () => {
    if (newAccountName.trim()) {
      onAccountCreate(newAccountName.trim(), newAccountBalance);
      setNewAccountName('');
      setNewAccountBalance(10000);
      setShowCreateForm(false);
    }
  };

  const handleRiskParamsSubmit = () => {
    onRiskParamsUpdate(tempRiskParams);
    setShowRiskSettings(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          Account Manager
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRiskSettings(!showRiskSettings)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Account Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Current Account
        </label>
        <select
          value={currentAccount.id}
          onChange={(e) => {
            const account = accounts.find(a => a.id === e.target.value);
            if (account) onAccountSelect(account);
          }}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name} - {formatCurrency(account.currentBalance)}
            </option>
          ))}
        </select>
      </div>

      {/* Account Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => onKillSwitchToggle(currentAccount.id)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold transition-colors ${
            currentAccount.isKillSwitchActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {currentAccount.isKillSwitchActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          {currentAccount.isKillSwitchActive ? 'Deactivate Kill Switch' : 'Activate Kill Switch'}
        </button>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset this account? This will restore the initial balance and clear all trading history.')) {
              onAccountReset(currentAccount.id);
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Account
        </button>
      </div>

      {/* Create Account Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="My Trading Account"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Initial Balance
              </label>
              <input
                type="number"
                value={newAccountBalance}
                onChange={(e) => setNewAccountBalance(Math.max(1000, parseFloat(e.target.value) || 0))}
                min="1000"
                step="1000"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreateAccount}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
              disabled={!newAccountName.trim()}
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Risk Parameters Settings */}
      {showRiskSettings && (
        <div className="p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Max Daily Drawdown (%)
              </label>
              <input
                type="number"
                value={tempRiskParams.maxDailyDrawdownPercent}
                onChange={(e) => setTempRiskParams(prev => ({ ...prev, maxDailyDrawdownPercent: parseFloat(e.target.value) || 0 }))}
                min="1"
                max="10"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Max Total Drawdown (%)
              </label>
              <input
                type="number"
                value={tempRiskParams.maxTotalDrawdownPercent}
                onChange={(e) => setTempRiskParams(prev => ({ ...prev, maxTotalDrawdownPercent: parseFloat(e.target.value) || 0 }))}
                min="5"
                max="20"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Max Single Day Profit (% of total)
              </label>
              <input
                type="number"
                value={tempRiskParams.maxSingleDayProfitPercent}
                onChange={(e) => setTempRiskParams(prev => ({ ...prev, maxSingleDayProfitPercent: parseFloat(e.target.value) || 0 }))}
                min="10"
                max="50"
                step="1"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Default Risk Per Trade (%)
              </label>
              <input
                type="number"
                value={tempRiskParams.defaultRiskPercentPerTrade}
                onChange={(e) => setTempRiskParams(prev => ({ ...prev, defaultRiskPercentPerTrade: parseFloat(e.target.value) || 0 }))}
                min="0.1"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleRiskParamsSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTempRiskParams(riskParams);
                setShowRiskSettings(false);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};