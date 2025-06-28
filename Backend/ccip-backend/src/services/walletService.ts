import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load EVM wallet from private key
 * @param rpcUrl RPC URL for the provider
 * @returns Wallet instance
 */
export async function loadEVMWallet(rpcUrl: string): Promise<ethers.Wallet> {
  const privateKey = process.env.EVM_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('EVM private key not found in environment variables');
  }
  
  try {
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Log wallet address (not the private key)
    console.log(`Loaded EVM wallet: ${await wallet.getAddress()}`);
    
    return wallet;
  } catch (error) {
    console.error('Failed to load EVM wallet:', error);
    throw new Error('Failed to load EVM wallet');
  }
}

/**
 * Load Solana wallet from private key
 * @returns Solana Keypair
 */
export async function loadSolanaWallet(): Promise<Keypair> {
  const privateKeyString = process.env.SOLANA_PRIVATE_KEY;
  
  if (!privateKeyString) {
    throw new Error('Solana private key not found in environment variables');
  }
  
  try {
    // Convert private key string to Uint8Array
    // The private key can be in different formats, so we handle multiple cases
    let privateKeyBytes: Uint8Array;
    
    if (privateKeyString.includes(',')) {
      // Comma-separated array of numbers
      privateKeyBytes = Uint8Array.from(
        privateKeyString.split(',').map(num => parseInt(num.trim(), 10))
      );
    } else if (privateKeyString.startsWith('[') && privateKeyString.endsWith(']')) {
      // JSON array
      privateKeyBytes = Uint8Array.from(JSON.parse(privateKeyString));
    } else {
      // Base58 or hex string
      try {
        // Try to parse as base58
        privateKeyBytes = Uint8Array.from(Buffer.from(privateKeyString, 'base58'));
      } catch {
        // Try to parse as hex
        privateKeyBytes = Uint8Array.from(Buffer.from(privateKeyString, 'hex'));
      }
    }
    
    // Create keypair from private key
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    
    // Log public key
    console.log(`Loaded Solana wallet: ${keypair.publicKey.toString()}`);
    
    return keypair;
  } catch (error) {
    console.error('Failed to load Solana wallet:', error);
    throw new Error('Failed to load Solana wallet');
  }
}