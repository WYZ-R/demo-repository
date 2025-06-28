import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  Sparkles, 
  ChevronRight,
  DollarSign,
  PieChart,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Eye,
  Plus,
  History,
  ArrowRightLeft
} from 'lucide-react';
import TransactionHistoryModal from './TransactionHistoryModal';
import CCIPTransferModal from './CCIPTransferModal';
import CCIPTransferButton from './CCIPTransferButton';
import { CCIPTransferStatus } from '../services/ccipService';
import { ChainId } from '../config/ccipConfig';

interface Strategy {
  id: string;
  name: string;
  type: 'RWA' | 'DeFi' | 'Hybrid';
  status: 'Active' | 'Paused' | 'Completed';
  currentValue: number;
  initialInvestment: number;
  apy: number;
  duration: string;
  platform: string;
  chain: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdate: string;
}

const StrategyYieldPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    setIsVisible(true);
    
    // 获取最近的交易记录
    // 这里应该从ccipService获取，但为了简单起见，我们使用空数组
    setRecentTransactions([]);
  }, []);

  const strategies: Strategy[] = [
    {
      id: '1',
      name: 'High-Yield RWA Portfolio',
      type: 'RWA',
      status: 'Active',
      currentValue: 2150,
      initialInvestment: 2000,
      apy: 8.5,
      duration: '12 months',
      platform: 'Maple Finance',
      chain: 'Ethereum',
      riskLevel: 'Low',
      lastUpdate: '2 hours ago'
    },
    {
      id: '2',
      name: 'Solana DeFi Yield Farm',
      type: 'DeFi',
      status: 'Active',
      currentValue: 1890,
      initialInvestment: 1950,
      apy: 12.3,
      duration: '6 months',
      platform: 'Raydium',
      chain: 'Solana',
      riskLevel: 'Medium',
      lastUpdate: '1 hour ago'
    },
    {
      id: '3',
      name: 'Cross-Chain Arbitrage',
      type: 'Hybrid',
      status: 'Active',
      currentValue: 3240,
      initialInvestment: 3000,
      apy: 15.2,
      duration: '3 months',
      platform: 'Multi-Chain',
      chain: 'ETH/SOL',
      riskLevel: 'High',
      lastUpdate: '30 minutes ago'
    },
    {
      id: '4',
      name: 'Stable Yield Strategy',
      type: 'RWA',
      status: 'Completed',
      currentValue: 1560,
      initialInvestment: 1500,
      apy: 6.8,
      duration: '6 months',
      platform: 'Centrifuge',
      chain: 'Ethereum',
      riskLevel: 'Low',
      lastUpdate: '1 day ago'
    }
  ];

  const totalPortfolioValue = strategies.reduce((sum, strategy) => sum + strategy.currentValue, 0);
  const totalInitialInvestment = strategies.reduce((sum, strategy) => sum + strategy.initialInvestment, 0);
  const totalReturn = totalPortfolioValue - totalInitialInvestment;
  const totalReturnPercentage = ((totalReturn / totalInitialInvestment) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Paused': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionStatusColor = (status: CCIPTransferStatus) => {
    switch (status) {
      case CCIPTransferStatus.COMPLETED: return 'text-green-600 bg-green-100';
      case CCIPTransferStatus.FAILED: return 'text-red-600 bg-red-100';
      case CCIPTransferStatus.PROCESSING: return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const aiInsights = [
    {
      type: 'opportunity',
      title: 'New High-Yield RWA Opportunity',
      description: 'Detected a new 9.2% APY RWA pool on Maple Finance with low risk profile.',
      action: 'Consider allocating 15% of portfolio',
      priority: 'high'
    },
    {
      type: 'rebalance',
      title: 'Portfolio Rebalancing Suggestion',
      description: 'Your Solana DeFi position is underperforming. Consider reducing allocation by 20%.',
      action: 'Rebalance recommended',
      priority: 'medium'
    },
    {
      type: 'alert',
      title: 'Cross-Chain Opportunity',
      description: 'Arbitrage opportunity detected between Ethereum and Polygon networks.',
      action: 'Execute within 2 hours',
      priority: 'high'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Strategy & Yield Dashboard</h1>
              <p className="text-slate-600 mt-1">Monitor and optimize your cross-chain RWA investments</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="p-2 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl border border-slate-200 hover:bg-white transition-colors"
                title="Transaction History"
              >
                <History className="w-5 h-5" />
              </button>
              
              {/* 添加跨链转账按钮 */}
              <CCIPTransferButton 
                variant="primary"
                size="md"
                buttonText="Cross-Chain Transfer"
                className="flex items-center space-x-2"
              />
              
              <button className="p-2 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl border border-slate-200 hover:bg-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-slate-500">Total Portfolio</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">${totalPortfolioValue.toLocaleString()}</div>
            <div className={`flex items-center mt-2 ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalReturn >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              <span className="text-sm font-medium">
                ${Math.abs(totalReturn).toLocaleString()} ({totalReturnPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-slate-500">Active Strategies</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{strategies.filter(s => s.status === 'Active').length}</div>
            <div className="text-sm text-slate-600 mt-2">
              {strategies.filter(s => s.status === 'Paused').length} paused, {strategies.filter(s => s.status === 'Completed').length} completed
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-slate-500">Avg APY</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {(strategies.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.apy, 0) / strategies.filter(s => s.status === 'Active').length).toFixed(1)}%
            </div>
            <div className="text-sm text-green-600 mt-2 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+2.3% from last month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-slate-500">Risk Score</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">Medium</div>
            <div className="text-sm text-slate-600 mt-2">Balanced risk profile</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
              
              {/* 添加跨链转账按钮 */}
              <CCIPTransferButton 
                variant="secondary"
                size="sm"
                buttonText="New Transfer"
              />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No recent transactions</p>
                <p className="text-sm mt-1">Your cross-chain transactions will appear here</p>
                
                {/* 添加跨链转账按钮 */}
                <div className="mt-4">
                  <CCIPTransferButton 
                    variant="primary"
                    size="md"
                    buttonText="Make Your First Transfer"
                  />
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => {
                  const statusColor = getTransactionStatusColor(tx.status);
                  
                  return (
                    <div key={tx.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {tx.status === CCIPTransferStatus.COMPLETED ? 'Completed' : 
                             tx.status === CCIPTransferStatus.FAILED ? 'Failed' :
                             tx.status === CCIPTransferStatus.PROCESSING ? 'Processing' : 'Pending'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex items-center text-xs text-slate-500">
                            <span>{tx.sourceChain}</span>
                            <ArrowRight className="w-3 h-3 mx-1" />
                            <span>{tx.destinationChain}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-800">
                          {tx.amount} {tx.asset}
                        </div>
                        
                        <button 
                          onClick={() => setIsHistoryModalOpen(true)}
                          className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className={`mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200/60 w-fit">
            {(['7d', '30d', '90d', '1y'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedTimeframe === timeframe
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Cards */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {strategies.map((strategy, index) => (
            <div
              key={strategy.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{strategy.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(strategy.status)}`}>
                      {strategy.status}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRiskColor(strategy.riskLevel)}`}>
                      {strategy.riskLevel} Risk
                    </span>
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                      {strategy.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Current Value</div>
                  <div className="text-2xl font-bold text-slate-900">${strategy.currentValue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">APY</div>
                  <div className="text-2xl font-bold text-green-600">{strategy.apy}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-slate-500">Platform:</span>
                  <span className="ml-2 font-medium text-slate-700">{strategy.platform}</span>
                </div>
                <div>
                  <span className="text-slate-500">Chain:</span>
                  <span className="ml-2 font-medium text-slate-700">{strategy.chain}</span>
                </div>
                <div>
                  <span className="text-slate-500">Duration:</span>
                  <span className="ml-2 font-medium text-slate-700">{strategy.duration}</span>
                </div>
                <div>
                  <span className="text-slate-500">Updated:</span>
                  <span className="ml-2 font-medium text-slate-700">{strategy.lastUpdate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center text-sm ${
                    strategy.currentValue >= strategy.initialInvestment ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {strategy.currentValue >= strategy.initialInvestment ? 
                      <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    }
                    <span className="font-medium">
                      ${Math.abs(strategy.currentValue - strategy.initialInvestment).toLocaleString()} 
                      ({(((strategy.currentValue - strategy.initialInvestment) / strategy.initialInvestment) * 100).toFixed(2)}%)
                    </span>
                  </div>
                </div>
                
                {/* 添加跨链转账按钮 */}
                <div className="flex items-center space-x-2">
                  <CCIPTransferButton 
                    variant="outline"
                    size="sm"
                    buttonText="Transfer"
                    sourceChain={strategy.chain === 'Ethereum' ? ChainId.ETHEREUM_SEPOLIA : 
                                strategy.chain === 'Solana' ? ChainId.SOLANA_DEVNET : 
                                ChainId.ETHEREUM_SEPOLIA}
                  />
                  
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights Section */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-lg transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">ElizaOS AI Insights</h2>
                <p className="text-slate-600">Smart recommendations for your portfolio</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {insight.type === 'opportunity' ? <Target className="w-4 h-4" /> :
                       insight.type === 'rebalance' ? <BarChart3 className="w-4 h-4" /> :
                       <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{insight.title}</h3>
                      <p className="text-slate-600 text-sm mb-2">{insight.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">
                          {insight.action}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {insight.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 添加跨链转账按钮 */}
                  {insight.type === 'opportunity' && (
                    <CCIPTransferButton 
                      variant="outline"
                      size="sm"
                      buttonText="Invest"
                      destinationChain={
                        insight.description.toLowerCase().includes('ethereum') ? ChainId.ETHEREUM_SEPOLIA :
                        insight.description.toLowerCase().includes('solana') ? ChainId.SOLANA_DEVNET :
                        ChainId.ETHEREUM_SEPOLIA
                      }
                    />
                  )}
                  
                  {insight.type !== 'opportunity' && (
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className={`mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-lg transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Portfolio Performance</h2>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                Value
              </button>
              <button className="px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg">
                Returns
              </button>
            </div>
          </div>
          
          <div className="h-64 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Interactive Chart Coming Soon</p>
              <p className="text-slate-400 text-sm">Portfolio performance visualization will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* 交易历史模态框 */}
      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
      
      {/* 跨链转账模态框 */}
      <CCIPTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
};

export default StrategyYieldPage;