import { InvestmentIntent } from './chatService';
import { ethers } from 'ethers';
import { PublicKey } from '@solana/web3.js';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// 投资执行状态
export enum InvestmentExecutionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 投资交易详情
export interface InvestmentTransaction {
  id: string;
  timestamp: Date;
  status: InvestmentExecutionStatus;
  sourceChain: string;
  destinationChain: string;
  amount: string;
  asset: string;
  txHash?: string;
  messageId?: string;
  error?: string;
}

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
 */
class InvestmentService {
  private transactions: InvestmentTransaction[] = [];
  
  constructor() {
    // 从本地存储加载历史交易
    this.loadTransactionsFromStorage();
  }

  /**
   * 执行投资操作
   * @param request 投资执行请求
   */
  async executeInvestment(request: InvestmentExecutionRequest): Promise<InvestmentExecutionResult> {
    try {
      console.log('Executing investment with intent:', request.intent);
      
      // 创建交易记录
      const transaction: InvestmentTransaction = {
        id: `tx-${Date.now()}`,
        timestamp: new Date(),
        status: InvestmentExecutionStatus.PROCESSING,
        sourceChain: request.sourceChain,
        destinationChain: this.mapChainFromIntent(request.intent),
        amount: this.getAmountFromIntent(request.intent),
        asset: this.getAssetFromIntent(request.intent),
      };
      
      // 添加到交易列表
      this.transactions.push(transaction);
      this.saveTransactionsToStorage();
      
      // 根据意图类型执行不同的操作
      switch (request.intent.intent) {
        case 'invest':
          return await this.executeInvestmentTransaction(transaction, request);
        case 'rebalance':
          return await this.executeRebalanceTransaction(transaction, request);
        case 'withdraw':
          return await this.executeWithdrawalTransaction(transaction, request);
        default:
          throw new Error(`Unsupported investment intent: ${request.intent.intent}`);
      }
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
   */
  getTransactionHistory(): InvestmentTransaction[] {
    return [...this.transactions].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * 获取交易详情
   * @param transactionId 交易ID
   */
  getTransactionById(transactionId: string): InvestmentTransaction | undefined {
    return this.transactions.find(tx => tx.id === transactionId);
  }

  /**
   * 从本地存储加载交易历史
   */
  private loadTransactionsFromStorage(): void {
    try {
      const storedTransactions = localStorage.getItem('investment_transactions');
      if (storedTransactions) {
        this.transactions = JSON.parse(storedTransactions).map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load transactions from storage:', error);
      this.transactions = [];
    }
  }

  /**
   * 保存交易历史到本地存储
   */
  private saveTransactionsToStorage(): void {
    try {
      localStorage.setItem('investment_transactions', JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Failed to save transactions to storage:', error);
    }
  }

  /**
   * 更新交易状态
   * @param transactionId 交易ID
   * @param status 新状态
   * @param updates 其他需要更新的字段
   */
  updateTransactionStatus(
    transactionId: string, 
    status: InvestmentExecutionStatus, 
    updates: Partial<InvestmentTransaction> = {}
  ): void {
    const transaction = this.transactions.find(tx => tx.id === transactionId);
    if (transaction) {
      transaction.status = status;
      Object.assign(transaction, updates);
      this.saveTransactionsToStorage();
    }
  }

  /**
   * 从意图中提取目标链
   * @param intent 投资意图
   */
  private mapChainFromIntent(intent: InvestmentIntent): string {
    return intent.entities.chain || 'Ethereum';
  }

  /**
   * 从意图中提取投资金额
   * @param intent 投资意图
   */
  private getAmountFromIntent(intent: InvestmentIntent): string {
    if (intent.entities.amount) {
      return intent.entities.amount.toString();
    } else if (intent.entities.percentage) {
      // 这里应该根据用户的总资产计算具体金额
      // 暂时返回百分比
      return `${intent.entities.percentage}%`;
    }
    return '0';
  }

  /**
   * 从意图中提取资产类型
   * @param intent 投资意图
   */
  private getAssetFromIntent(intent: InvestmentIntent): string {
    return intent.entities.asset_type || 'USDC';
  }

  /**
   * 执行投资交易
   * @param transaction 交易记录
   * @param request 投资请求
   */
  private async executeInvestmentTransaction(
    transaction: InvestmentTransaction,
    request: InvestmentExecutionRequest
  ): Promise<InvestmentExecutionResult> {
    try {
      // 模拟跨链投资过程
      // 在实际实现中，这里应该调用CCIP相关函数
      
      // 1. 确定源链和目标链
      const sourceChain = request.sourceChain;
      const destChain = transaction.destinationChain;
      
      // 2. 确定投资金额和资产
      const amount = transaction.amount;
      const asset = transaction.asset;
      
      console.log(`Executing cross-chain investment: ${amount} ${asset} from ${sourceChain} to ${destChain}`);
      
      // 3. 模拟交易延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 4. 模拟成功结果
      const mockTxHash = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const mockMessageId = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // 5. 更新交易状态
      this.updateTransactionStatus(transaction.id, InvestmentExecutionStatus.COMPLETED, {
        txHash: mockTxHash,
        messageId: mockMessageId
      });
      
      return {
        success: true,
        transaction: this.getTransactionById(transaction.id)
      };
    } catch (error) {
      // 更新交易状态为失败
      this.updateTransactionStatus(transaction.id, InvestmentExecutionStatus.FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        transaction: this.getTransactionById(transaction.id),
        error: error instanceof Error ? error.message : 'Unknown error during investment'
      };
    }
  }

  /**
   * 执行资产重新平衡交易
   * @param transaction 交易记录
   * @param request 投资请求
   */
  private async executeRebalanceTransaction(
    transaction: InvestmentTransaction,
    request: InvestmentExecutionRequest
  ): Promise<InvestmentExecutionResult> {
    // 重新平衡逻辑类似于投资，但可能涉及多个资产的调整
    // 暂时使用与投资相同的模拟实现
    return this.executeInvestmentTransaction(transaction, request);
  }

  /**
   * 执行提款交易
   * @param transaction 交易记录
   * @param request 投资请求
   */
  private async executeWithdrawalTransaction(
    transaction: InvestmentTransaction,
    request: InvestmentExecutionRequest
  ): Promise<InvestmentExecutionResult> {
    try {
      // 模拟提款过程
      console.log(`Executing withdrawal: ${transaction.amount} ${transaction.asset} from ${transaction.destinationChain} to ${transaction.sourceChain}`);
      
      // 模拟交易延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟成功结果
      const mockTxHash = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // 更新交易状态
      this.updateTransactionStatus(transaction.id, InvestmentExecutionStatus.COMPLETED, {
        txHash: mockTxHash
      });
      
      return {
        success: true,
        transaction: this.getTransactionById(transaction.id)
      };
    } catch (error) {
      // 更新交易状态为失败
      this.updateTransactionStatus(transaction.id, InvestmentExecutionStatus.FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        transaction: this.getTransactionById(transaction.id),
        error: error instanceof Error ? error.message : 'Unknown error during withdrawal'
      };
    }
  }
}

// 导出服务实例
export const investmentService = new InvestmentService();

// 钱包连接和区块链交互的钩子
export function useInvestmentExecution() {
  const { primaryWallet, network } = useDynamicContext();
  
  const executeInvestment = async (intent: InvestmentIntent): Promise<InvestmentExecutionResult> => {
    if (!primaryWallet) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet to execute investments.'
      };
    }
    
    // 获取钱包地址
    const walletAddress = primaryWallet.address;
    
    // 确定源链（基于当前连接的钱包网络）
    const sourceChain = network?.name || 'Ethereum';
    
    // 执行投资
    return investmentService.executeInvestment({
      intent,
      walletAddress,
      sourceChain
    });
  };
  
  return {
    executeInvestment,
    getTransactionHistory: investmentService.getTransactionHistory.bind(investmentService),
    getTransactionById: investmentService.getTransactionById.bind(investmentService),
    isWalletConnected: !!primaryWallet
  };
}