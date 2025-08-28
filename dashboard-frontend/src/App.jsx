import React, { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('trades')
  const [controlEnabled, setControlEnabled] = useState(false)

  const tabs = [
    { id: 'trades', label: 'Trades' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'validator', label: 'Validator' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'controls', label: 'Controls' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'trades':
        return <div className="p-4">Trades table placeholder</div>
      case 'metrics':
        return <div className="p-4">Metrics cards placeholder</div>
      case 'validator':
        return <div className="p-4">Validator feed placeholder</div>
      case 'alerts':
        return <div className="p-4">Alerts list placeholder</div>
      case 'controls':
        return (
          <div className="p-4">
            <div className="space-x-2">
              <button disabled={!controlEnabled} className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50">Pause</button>
              <button disabled={!controlEnabled} className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50">Resume</button>
              <button disabled={!controlEnabled} className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50">Withdraw</button>
              <button disabled={!controlEnabled} className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50">Reset</button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 bg-gray-800 shadow">
        <h1 className="text-xl font-bold">ICT Trading Bot Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span>Control Mode</span>
          <input
            type="checkbox"
            checked={controlEnabled}
            onChange={(e) => setControlEnabled(e.target.checked)}
            className="w-4 h-4"
          />
        </div>
      </header>

      <nav className="flex space-x-4 bg-gray-700 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-3 ${activeTab === tab.id ? 'border-b-2 border-blue-400 font-semibold' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 bg-gray-900">{renderContent()}</main>
    </div>
  )
}

export default App
