import { InvestmentIntent } from './chatService';
import { 
  CCIPTransferRequest, 
  CCIPTransferStatus, 
  CCIPTransfer,
  useCCIPTransfer 
} from './ccipService';
import { ChainId, FeeTokenType } from '../config/ccipConfig';

// 重用CCIP转账状态作为投资执行状态
export { CCIPTransferStatus as InvestmentExecutionStatus };

// 投资交易详情（重用CCIP转账记录）
export type InvestmentTransaction = CCIPTransfer;

// 投资执行请求
export interface InvestmentExecutionRequest {
  intent: InvestmentIntent;
  walletAddress: string;
  sourceChain: string;
}

// 投资执行结果
export interface InvestmentExecutionResult {
  success: boolean;
  transaction?: InvestmentTransaction;
  error?: string;
}

/**
 * 投资执行服务
 * 负责将AI识别的投资意图转化为实际的区块链交易
 * 现在使用CCIP服务来执行跨链转账
 */
class InvestmentService {
  /**
   * 执行投资操作
   * @param request 投资执行请求
   */
  async executeInvestment(request: InvestmentExecutionRequest): Promise<InvestmentExecutionResult> {
    try {
      console.log('Executing investment with intent:', request.intent);
      
      // 从意图中提取投资信息
      const amount = request.intent.entities.amount?.toString() || 
                    (request.intent.entities.percentage ? `${request.intent.entities.percentage}%` : '0');
      const asset = request.intent.entities.asset_type || 'USDC';
      const destinationChain = this.mapChainFromIntent(request.intent);
      
      // 创建CCIP转账请求
      const transferRequest: CCIPTransferRequest = {
        sourceChain: this.mapCurrentChainToChainId(request.sourceChain),
        destinationChain,
        receiver: this.generateReceiverAddress(destinationChain),
        amount,
        asset,
        feeToken: FeeTokenType.NATIVE // 默认使用原生代币支付费用
      };
      
      // 使用CCIP服务执行转账
      const ccipService = await import('./ccipService').then(m => m.ccipService);
      const result = await ccipService.executeTransfer(transferRequest, request.walletAddress);
      
      return {
        success: result.success,
        transaction: result.transfer,
        error: result.error
      };
    } catch (error) {
      console.error('Investment execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during investment execution'
      };
    }
  }

  /**
   * 获取用户的所有投资交易历史
   * 现在使用CCIP服务的转账历史
   */
  getTransactionHistory(): InvestmentTransaction[] {
    try {
      const ccipService = require('./ccipService').ccipService;
      return ccipService.getTransferHistory();
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  /**
   * 获取交易详情
   * @param transactionId 交易ID
   */
  getTransactionById(transactionId: string): InvestmentTransaction | undefined {
    try {
      const ccipService = require('./ccipService').ccipService;
      return ccipService.getTransferById(transactionId);
    } catch (error) {
      console.error('Failed to get transaction by ID:', error);
      return undefined;
    }
  }

  /**
   * 将当前连接的链映射到ChainId
   * @param chain 当前连接的链
   */
  private mapCurrentChainToChainId(chain?: string): ChainId {
    if (!chain) return ChainId.ETHEREUM_SEPOLIA; // 默认
    
    const chainLower = chain.toLowerCase();
    if (chainLower.includes('ethereum') || chainLower.includes('sepolia')) {
      return ChainId.ETHEREUM_SEPOLIA;
    } else if (chainLower.includes('solana')) {
      return ChainId.SOLANA_DEVNET;
    } else if (chainLower.includes('base')) {
      return ChainId.BASE_SEPOLIA;
    } else if (chainLower.includes('optimism')) {
      return ChainId.OPTIMISM_SEPOLIA;
    } else if (chainLower.includes('arbitrum')) {
      return ChainId.ARBITRUM_SEPOLIA;
    } else if (chainLower.includes('bsc')) {
      return ChainId.BSC_TESTNET;
    }
    
    return ChainId.ETHEREUM_SEPOLIA;
  }

  /**
   * 从意图中提取目标链
   * @param intent 投资意图
   */
  private mapChainFromIntent(intent: InvestmentIntent): ChainId {
    if (!intent.entities.chain) return ChainId.SOLANA_DEVNET; // 默认
    
    const chainLower = intent.entities.chain.toLowerCase();
    if (chainLower.includes('ethereum') || chainLower.includes('eth')) {
      return ChainId.ETHEREUM_SEPOLIA;
    } else if (chainLower.includes('solana') || chainLower.includes('sol')) {
      return ChainId.SOLANA_DEVNET;
    } else if (chainLower.includes('base')) {
      return ChainId.BASE_SEPOLIA;
    } else if (chainLower.includes('optimism') || chainLower.includes('op')) {
      return ChainId.OPTIMISM_SEPOLIA;
    } else if (chainLower.includes('arbitrum') || chainLower.includes('arb')) {
      return ChainId.ARBITRUM_SEPOLIA;
    } else if (chainLower.includes('bsc') || chainLower.includes('binance')) {
      return ChainId.BSC_TESTNET;
    }
    
    return ChainId.SOLANA_DEVNET;
  }

  /**
   * 生成接收地址（在实际应用中，这应该是用户输入的）
   * @param chain 目标链
   */
  private generateReceiverAddress(chain: ChainId): string {
    if (chain === ChainId.SOLANA_DEVNET) {
      // 示例Solana地址
      return 'EPUjBP3Xf76K1VKsDSc6GupBWE8uykNksCLJgXZn87CB';
    } else {
      // 示例EVM地址
      return '0x9d087fC03ae39b088326b67fA3C788236645b717';
    }
  }
}

// 导出服务实例
export const investmentService = new InvestmentService();

// 钱包连接和区块链交互的钩子
export function useInvestmentExecution() {
  const ccipTransfer = useCCIPTransfer();
  
  const executeInvestment = async (intent: InvestmentIntent): Promise<InvestmentExecutionResult> => {
    if (!ccipTransfer.isWalletConnected) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet to execute investments.'
      };
    }
    
    // 获取钱包地址
    const walletAddress = ccipTransfer.isWalletConnected ? 
      (await ccipTransfer.getWalletAddress?.()) || 'unknown' : 'unknown';
    
    // 执行投资
    return investmentService.executeInvestment({
      intent,
      walletAddress,
      sourceChain: ccipTransfer.currentChain || 'Ethereum'
    });
  };
  
  return {
    executeInvestment,
    getTransactionHistory: investmentService.getTransactionHistory.bind(investmentService),
    getTransactionById: investmentService.getTransactionById.bind(investmentService),
    isWalletConnected: ccipTransfer.isWalletConnected
  };
}