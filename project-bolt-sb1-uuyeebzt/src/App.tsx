import React, { useState, useEffect } from 'react';
import { Account, RiskParameters, Trade } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { RiskDashboard } from './components/RiskDashboard';
import { LotSizeCalculator } from './components/LotSizeCalculator';
import { TradeApprovalChecker } from './components/TradeApprovalChecker';
import { AccountManager } from './components/AccountManager';
import { TradeLog } from './components/TradeLog';
import { Activity, TrendingUp } from 'lucide-react';

const DEFAULT_RISK_PARAMS: RiskParameters = {
  maxDailyDrawdownPercent: 5,
  maxTotalDrawdownPercent: 10,
  maxSingleDayProfitPercent: 25,
  defaultRiskPercentPerTrade: 1
};

const createDefaultAccount = (): Account => ({
  id: '1',
  name: 'Main Account',
  initialBalance: 10000,
  currentBalance: 10000,
  dailyStartBalance: 10000,
  totalProfit: 0,
  dailyProfit: 0,
  maxDailyProfit: 0,
  isKillSwitchActive: false,
  createdAt: new Date().toISOString(),
  lastResetDate: new Date().toISOString()
});

function App() {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('propfirm_accounts', [createDefaultAccount()]);
  const [currentAccountId, setCurrentAccountId] = useLocalStorage<string>('propfirm_current_account', '1');
  const [riskParams, setRiskParams] = useLocalStorage<RiskParameters>('propfirm_risk_params', DEFAULT_RISK_PARAMS);
  const [trades, setTrades] = useLocalStorage<Trade[]>('propfirm_trades', []);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'approval' | 'manager' | 'log'>('dashboard');

  const currentAccount = accounts.find(a => a.id === currentAccountId) || accounts[0];

  // Update daily balances at midnight
  useEffect(() => {
    const now = new Date();
    const lastReset = new Date(currentAccount.lastResetDate);
    
    if (now.toDateString() !== lastReset.toDateString()) {
      setAccounts(prevAccounts => 
        prevAccounts.map(account => 
          account.id === currentAccount.id
            ? {
                ...account,
                dailyStartBalance: account.currentBalance,
                dailyProfit: 0,
                lastResetDate: now.toISOString()
              }
            : account
        )
      );
    }
  }, [currentAccount.id, currentAccount.lastResetDate]);

  const handleAccountSelect = (account: Account) => {
    setCurrentAccountId(account.id);
  };

  const handleAccountCreate = (name: string, initialBalance: number) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name,
      initialBalance,
      currentBalance: initialBalance,
      dailyStartBalance: initialBalance,
      totalProfit: 0,
      dailyProfit: 0,
      maxDailyProfit: 0,
      isKillSwitchActive: false,
      createdAt: new Date().toISOString(),
      lastResetDate: new Date().toISOString()
    };
    setAccounts(prev => [...prev, newAccount]);
    setCurrentAccountId(newAccount.id);
  };

  const handleAccountReset = (accountId: string) => {
    setAccounts(prevAccounts => 
      prevAccounts.map(account => 
        account.id === accountId
          ? {
              ...account,
              currentBalance: account.initialBalance,
              dailyStartBalance: account.initialBalance,
              totalProfit: 0,
              dailyProfit: 0,
              maxDailyProfit: 0,
              isKillSwitchActive: false,
              lastResetDate: new Date().toISOString()
            }
          : account
      )
    );
    // Clear trades for this account
    setTrades(prevTrades => prevTrades.filter(trade => trade.accountId !== accountId));
  };

  const handleKillSwitchToggle = (accountId: string) => {
    setAccounts(prevAccounts => 
      prevAccounts.map(account => 
        account.id === accountId
          ? { ...account, isKillSwitchActive: !account.isKillSwitchActive }
          : account
      )
    );
  };

  const handleRiskParamsUpdate = (params: RiskParameters) => {
    setRiskParams(params);
  };

  const tabButtons = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'calculator', label: 'Calculator', icon: TrendingUp },
    { key: 'approval', label: 'Trade Approval', icon: Activity },
    { key: 'manager', label: 'Account Manager', icon: Activity },
    { key: 'log', label: 'Trade Log', icon: Activity }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Prop Firm Risk Engine</h1>
                <p className="text-gray-400 text-sm">Professional Risk Management System</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Current Account</div>
              <div className="font-semibold text-lg">{currentAccount.name}</div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabButtons.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <RiskDashboard account={currentAccount} riskParams={riskParams} />
          )}
          
          {activeTab === 'calculator' && (
            <LotSizeCalculator accountEquity={currentAccount.initialBalance + currentAccount.totalProfit} />
          )}
          
          {activeTab === 'approval' && (
            <TradeApprovalChecker account={currentAccount} riskParams={riskParams} />
          )}
          
          {activeTab === 'manager' && (
            <AccountManager
              accounts={accounts}
              currentAccount={currentAccount}
              riskParams={riskParams}
              onAccountSelect={handleAccountSelect}
              onAccountCreate={handleAccountCreate}
              onAccountReset={handleAccountReset}
              onKillSwitchToggle={handleKillSwitchToggle}
              onRiskParamsUpdate={handleRiskParamsUpdate}
            />
          )}
          
          {activeTab === 'log' && (
            <TradeLog trades={trades} account={currentAccount} />
          )}
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400">
          <p>Prop Firm Risk Engine v1.0 - Professional Trading Risk Management</p>
        </div>
      </footer>
    </div>
  );
}

export default App;