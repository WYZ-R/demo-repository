import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  ExternalLink,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { 
  InvestmentExecutionStatus, 
  InvestmentTransaction,
  investmentService
} from '../services/investmentService';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<InvestmentTransaction | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 获取交易历史
  const transactions = investmentService.getTransactionHistory();
  
  // 过滤交易
  const filteredTransactions = transactions.filter(tx => {
    // 状态过滤
    if (filter !== 'all' && tx.status !== filter) {
      return false;
    }
    
    // 搜索过滤
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        tx.id.toLowerCase().includes(searchLower) ||
        tx.sourceChain.toLowerCase().includes(searchLower) ||
        tx.destinationChain.toLowerCase().includes(searchLower) ||
        tx.asset.toLowerCase().includes(searchLower) ||
        (tx.txHash && tx.txHash.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // 获取交易状态的颜色和图标
  const getStatusInfo = (status: InvestmentExecutionStatus) => {
    switch (status) {
      case InvestmentExecutionStatus.COMPLETED:
        return { color: 'text-green-500 bg-green-50', icon: <CheckCircle className="w-4 h-4" /> };
      case InvestmentExecutionStatus.FAILED:
        return { color: 'text-red-500 bg-red-50', icon: <XCircle className="w-4 h-4" /> };
      case InvestmentExecutionStatus.PROCESSING:
        return { color: 'text-blue-500 bg-blue-50', icon: <Loader2 className="w-4 h-4 animate-spin" /> };
      default:
        return { color: 'text-yellow-500 bg-yellow-50', icon: <AlertCircle className="w-4 h-4" /> };
    }
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染交易详情
  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null;
    
    const { color, icon } = getStatusInfo(selectedTransaction.status);
    
    return (
      <div className="p-6 border-l border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Transaction Details</h3>
          <button 
            onClick={() => setSelectedTransaction(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${color}`}>
            {icon}
            <span className="font-medium">
              {selectedTransaction.status === InvestmentExecutionStatus.COMPLETED ? 'Completed' : 
               selectedTransaction.status === InvestmentExecutionStatus.FAILED ? 'Failed' :
               selectedTransaction.status === InvestmentExecutionStatus.PROCESSING ? 'Processing' : 'Pending'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500">Transaction ID</div>
              <div className="font-mono text-xs text-slate-800 truncate">{selectedTransaction.id}</div>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500">Date & Time</div>
              <div className="text-slate-800">
                {formatDate(selectedTransaction.timestamp)} at {formatTime(selectedTransaction.timestamp)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500">From Chain</div>
              <div className="font-semibold text-slate-800">{selectedTransaction.sourceChain}</div>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500">To Chain</div>
              <div className="font-semibold text-slate-800">{selectedTransaction.destinationChain}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500">Amount</div>
              <div className="font-semibold text-slate-800">{selectedTransaction.amount}</div>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500">Asset</div>
              <div className="font-semibold text-slate-800">{selectedTransaction.asset}</div>
            </div>
          </div>
          
          {selectedTransaction.txHash && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500">Transaction Hash</div>
              <div className="flex items-center">
                <div className="font-mono text-xs text-slate-800 truncate flex-1">
                  {selectedTransaction.txHash}
                </div>
                <a 
                  href={`https://etherscan.io/tx/${selectedTransaction.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
          
          {selectedTransaction.messageId && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500">CCIP Message ID</div>
              <div className="flex items-center">
                <div className="font-mono text-xs text-slate-800 truncate flex-1">
                  {selectedTransaction.messageId}
                </div>
                <a 
                  href={`https://ccip.chain.link/msg/${selectedTransaction.messageId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
          
          {selectedTransaction.error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="text-sm text-red-500">Error</div>
              <div className="text-red-700 text-sm">{selectedTransaction.error}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[80vh]">
        {/* 交易列表 */}
        <div className={`flex-1 flex flex-col ${selectedTransaction ? 'hidden md:flex' : ''}`}>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
            <h3 className="text-xl font-bold">Transaction History</h3>
            <p className="text-purple-100 text-sm">
              View and track your investment transactions
            </p>
          </div>
          
          {/* 搜索和过滤 */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
              
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value={InvestmentExecutionStatus.COMPLETED}>Completed</option>
                  <option value={InvestmentExecutionStatus.PROCESSING}>Processing</option>
                  <option value={InvestmentExecutionStatus.FAILED}>Failed</option>
                  <option value={InvestmentExecutionStatus.PENDING}>Pending</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>
          
          {/* 交易列表 */}
          <div className="flex-1 overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Calendar className="w-12 h-12 mb-2 text-slate-300" />
                <p>No transactions found</p>
                {searchTerm && (
                  <p className="text-sm mt-1">Try adjusting your search criteria</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const { color, icon } = getStatusInfo(tx.status);
                  const isSelected = selectedTransaction?.id === tx.id;
                  
                  return (
                    <div 
                      key={tx.id}
                      onClick={() => setSelectedTransaction(tx)}
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-slate-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${color}`}>
                            {icon}
                            <span className="ml-1">
                              {tx.status === InvestmentExecutionStatus.COMPLETED ? 'Completed' : 
                               tx.status === InvestmentExecutionStatus.FAILED ? 'Failed' :
                               tx.status === InvestmentExecutionStatus.PROCESSING ? 'Processing' : 'Pending'}
                            </span>
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDate(tx.timestamp)} {formatTime(tx.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          {tx.sourceChain === tx.destinationChain ? (
                            <span className="text-xs text-slate-500">{tx.sourceChain}</span>
                          ) : (
                            <div className="flex items-center text-xs text-slate-500">
                              <span>{tx.sourceChain}</span>
                              <ArrowRight className="w-3 h-3 mx-1" />
                              <span>{tx.destinationChain}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-800">
                          {tx.amount} {tx.asset}
                        </div>
                        
                        <button className="text-blue-500 hover:text-blue-700 text-sm flex items-center">
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
          
          {/* 底部按钮 */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
        
        {/* 交易详情 */}
        {selectedTransaction && (
          <div className={`w-full md:w-1/2 flex flex-col ${!selectedTransaction ? 'hidden md:flex' : ''}`}>
            {/* 移动端返回按钮 */}
            <div className="md:hidden bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="flex items-center text-white"
              >
                <ArrowDownRight className="w-4 h-4 mr-2" />
                <span>Back to Transactions</span>
              </button>
            </div>
            
            {renderTransactionDetails()}
            
            {/* 移动端底部按钮 */}
            <div className="md:hidden p-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryModal;