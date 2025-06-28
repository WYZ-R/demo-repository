import { ethers } from "ethers";
import { PublicKey } from "@solana/web3.js";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { 
  ChainId, 
  getEVMConfig, 
  getCCIPSVMConfig,
  getEVMFeeTokenAddress,
  getSVMFeeToken,
  FeeTokenType
} from "../config/ccipConfig";

// CCIP转账状态
export enum CCIPTransferStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// CCIP转账记录
export interface CCIPTransfer {
  id: string;
  timestamp: Date;
  status: CCIPTransferStatus;
  sourceChain: string;
  destinationChain: string;
  amount: string;
  asset: string;
  sender: string;
  receiver: string;
  txHash?: string;
  messageId?: string;
  error?: string;
}

// CCIP转账请求
export interface CCIPTransferRequest {
  sourceChain: ChainId;
  destinationChain: ChainId;
  receiver: string; // 目标链上的接收地址
  amount: string;
  asset: string; // 资产地址或符号
  feeToken?: FeeTokenType | string; // 用于支付CCIP费用的代币
}

// CCIP转账结果
export interface CCIPTransferResult {
  success: boolean;
  transfer?: CCIPTransfer;
  error?: string;
}

/**
 * CCIP跨链转账服务
 * 负责处理跨链转账操作
 */
class CCIPService {
  private transfers: CCIPTransfer[] = [];
  
  constructor() {
    // 从本地存储加载历史转账记录
    this.loadTransfersFromStorage();
  }

  /**
   * 执行CCIP跨链转账
   * @param request 转账请求
   * @param walletAddress 发送方钱包地址
   */
  async executeTransfer(
    request: CCIPTransferRequest,
    walletAddress: string
  ): Promise<CCIPTransferResult> {
    try {
      console.log('Executing CCIP transfer:', request);
      
      // 创建转账记录
      const transfer: CCIPTransfer = {
        id: `ccip-${Date.now()}`,
        timestamp: new Date(),
        status: CCIPTransferStatus.PROCESSING,
        sourceChain: request.sourceChain,
        destinationChain: request.destinationChain,
        amount: request.amount,
        asset: request.asset,
        sender: walletAddress,
        receiver: request.receiver,
      };
      
      // 添加到转账列表
      this.transfers.push(transfer);
      this.saveTransfersToStorage();
      
      // 根据源链和目标链选择不同的转账方法
      if (this.isEVMChain(request.sourceChain) && this.isEVMChain(request.destinationChain)) {
        // EVM到EVM的转账
        return await this.executeEVMToEVMTransfer(transfer, request);
      } else if (this.isEVMChain(request.sourceChain) && this.isSVMChain(request.destinationChain)) {
        // EVM到Solana的转账
        return await this.executeEVMToSVMTransfer(transfer, request);
      } else if (this.isSVMChain(request.sourceChain) && this.isEVMChain(request.destinationChain)) {
        // Solana到EVM的转账
        return await this.executeSVMToEVMTransfer(transfer, request);
      } else {
        throw new Error(`Unsupported chain combination: ${request.sourceChain} to ${request.destinationChain}`);
      }
    } catch (error) {
      console.error('CCIP transfer failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during CCIP transfer'
      };
    }
  }

  /**
   * 获取用户的所有CCIP转账历史
   */
  getTransferHistory(): CCIPTransfer[] {
    return [...this.transfers].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * 获取转账详情
   * @param transferId 转账ID
   */
  getTransferById(transferId: string): CCIPTransfer | undefined {
    return this.transfers.find(tx => tx.id === transferId);
  }

  /**
   * 从本地存储加载转账历史
   */
  private loadTransfersFromStorage(): void {
    try {
      const storedTransfers = localStorage.getItem('ccip_transfers');
      if (storedTransfers) {
        this.transfers = JSON.parse(storedTransfers).map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load transfers from storage:', error);
      this.transfers = [];
    }
  }

  /**
   * 保存转账历史到本地存储
   */
  private saveTransfersToStorage(): void {
    try {
      localStorage.setItem('ccip_transfers', JSON.stringify(this.transfers));
    } catch (error) {
      console.error('Failed to save transfers to storage:', error);
    }
  }

  /**
   * 更新转账状态
   * @param transferId 转账ID
   * @param status 新状态
   * @param updates 其他需要更新的字段
   */
  updateTransferStatus(
    transferId: string, 
    status: CCIPTransferStatus, 
    updates: Partial<CCIPTransfer> = {}
  ): void {
    const transfer = this.transfers.find(tx => tx.id === transferId);
    if (transfer) {
      transfer.status = status;
      Object.assign(transfer, updates);
      this.saveTransfersToStorage();
    }
  }

  /**
   * 检查是否为EVM链
   * @param chainId 链ID
   */
  private isEVMChain(chainId: ChainId): boolean {
    return chainId !== ChainId.SOLANA_DEVNET;
  }

  /**
   * 检查是否为Solana链
   * @param chainId 链ID
   */
  private isSVMChain(chainId: ChainId): boolean {
    return chainId === ChainId.SOLANA_DEVNET;
  }

  /**
   * 执行EVM到EVM的CCIP转账
   * @param transfer 转账记录
   * @param request 转账请求
   */
  private async executeEVMToEVMTransfer(
    transfer: CCIPTransfer,
    request: CCIPTransferRequest
  ): Promise<CCIPTransferResult> {
    try {
      // 获取源链和目标链配置
      const sourceConfig = getEVMConfig(request.sourceChain);
      const destConfig = getEVMConfig(request.destinationChain);
      
      console.log(`Executing EVM to EVM transfer: ${request.amount} ${request.asset} from ${sourceConfig.name} to ${destConfig.name}`);
      
      // 模拟转账延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟成功结果
      const mockTxHash = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const mockMessageId = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // 更新转账状态
      this.updateTransferStatus(transfer.id, CCIPTransferStatus.COMPLETED, {
        txHash: mockTxHash,
        messageId: mockMessageId
      });
      
      return {
        success: true,
        transfer: this.getTransferById(transfer.id)
      };
    } catch (error) {
      // 更新转账状态为失败
      this.updateTransferStatus(transfer.id, CCIPTransferStatus.FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        transfer: this.getTransferById(transfer.id),
        error: error instanceof Error ? error.message : 'Unknown error during EVM to EVM transfer'
      };
    }
  }

  /**
   * 执行EVM到Solana的CCIP转账
   * @param transfer 转账记录
   * @param request 转账请求
   */
  private async executeEVMToSVMTransfer(
    transfer: CCIPTransfer,
    request: CCIPTransferRequest
  ): Promise<CCIPTransferResult> {
    try {
      // 获取源链和目标链配置
      const sourceConfig = getEVMConfig(request.sourceChain);
      const destConfig = getCCIPSVMConfig(request.destinationChain);
      
      console.log(`Executing EVM to Solana transfer: ${request.amount} ${request.asset} from ${sourceConfig.name} to ${destConfig.name}`);
      
      // 模拟转账延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟成功结果
      const mockTxHash = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const mockMessageId = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // 更新转账状态
      this.updateTransferStatus(transfer.id, CCIPTransferStatus.COMPLETED, {
        txHash: mockTxHash,
        messageId: mockMessageId
      });
      
      return {
        success: true,
        transfer: this.getTransferById(transfer.id)
      };
    } catch (error) {
      // 更新转账状态为失败
      this.updateTransferStatus(transfer.id, CCIPTransferStatus.FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        transfer: this.getTransferById(transfer.id),
        error: error instanceof Error ? error.message : 'Unknown error during EVM to Solana transfer'
      };
    }
  }

  /**
   * 执行Solana到EVM的CCIP转账
   * @param transfer 转账记录
   * @param request 转账请求
   */
  private async executeSVMToEVMTransfer(
    transfer: CCIPTransfer,
    request: CCIPTransferRequest
  ): Promise<CCIPTransferResult> {
    try {
      // 获取源链和目标链配置
      const sourceConfig = getCCIPSVMConfig(request.sourceChain);
      const destConfig = getEVMConfig(request.destinationChain);
      
      console.log(`Executing Solana to EVM transfer: ${request.amount} ${request.asset} from ${sourceConfig.name} to ${destConfig.name}`);
      
      // 模拟转账延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟成功结果
      const mockTxHash = `${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const mockMessageId = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // 更新转账状态
      this.updateTransferStatus(transfer.id, CCIPTransferStatus.COMPLETED, {
        txHash: mockTxHash,
        messageId: mockMessageId
      });
      
      return {
        success: true,
        transfer: this.getTransferById(transfer.id)
      };
    } catch (error) {
      // 更新转账状态为失败
      this.updateTransferStatus(transfer.id, CCIPTransferStatus.FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        transfer: this.getTransferById(transfer.id),
        error: error instanceof Error ? error.message : 'Unknown error during Solana to EVM transfer'
      };
    }
  }
}

// 导出服务实例
export const ccipService = new CCIPService();

// 钱包连接和区块链交互的钩子
export function useCCIPTransfer() {
  const { primaryWallet, network } = useDynamicContext();
  
  const executeTransfer = async (request: CCIPTransferRequest): Promise<CCIPTransferResult> => {
    if (!primaryWallet) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet to execute transfers.'
      };
    }
    
    // 获取钱包地址
    const walletAddress = primaryWallet.address;
    
    // 执行转账
    return ccipService.executeTransfer(request, walletAddress);
  };
  
  // 获取钱包地址
  const getWalletAddress = async (): Promise<string | undefined> => {
    return primaryWallet?.address;
  };
  
  return {
    executeTransfer,
    getTransferHistory: ccipService.getTransferHistory.bind(ccipService),
    getTransferById: ccipService.getTransferById.bind(ccipService),
    isWalletConnected: !!primaryWallet,
    currentChain: network?.name,
    getWalletAddress
  };
}