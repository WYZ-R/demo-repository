import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { InvestmentIntent } from '../services/chatService';
import { 
  useInvestmentExecution, 
  InvestmentExecutionStatus, 
  InvestmentTransaction 
} from '../services/investmentService';

interface InvestmentExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent: InvestmentIntent;
}

const InvestmentExecutionModal: React.FC<InvestmentExecutionModalProps> = ({ 
  isOpen, 
  onClose, 
  intent 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [transaction, setTransaction] = useState<InvestmentTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { executeInvestment, isWalletConnected } = useInvestmentExecution();

  // 执行投资的步骤
  const steps = [
    { title: 'Confirm Investment', description: 'Review and confirm your investment details' },
    { title: 'Processing Transaction', description: 'Executing your investment on the blockchain' },
    { title: 'Investment Complete', description: 'Your investment has been successfully processed' }
  ];

  // 当模态框打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setTransaction(null);
      setError(null);
    }
  }, [isOpen]);

  // 处理投资执行
  const handleExecuteInvestment = async () => {
    if (!isWalletConnected) {
      setError('Please connect your wallet to execute this investment');
      return;
    }

    try {
      setCurrentStep(1); // 移动到处理步骤
      setError(null);
      
      // 执行投资
      const result = await executeInvestment(intent);
      
      if (result.success && result.transaction) {
        setTransaction(result.transaction);
        setCurrentStep(2); // 移动到完成步骤
      } else {
        setError(result.error || 'Failed to execute investment');
        setCurrentStep(0); // 返回到确认步骤
      }
    } catch (error) {
      console.error('Investment execution error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setCurrentStep(0); // 返回到确认步骤
    }
  };

  // 获取交易状态的颜色和图标
  const getStatusInfo = (status: InvestmentExecutionStatus) => {
    switch (status) {
      case InvestmentExecutionStatus.COMPLETED:
        return { color: 'text-green-500', icon: <CheckCircle className="w-5 h-5" /> };
      case InvestmentExecutionStatus.FAILED:
        return { color: 'text-red-500', icon: <XCircle className="w-5 h-5" /> };
      case InvestmentExecutionStatus.PROCESSING:
        return { color: 'text-blue-500', icon: <Loader2 className="w-5 h-5 animate-spin" /> };
      default:
        return { color: 'text-yellow-500', icon: <AlertCircle className="w-5 h-5" /> };
    }
  };

  // 渲染投资详情
  const renderInvestmentDetails = () => {
    const amount = intent.entities.amount || 
                  (intent.entities.percentage ? `${intent.entities.percentage}%` : 'Unknown');
    const assetType = intent.entities.asset_type || 'Assets';
    const chain = intent.entities.chain || 'Blockchain';
    const riskLevel = intent.entities.risk_level || 'Medium';
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Investment Amount</div>
              <div className="font-semibold text-slate-800">{amount}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Asset Type</div>
              <div className="font-semibold text-slate-800">{assetType}</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Destination Chain</div>
            <div className="font-semibold text-slate-800">{chain}</div>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Risk Level</div>
            <div className="font-semibold text-slate-800">{riskLevel}</div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染交易结果
  const renderTransactionResult = () => {
    if (!transaction) return null;
    
    const { color, icon } = getStatusInfo(transaction.status);
    
    return (
      <div className="space-y-4">
        <div className={`flex items-center justify-center space-x-2 ${color}`}>
          {icon}
          <span className="font-medium">
            {transaction.status === InvestmentExecutionStatus.COMPLETED ? 'Transaction Completed' : 
             transaction.status === InvestmentExecutionStatus.FAILED ? 'Transaction Failed' :
             'Transaction Processing'}
          </span>
        </div>
        
        {transaction.txHash && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Transaction Hash</div>
            <div className="font-mono text-xs text-slate-800 truncate">
              {transaction.txHash}
              <a 
                href={`https://etherscan.io/tx/${transaction.txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center ml-2 text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
        
        {transaction.messageId && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">CCIP Message ID</div>
            <div className="font-mono text-xs text-slate-800 truncate">
              {transaction.messageId}
              <a 
                href={`https://ccip.chain.link/msg/${transaction.messageId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center ml-2 text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">From Chain</div>
            <div className="font-semibold text-slate-800">{transaction.sourceChain}</div>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">To Chain</div>
            <div className="font-semibold text-slate-800">{transaction.destinationChain}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Amount</div>
            <div className="font-semibold text-slate-800">{transaction.amount}</div>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Asset</div>
            <div className="font-semibold text-slate-800">{transaction.asset}</div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 模态框头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
          <h3 className="text-xl font-bold">
            {intent.intent === 'invest' ? 'Execute Investment' :
             intent.intent === 'rebalance' ? 'Rebalance Portfolio' :
             intent.intent === 'withdraw' ? 'Process Withdrawal' : 'Execute Transaction'}
          </h3>
          <p className="text-purple-100 text-sm">
            {steps[currentStep].description}
          </p>
        </div>
        
        {/* 步骤指示器 */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStep ? 'bg-green-500 text-white' :
                    index === currentStep ? 'bg-blue-500 text-white' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs mt-1 text-slate-600">{step.title}</span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < currentStep ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* 模态框内容 */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {currentStep === 0 && renderInvestmentDetails()}
          {currentStep === 1 && (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-700">Processing your investment...</p>
              <p className="text-slate-500 text-sm mt-2">This may take a few moments</p>
            </div>
          )}
          {currentStep === 2 && renderTransactionResult()}
        </div>
        
        {/* 模态框底部 */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
          {currentStep === 0 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteInvestment}
                disabled={!isWalletConnected}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {!isWalletConnected ? (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    <span>Connect Wallet</span>
                  </>
                ) : (
                  <>
                    <span>Execute</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </>
          ) : currentStep === 1 ? (
            <button
              disabled
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg opacity-50 cursor-not-allowed"
            >
              Processing...
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentExecutionModal;