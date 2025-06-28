import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  ExternalLink,
  Wallet,
  RefreshCw,
  ChevronDown,
  ArrowRightLeft
} from 'lucide-react';
import { 
  CCIPTransferStatus, 
  CCIPTransfer,
  CCIPTransferRequest,
  useCCIPTransfer
} from '../services/ccipService';
import {
  ChainId,
  FeeTokenType
} from '../config/ccipConfig';

interface CCIPTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSourceChain?: ChainId;
  initialDestinationChain?: ChainId;
}

const CCIPTransferModal: React.FC<CCIPTransferModalProps> = ({ 
  isOpen, 
  onClose,
  initialSourceChain,
  initialDestinationChain
}) => {
  // 转账表单状态
  const [sourceChain, setSourceChain] = useState<ChainId>(initialSourceChain || ChainId.ETHEREUM_SEPOLIA);
  const [destinationChain, setDestinationChain] = useState<ChainId>(initialDestinationChain || ChainId.SOLANA_DEVNET);
  const [amount, setAmount] = useState<string>('');
  const [asset, setAsset] = useState<string>('USDC');
  const [receiver, setReceiver] = useState<string>('');
  const [feeToken, setFeeToken] = useState<FeeTokenType>(FeeTokenType.NATIVE);
  
  // 转账进度状态
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [transfer, setTransfer] = useState<CCIPTransfer | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { executeTransfer, isWalletConnected, currentChain } = useCCIPTransfer();

  // 当模态框打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setTransfer(null);
      setError(null);
      
      // 如果提供了初始链，则使用它们
      if (initialSourceChain) setSourceChain(initialSourceChain);
      if (initialDestinationChain) setDestinationChain(initialDestinationChain);
    }
  }, [isOpen, initialSourceChain, initialDestinationChain]);

  // 转账步骤
  const steps = [
    { title: 'Configure Transfer', description: 'Set up your cross-chain transfer details' },
    { title: 'Processing Transfer', description: 'Executing your cross-chain transfer' },
    { title: 'Transfer Complete', description: 'Your cross-chain transfer has been processed' }
  ];

  // 可用的链列表
  const availableChains = [
    { id: ChainId.ETHEREUM_SEPOLIA, name: 'Ethereum Sepolia' },
    { id: ChainId.BASE_SEPOLIA, name: 'Base Sepolia' },
    { id: ChainId.OPTIMISM_SEPOLIA, name: 'Optimism Sepolia' },
    { id: ChainId.ARBITRUM_SEPOLIA, name: 'Arbitrum Sepolia' },
    { id: ChainId.SOLANA_DEVNET, name: 'Solana Devnet' }
  ];

  // 可用的资产列表
  const availableAssets = [
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'BnM', name: 'BnM Token' },
    { symbol: 'LINK', name: 'Chainlink Token' }
  ];

  // 可用的费用代币列表
  const availableFeeTokens = [
    { id: FeeTokenType.NATIVE, name: 'Native Token (ETH/SOL)' },
    { id: FeeTokenType.WRAPPED_NATIVE, name: 'Wrapped Native (WETH/WSOL)' },
    { id: FeeTokenType.LINK, name: 'LINK Token' }
  ];

  // 交换源链和目标链
  const swapChains = () => {
    const temp = sourceChain;
    setSourceChain(destinationChain);
    setDestinationChain(temp);
  };

  // 处理转账执行
  const handleExecuteTransfer = async () => {
    if (!isWalletConnected) {
      setError('Please connect your wallet to execute this transfer');
      return;
    }

    // 验证表单
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!receiver) {
      setError('Please enter a receiver address');
      return;
    }

    try {
      setCurrentStep(1); // 移动到处理步骤
      setError(null);
      
      // 创建转账请求
      const transferRequest: CCIPTransferRequest = {
        sourceChain,
        destinationChain,
        receiver,
        amount,
        asset,
        feeToken
      };
      
      // 执行转账
      const result = await executeTransfer(transferRequest);
      
      if (result.success && result.transfer) {
        setTransfer(result.transfer);
        setCurrentStep(2); // 移动到完成步骤
      } else {
        setError(result.error || 'Failed to execute transfer');
        setCurrentStep(0); // 返回到配置步骤
      }
    } catch (error) {
      console.error('Transfer execution error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setCurrentStep(0); // 返回到配置步骤
    }
  };

  // 获取转账状态的颜色和图标
  const getStatusInfo = (status: CCIPTransferStatus) => {
    switch (status) {
      case CCIPTransferStatus.COMPLETED:
        return { color: 'text-green-500', icon: <CheckCircle className="w-5 h-5" /> };
      case CCIPTransferStatus.FAILED:
        return { color: 'text-red-500', icon: <XCircle className="w-5 h-5" /> };
      case CCIPTransferStatus.PROCESSING:
        return { color: 'text-blue-500', icon: <Loader2 className="w-5 h-5 animate-spin" /> };
      default:
        return { color: 'text-yellow-500', icon: <AlertCircle className="w-5 h-5" /> };
    }
  };

  // 渲染转账表单
  const renderTransferForm = () => {
    return (
      <div className="space-y-4">
        {/* 源链和目标链选择 */}
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">From Chain</label>
            <div className="relative">
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value as ChainId)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {availableChains.map((chain) => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
            </div>
          </div>
          
          <button 
            onClick={swapChains}
            className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            title="Swap chains"
          >
            <ArrowRightLeft className="w-5 h-5 text-slate-600" />
          </button>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">To Chain</label>
            <div className="relative">
              <select
                value={destinationChain}
                onChange={(e) => setDestinationChain(e.target.value as ChainId)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {availableChains.map((chain) => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
            </div>
          </div>
        </div>
        
        {/* 金额和资产选择 */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
          
          <div className="w-1/3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Asset</label>
            <div className="relative">
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {availableAssets.map((asset) => (
                  <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
            </div>
          </div>
        </div>
        
        {/* 接收地址 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Receiver Address</label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder={destinationChain === ChainId.SOLANA_DEVNET ? "Solana address" : "EVM address"}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
        
        {/* 费用代币选择 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fee Token</label>
          <div className="relative">
            <select
              value={feeToken}
              onChange={(e) => setFeeToken(e.target.value as FeeTokenType)}
              className="w-full p-3 bg-white border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              {availableFeeTokens.map((token) => (
                <option key={token.id} value={token.id}>{token.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 mt-1">Token used to pay for CCIP fees</p>
        </div>
      </div>
    );
  };

  // 渲染转账结果
  const renderTransferResult = () => {
    if (!transfer) return null;
    
    const { color, icon } = getStatusInfo(transfer.status);
    
    return (
      <div className="space-y-4">
        <div className={`flex items-center justify-center space-x-2 ${color}`}>
          {icon}
          <span className="font-medium">
            {transfer.status === CCIPTransferStatus.COMPLETED ? 'Transfer Completed' : 
             transfer.status === CCIPTransferStatus.FAILED ? 'Transfer Failed' :
             'Transfer Processing'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">From Chain</div>
            <div className="font-semibold text-slate-800">{transfer.sourceChain}</div>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">To Chain</div>
            <div className="font-semibold text-slate-800">{transfer.destinationChain}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Amount</div>
            <div className="font-semibold text-slate-800">{transfer.amount} {transfer.asset}</div>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Receiver</div>
            <div className="font-mono text-xs text-slate-800 truncate">{transfer.receiver}</div>
          </div>
        </div>
        
        {transfer.txHash && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Transaction Hash</div>
            <div className="flex items-center">
              <div className="font-mono text-xs text-slate-800 truncate flex-1">
                {transfer.txHash}
              </div>
              <a 
                href={`https://etherscan.io/tx/${transfer.txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
        
        {transfer.messageId && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">CCIP Message ID</div>
            <div className="flex items-center">
              <div className="font-mono text-xs text-slate-800 truncate flex-1">
                {transfer.messageId}
              </div>
              <a 
                href={`https://ccip.chain.link/msg/${transfer.messageId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 模态框头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
          <h3 className="text-xl font-bold">CCIP Cross-Chain Transfer</h3>
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
          
          {currentStep === 0 && renderTransferForm()}
          {currentStep === 1 && (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-700">Processing your cross-chain transfer...</p>
              <p className="text-slate-500 text-sm mt-2">This may take a few moments</p>
            </div>
          )}
          {currentStep === 2 && renderTransferResult()}
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
                onClick={handleExecuteTransfer}
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
                    <span>Execute Transfer</span>
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
            <div className="w-full flex space-x-3">
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setTransfer(null);
                  setError(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline-block" />
                New Transfer
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CCIPTransferModal;