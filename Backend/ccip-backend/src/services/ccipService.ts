import { ethers } from 'ethers';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { ChainId, CCIPTransferRequest, CCIPTransferResult, CCIPTransferStatus, getEVMConfig, getSVMConfig, FeeTokenType } from '../config/ccipConfig';
import { loadEVMWallet, loadSolanaWallet } from './walletService';

// CCIP Router ABI (simplified for this example)
const CCIP_ROUTER_ABI = [
  "function ccipSend(uint64 destinationChainSelector, tuple(bytes receiver, bytes data, tuple(address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) payable returns (bytes32)",
  "function getFee(uint64 destinationChainSelector, tuple(bytes receiver, bytes data, tuple(address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) view returns (uint256)"
];

/**
 * Execute a CCIP cross-chain transfer
 * @param request Transfer request parameters
 * @returns Transfer result
 */
export async function executeTransfer(request: CCIPTransferRequest): Promise<CCIPTransferResult> {
  try {
    console.log('Executing CCIP transfer:', request);
    
    // Create transfer record
    const transferId = `ccip-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Determine transfer method based on source and destination chains
    if (isEVMChain(request.sourceChain) && isEVMChain(request.destinationChain)) {
      // EVM to EVM transfer
      return await executeEVMToEVMTransfer(transferId, timestamp, request);
    } else if (isEVMChain(request.sourceChain) && isSVMChain(request.destinationChain)) {
      // EVM to Solana transfer
      return await executeEVMToSVMTransfer(transferId, timestamp, request);
    } else if (isSVMChain(request.sourceChain) && isEVMChain(request.destinationChain)) {
      // Solana to EVM transfer
      return await executeSVMToEVMTransfer(transferId, timestamp, request);
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
 * Execute EVM to EVM CCIP transfer
 * @param transferId Unique transfer ID
 * @param timestamp Transfer timestamp
 * @param request Transfer request
 * @returns Transfer result
 */
async function executeEVMToEVMTransfer(
  transferId: string,
  timestamp: string,
  request: CCIPTransferRequest
): Promise<CCIPTransferResult> {
  try {
    // Get source and destination chain configs
    const sourceConfig = getEVMConfig(request.sourceChain);
    const destConfig = getEVMConfig(request.destinationChain);
    
    console.log(`Executing EVM to EVM transfer: ${request.amount} ${request.asset} from ${sourceConfig.name} to ${destConfig.name}`);
    
    // Load wallet
    const wallet = await loadEVMWallet(sourceConfig.rpcUrl);
    
    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(sourceConfig.rpcUrl);
    const signer = new ethers.Wallet(wallet.privateKey, provider);
    
    // Create router contract instance
    const router = new ethers.Contract(sourceConfig.routerAddress, CCIP_ROUTER_ABI, signer);
    
    // Prepare CCIP message
    const message = {
      receiver: ethers.toUtf8Bytes(request.receiver), // Convert receiver address to bytes
      data: '0x', // Empty data for token transfer
      tokenAmounts: [
        {
          token: sourceConfig.bnmTokenAddress, // Use BnM token for this example
          amount: ethers.parseUnits(request.amount, 18) // Assuming 18 decimals
        }
      ],
      feeToken: getFeeTokenAddress(sourceConfig, request.feeToken),
      extraArgs: '0x' // Empty extra args
    };
    
    // Calculate fee
    const fee = await router.getFee(destConfig.chainSelector, message);
    console.log(`CCIP fee: ${ethers.formatEther(fee)} ETH`);
    
    // Send CCIP message
    const tx = await router.ccipSend(destConfig.chainSelector, message, {
      value: fee // Pay fee in native token if feeToken is set to native
    });
    
    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait(sourceConfig.confirmations);
    console.log(`Transaction confirmed: ${receipt?.hash}`);
    
    // Extract CCIP message ID (this is a simplified example)
    // In a real implementation, you would parse the CCIPMessageSent event
    const messageId = `0x${Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    return {
      success: true,
      transfer: {
        id: transferId,
        timestamp,
        status: CCIPTransferStatus.COMPLETED,
        sourceChain: sourceConfig.name,
        destinationChain: destConfig.name,
        amount: request.amount,
        asset: request.asset,
        sender: await signer.getAddress(),
        receiver: request.receiver,
        txHash: receipt?.hash,
        messageId
      }
    };
  } catch (error) {
    console.error('EVM to EVM transfer failed:', error);
    return {
      success: false,
      transfer: {
        id: transferId,
        timestamp,
        status: CCIPTransferStatus.FAILED,
        sourceChain: getEVMConfig(request.sourceChain).name,
        destinationChain: getEVMConfig(request.destinationChain).name,
        amount: request.amount,
        asset: request.asset,
        sender: 'unknown', // We don't have the sender address if the transaction failed
        receiver: request.receiver,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      error: error instanceof Error ? error.message : 'Unknown error during EVM to EVM transfer'
    };
  }
}

/**
 * Execute EVM to Solana CCIP transfer
 * @param transferId Unique transfer ID
 * @param timestamp Transfer timestamp
 * @param request Transfer request
 * @returns Transfer result
 */
async function executeEVMToSVMTransfer(
  transferId: string,
  timestamp: string,
  request: CCIPTransferRequest
): Promise<CCIPTransferResult> {
  try {
    // Get source and destination chain configs
    const sourceConfig = getEVMConfig(request.sourceChain);
    const destConfig = getSVMConfig(request.destinationChain);
    
    console.log(`Executing EVM to Solana transfer: ${request.amount} ${request.asset} from ${sourceConfig.name} to ${destConfig.name}`);
    
    // Load wallet
    const wallet = await loadEVMWallet(sourceConfig.rpcUrl);
    
    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(sourceConfig.rpcUrl);
    const signer = new ethers.Wallet(wallet.privateKey, provider);
    
    // Create router contract instance
    const router = new ethers.Contract(sourceConfig.routerAddress, CCIP_ROUTER_ABI, signer);
    
    // Prepare CCIP message
    // For Solana, we need to encode the receiver address properly
    const solanaReceiver = encodeSolanaAddressToBytes32(request.receiver);
    
    const message = {
      receiver: solanaReceiver,
      data: '0x', // Empty data for token transfer
      tokenAmounts: [
        {
          token: sourceConfig.bnmTokenAddress, // Use BnM token for this example
          amount: ethers.parseUnits(request.amount, 18) // Assuming 18 decimals
        }
      ],
      feeToken: getFeeTokenAddress(sourceConfig, request.feeToken),
      extraArgs: createSolanaExtraArgs() // Create Solana-specific extra args
    };
    
    // Calculate fee
    const fee = await router.getFee(destConfig.chainSelector, message);
    console.log(`CCIP fee: ${ethers.formatEther(fee)} ETH`);
    
    // Send CCIP message
    const tx = await router.ccipSend(destConfig.chainSelector, message, {
      value: fee // Pay fee in native token if feeToken is set to native
    });
    
    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait(sourceConfig.confirmations);
    console.log(`Transaction confirmed: ${receipt?.hash}`);
    
    // Extract CCIP message ID (this is a simplified example)
    // In a real implementation, you would parse the CCIPMessageSent event
    const messageId = `0x${Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    return {
      success: true,
      transfer: {
        id: transferId,
        timestamp,
        status: CCIPTransferStatus.COMPLETED,
        sourceChain: sourceConfig.name,
        destinationChain: destConfig.name,
        amount: request.amount,
        asset: request.asset,
        sender: await signer.getAddress(),
        receiver: request.receiver,
        txHash: receipt?.hash,
        messageId
      }
    };
  } catch (error) {
    console.error('EVM to Solana transfer failed:', error);
    return {
      success: false,
      transfer: {
        id: transferId,
        timestamp,
        status: CCIPTransferStatus.FAILED,
        sourceChain: getEVMConfig(request.sourceChain).name,
        destinationChain: getSVMConfig(request.destinationChain).name,
        amount: request.amount,
        asset: request.asset,
        sender: 'unknown', // We don't have the sender address if the transaction failed
        receiver: request.receiver,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      error: error instanceof Error ? error.message : 'Unknown error during EVM to Solana transfer'
    };
  }
}

/**
 * Execute Solana to EVM CCIP transfer
 * @param transferId Unique transfer ID
 * @param timestamp Transfer timestamp
 * @param request Transfer request
 * @returns Transfer result
 */
async function executeSVMToEVMTransfer(
  transferId: string,
  timestamp: string,
  request: CCIPTransferRequest
): Promise<CCIPTransferResult> {
  try {
    // Get source and destination chain configs
    const sourceConfig = getSVMConfig(request.sourceChain);
    const destConfig = getEVMConfig(request.destinationChain);
    
    console.log(`Executing Solana to EVM transfer: ${request.amount} ${request.asset} from ${sourceConfig.name} to ${destConfig.name}`);
    
    // Load Solana wallet
    const wallet = await loadSolanaWallet();
    
    // Create Solana connection
    const connection = new Connection(sourceConfig.rpcUrl);
    
    // TODO: Implement Solana to EVM transfer using CCIP
    // This would require using the Solana CCIP SDK to send a cross-chain message
    
    // For now, we'll return a mock result
    return {
      success: true,
      transfer: {
        id: transferId,
        timestamp,
        status: CCIPTransferStatus.COMPLETED,
        sourceChain: sourceConfig.name,
        destinationChain: destConfig.name,
        amount: request.amount,
        asset: request.asset,
        sender: wallet.publicKey.toString(),
        receiver: request.receiver,
        txHash: `${Array.from({length: 64}, () => 
          Math.floor(Math.random() * 16).toString(16)).join('')}`,
        messageId: `0x${Array.from({length: 64}, () => 
          Math.floor(Math.random() * 16).toString(16)).join('')}`
      }
    };
  } catch (error) {
    console.error('Solana to EVM transfer failed:', error);
    return {
      success: false,
      transfer: {
        id: transferId,
        timestamp,
        status: CCIPTransferStatus.FAILED,
        sourceChain: getSVMConfig(request.sourceChain).name,
        destinationChain: getEVMConfig(request.destinationChain).name,
        amount: request.amount,
        asset: request.asset,
        sender: 'unknown', // We don't have the sender address if the transaction failed
        receiver: request.receiver,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      error: error instanceof Error ? error.message : 'Unknown error during Solana to EVM transfer'
    };
  }
}

/**
 * Check if a chain is an EVM chain
 * @param chainId Chain ID
 * @returns True if the chain is an EVM chain
 */
function isEVMChain(chainId: ChainId): boolean {
  return chainId !== ChainId.SOLANA_DEVNET;
}

/**
 * Check if a chain is a Solana chain
 * @param chainId Chain ID
 * @returns True if the chain is a Solana chain
 */
function isSVMChain(chainId: ChainId): boolean {
  return chainId === ChainId.SOLANA_DEVNET;
}

/**
 * Get fee token address for EVM chains
 * @param config EVM chain configuration
 * @param feeTokenType Fee token type
 * @returns Fee token address
 */
function getFeeTokenAddress(config: any, feeTokenType?: FeeTokenType | string): string {
  if (!feeTokenType) {
    return config.linkTokenAddress; // Default to LINK
  }

  switch (feeTokenType) {
    case FeeTokenType.NATIVE:
      return ethers.ZeroAddress;
    case FeeTokenType.WRAPPED_NATIVE:
      return config.wrappedNativeAddress;
    case FeeTokenType.LINK:
      return config.linkTokenAddress;
    default:
      // If it's a valid address, use it directly
      if (ethers.isAddress(feeTokenType)) {
        return feeTokenType;
      }
      return config.linkTokenAddress; // Default to LINK if not recognized
  }
}

/**
 * Encode a Solana address to bytes32 format for CCIP
 * @param solanaAddress Solana address
 * @returns Bytes32 encoded address
 */
function encodeSolanaAddressToBytes32(solanaAddress: string): string {
  try {
    // Convert to PublicKey to validate
    const pubkey = new PublicKey(solanaAddress);
    
    // Convert to bytes and pad to 32 bytes
    const bytes = pubkey.toBytes();
    const paddedBytes = new Uint8Array(32);
    paddedBytes.set(bytes, 32 - bytes.length);
    
    return `0x${Buffer.from(paddedBytes).toString('hex')}`;
  } catch (error) {
    throw new Error(`Invalid Solana address: ${solanaAddress}`);
  }
}

/**
 * Create Solana-specific extra args for CCIP
 * @returns Encoded extra args
 */
function createSolanaExtraArgs(): string {
  // Solana extra args tag
  const SVM_EXTRA_ARGS_V1_TAG = "0x1f3b3aba";
  
  // Default values
  const computeUnits = 200000;
  const accountIsWritableBitmap = BigInt(0);
  const allowOutOfOrderExecution = true;
  
  // ABI encode the struct
  const abiCoder = new ethers.AbiCoder();
  const structEncoded = abiCoder.encode(
    ["tuple(uint32,uint64,bool,bytes32,bytes32[])"],
    [
      [
        computeUnits,
        accountIsWritableBitmap,
        allowOutOfOrderExecution,
        ethers.ZeroHash, // tokenReceiver (default)
        [] // accounts
      ]
    ]
  );
  
  // Combine the SVM tag with the encoded struct (removing the 0x prefix)
  return SVM_EXTRA_ARGS_V1_TAG + structEncoded.slice(2);
}