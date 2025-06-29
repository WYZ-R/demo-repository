import { ethers } from "ethers";
import {
  PublicKey,
  Connection,
  ConnectionConfig,
  SystemProgram,
} from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";

/**
 * Supported Chain IDs for CCIP operations
 */
export enum ChainId {
  ETHEREUM_SEPOLIA = "ethereum-sepolia",
  BASE_SEPOLIA = "base-sepolia",
  OPTIMISM_SEPOLIA = "optimism-sepolia",
  BSC_TESTNET = "bsc-testnet",
  ARBITRUM_SEPOLIA = "arbitrum-sepolia",
  SOLANA_DEVNET = "solana-devnet",
  SONIC_BLAZE = "sonic-blaze",
}

/**
 * Chain selectors used to identify chains in CCIP
 */
export const CHAIN_SELECTORS: Record<ChainId, bigint> = {
  [ChainId.ETHEREUM_SEPOLIA]: BigInt("16015286601757825753"),
  [ChainId.BASE_SEPOLIA]: BigInt("10344971235874465080"),
  [ChainId.OPTIMISM_SEPOLIA]: BigInt("5224473277236331295"),
  [ChainId.BSC_TESTNET]: BigInt("13264668187771770619"),
  [ChainId.ARBITRUM_SEPOLIA]: BigInt("3478487238524512106"),
  [ChainId.SOLANA_DEVNET]: BigInt("16423721717087811551"),
  [ChainId.SONIC_BLAZE]: BigInt("3676871237479449268"),
};

/**
 * Fee token types supported by CCIP
 */
export enum FeeTokenType {
  NATIVE = "native",
  WRAPPED_NATIVE = "wrapped-native",
  LINK = "link",
}

/**
 * Asset types supported for transfer
 */
export enum AssetType {
  USDC = "USDC",
  BNM = "BnM",
  LINK = "LINK",
  ETH = "ETH",
  SOL = "SOL",
  CUSTOM = "CUSTOM"
}

/**
 * EVM Chain Configuration
 */
export interface EVMChainConfig {
  id: ChainId;
  name: string;
  rpcUrl: string;
  chainId: number; // Numeric chain ID (e.g., 11155111 for Sepolia)
  chainSelector: bigint;
  routerAddress: string;
  tokenAdminRegistryAddress: string;
  bnmTokenAddress: string;
  faucetAddress?: string;
  linkTokenAddress: string;
  wrappedNativeAddress: string;
  explorerBaseUrl: string;
  confirmations?: number; // Number of block confirmations to wait for
  supportedAssets: AssetType[];
}

/**
 * Solana Chain Configuration
 */
export interface SVMChainConfig {
  id: ChainId;
  name: string;
  connectionConfig: ConnectionConfig;
  connection: Connection;
  routerProgramId: PublicKey;
  feeQuoterProgramId: PublicKey;
  rmnRemoteProgramId: PublicKey;
  bnmTokenMint: PublicKey;
  linkTokenMint: PublicKey;
  wrappedNativeMint: PublicKey;
  explorerUrl: string;
  supportedAssets: AssetType[];

  // Fields required for CCIPCoreConfig compatibility
  nativeSol: PublicKey;
  systemProgramId: PublicKey;
  receiverProgramId: PublicKey;
}

// IMPORTANT: For frontend usage, hardcode RPC URLs or use Vite's environment variables (VITE_ prefix)
// For production, consider more secure ways to manage these.
const EVM_RPC_URLS = {
  [ChainId.ETHEREUM_SEPOLIA]: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID", // Replace with your Infura Project ID or other RPC
  [ChainId.BASE_SEPOLIA]: "https://sepolia.base.org",
  [ChainId.OPTIMISM_SEPOLIA]: "https://sepolia.optimism.io",
  [ChainId.BSC_TESTNET]: "https://data-seed-prebsc-1-s1.binance.org:8545",
  [ChainId.ARBITRUM_SEPOLIA]: "https://sepolia-rollup.arbitrum.io/rpc",
  [ChainId.SONIC_BLAZE]: "https://rpc.sonic.game",
};

/**
 * EVM Chain Configurations
 */
const EVM_CONFIGS: Record<
  | ChainId.ETHEREUM_SEPOLIA
  | ChainId.BASE_SEPOLIA
  | ChainId.OPTIMISM_SEPOLIA
  | ChainId.BSC_TESTNET
  | ChainId.ARBITRUM_SEPOLIA
  | ChainId.SONIC_BLAZE,
  EVMChainConfig
> = {
  [ChainId.ETHEREUM_SEPOLIA]: {
    id: ChainId.ETHEREUM_SEPOLIA,
    name: "Ethereum Sepolia",
    rpcUrl: EVM_RPC_URLS[ChainId.ETHEREUM_SEPOLIA],
    chainId: 11155111,
    chainSelector: CHAIN_SELECTORS[ChainId.ETHEREUM_SEPOLIA],
    routerAddress: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    tokenAdminRegistryAddress: "0x95F29FEE11c5C55d26cCcf1DB6772DE953B37B82",
    bnmTokenAddress: "0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05", // BnM on Sepolia
    faucetAddress: "0x12B0a29ac7dF641e480D195aD79BC1ae2c0B9BcA",
    linkTokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    wrappedNativeAddress: "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534",
    explorerBaseUrl: "https://sepolia.etherscan.io/",
    confirmations: 3, // Wait for 3 blocks for better reliability
    supportedAssets: [AssetType.USDC, AssetType.BNM, AssetType.LINK, AssetType.ETH],
  },
  [ChainId.BASE_SEPOLIA]: {
    id: ChainId.BASE_SEPOLIA,
    name: "Base Sepolia",
    rpcUrl: EVM_RPC_URLS[ChainId.BASE_SEPOLIA],
    chainId: 84532,
    chainSelector: CHAIN_SELECTORS[ChainId.BASE_SEPOLIA],
    routerAddress: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
    tokenAdminRegistryAddress: "0x736D0bBb318c1B27Ff686cd19804094E66250e17",
    bnmTokenAddress: "0x88A2d74F47a237a62e7A51cdDa67270CE381555e",
    faucetAddress: "",
    linkTokenAddress: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    wrappedNativeAddress: "0x4200000000000000000000000000000000000006",
    explorerBaseUrl: "https://sepolia.basescan.org/",
    confirmations: 3, // Wait for 3 blocks for better reliability
    supportedAssets: [AssetType.USDC, AssetType.BNM, AssetType.LINK, AssetType.ETH],
  },
  [ChainId.OPTIMISM_SEPOLIA]: {
    id: ChainId.OPTIMISM_SEPOLIA,
    name: "Optimism Sepolia",
    rpcUrl: EVM_RPC_URLS[ChainId.OPTIMISM_SEPOLIA],
    chainId: 11155420,
    chainSelector: CHAIN_SELECTORS[ChainId.OPTIMISM_SEPOLIA],
    routerAddress: "0x114A20A10b43D4115e5aeef7345a1A71d2a60C57",
    tokenAdminRegistryAddress: "0x1d702b1FA12F347f0921C722f9D9166F00DEB67A",
    bnmTokenAddress: "0x8aF4204e30565DF93352fE8E1De78925F6664dA7",
    faucetAddress: "",
    linkTokenAddress: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    wrappedNativeAddress: "0x4200000000000000000000000000000000000006",
    explorerBaseUrl: "sepolia-optimism.etherscan.io/",
    confirmations: 3, // Wait for 3 blocks for better reliability
    supportedAssets: [AssetType.USDC, AssetType.BNM, AssetType.LINK, AssetType.ETH],
  },
  [ChainId.BSC_TESTNET]: {
    id: ChainId.BSC_TESTNET,
    name: "BSC Testnet",
    rpcUrl: EVM_RPC_URLS[ChainId.BSC_TESTNET],
    chainId: 97,
    chainSelector: CHAIN_SELECTORS[ChainId.BSC_TESTNET],
    routerAddress: "0xE1053aE1857476f36A3C62580FF9b016E8EE8F6f",
    tokenAdminRegistryAddress: "0xF8f2A4466039Ac8adf9944fD67DBb3bb13888f2B",
    bnmTokenAddress: "0xbFA2ACd33ED6EEc0ed3Cc06bF1ac38d22b36B9e9",
    faucetAddress: "",
    linkTokenAddress: "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06",
    wrappedNativeAddress: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    explorerBaseUrl: "https://testnet.bscscan.com/",
    confirmations: 3, // Wait for 3 blocks for better reliability
    supportedAssets: [AssetType.USDC, AssetType.BNM, AssetType.LINK, AssetType.ETH],
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    id: ChainId.ARBITRUM_SEPOLIA,
    name: "Arbitrum Sepolia",
    rpcUrl: EVM_RPC_URLS[ChainId.ARBITRUM_SEPOLIA],
    chainId: 421614,
    chainSelector: CHAIN_SELECTORS[ChainId.ARBITRUM_SEPOLIA],
    routerAddress: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
    tokenAdminRegistryAddress: "0x8126bE56454B628a88C17849B9ED99dd5a11Bd2f",
    bnmTokenAddress: "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D",
    faucetAddress: "",
    linkTokenAddress: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    wrappedNativeAddress: "0xE591bf0A0CF924A0674d7792db046B23CEbF5f34",
    explorerBaseUrl: "https://sepolia.arbiscan.io/",
    confirmations: 3, // Wait for 3 blocks for better reliability
    supportedAssets: [AssetType.USDC, AssetType.BNM, AssetType.LINK, AssetType.ETH],
  },
  [ChainId.SONIC_BLAZE]: {
    id: ChainId.SONIC_BLAZE,
    name: "Sonic Blaze",
    rpcUrl: EVM_RPC_URLS[ChainId.SONIC_BLAZE],
    chainId: 57054,
    chainSelector: CHAIN_SELECTORS[ChainId.SONIC_BLAZE],
    routerAddress: "0x2fBd4659774D468Db5ca5bacE37869905d8EfA34",
    tokenAdminRegistryAddress: "0xB87d268E7E5d921c72d1D999fa6a2Bfc6A5dBC5C",
    bnmTokenAddress: "0x230c46b9a7c8929A80863bDe89082B372a4c7A99",
    faucetAddress: "",
    linkTokenAddress: "0xd8C1eEE32341240A62eC8BC9988320bcC13c8580",
    wrappedNativeAddress: "0x917FE4b784d1895187Df169aeCc687C03ba12662",
    explorerBaseUrl: "https://testnet.sonicscan.org/",
    confirmations: 3, // Wait for 3 blocks for better reliability
    supportedAssets: [AssetType.USDC, AssetType.BNM, AssetType.LINK, AssetType.ETH],
  },
};

/**
 * Solana Chain Configurations
 */
const SVM_CONFIGS: Record<ChainId.SOLANA_DEVNET, SVMChainConfig> = {
  [ChainId.SOLANA_DEVNET]: {
    id: ChainId.SOLANA_DEVNET,
    name: "Solana Devnet",
    connectionConfig: {
      commitment: "confirmed",
      disableRetryOnRateLimit: false,
    },
    connection: new Connection(
      "https://api.devnet.solana.com", // Hardcode Solana Devnet RPC
      { commitment: "confirmed" }
    ),
    routerProgramId: new PublicKey(
      "Ccip842gzYHhvdDkSyi2YVCoAWPbYJoApMFzSxQroE9C"
    ),
    feeQuoterProgramId: new PublicKey(
      "FeeQPGkKDeRV1MgoYfMH6L8o3KeuYjwUZrgn4LRKfjHi"
    ),
    rmnRemoteProgramId: new PublicKey(
      "RmnXLft1mSEwDgMKu2okYuHkiazxntFFcZFrrcXxYg7"
    ),
    bnmTokenMint: new PublicKey("3PjyGzj1jGVgHSKS4VR1Hr1memm63PmN8L9rtPDKwzZ6"), // BnM on Solana Devnet
    linkTokenMint: new PublicKey("LinkhB3afbBKb2EQQu7s7umdZceV3wcvAUJhQAfQ23L"),
    wrappedNativeMint: NATIVE_MINT,
    explorerUrl: "https://explorer.solana.com/tx/",
    supportedAssets: [AssetType.USDC, AssetType.BNM, AssetType.LINK, AssetType.SOL],

    // Fields required for CCIPCoreConfig compatibility
    nativeSol: PublicKey.default,
    systemProgramId: SystemProgram.programId,
    receiverProgramId: new PublicKey(
      "BqmcnLFSbKwyMEgi7VhVeJCis1wW26VySztF34CJrKFq"
    ), // CCIP Basic Receiver (see programs/ccip-basic-receiver/src/lib.rs)
  },
};

/**
 * Get EVM chain configuration by chain ID
 */
export function getEVMConfig(chainId: ChainId): EVMChainConfig {
  const config = EVM_CONFIGS[chainId];
  if (!config) {
    throw new Error(`Unsupported or unconfigured EVM chain ID: ${chainId}`);
  }
  return config;
}

/**
 * Get Solana chain configuration by chain ID
 */
export function getCCIPSVMConfig(chainId: ChainId): SVMChainConfig {
  if (chainId !== ChainId.SOLANA_DEVNET) {
    throw new Error(`Unsupported SVM chain ID: ${chainId}`);
  }
  return SVM_CONFIGS[chainId];
}

/**
 * Get EVM fee token address based on config and token type
 */
export function getEVMFeeTokenAddress(
  config: EVMChainConfig,
  feeTokenType?: string
): string {
  if (!feeTokenType) {
    return config.linkTokenAddress; // Default to LINK
  }

  switch (feeTokenType.toLowerCase()) {
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
 * Get SVM fee token based on config and token type
 */
export function getSVMFeeToken(
  config: SVMChainConfig,
  feeTokenType?: string
): PublicKey {
  if (!feeTokenType) {
    return PublicKey.default; // Default to native SOL
  }

  switch (feeTokenType.toLowerCase()) {
    case FeeTokenType.NATIVE:
      return PublicKey.default;
    case FeeTokenType.WRAPPED_NATIVE:
      return config.wrappedNativeMint;
    case FeeTokenType.LINK:
      return config.linkTokenMint;
    default:
      // Try to parse as a public key
      try {
        return new PublicKey(feeTokenType);
      } catch {
        return PublicKey.default; // Default to native SOL if not recognized
      }
  }
}

/**
 * Get explorer URL for a specific chain and transaction hash
 */
export function getExplorerUrl(chainId: ChainId, txHash: string): string {
  if (
    chainId === ChainId.ETHEREUM_SEPOLIA ||
    chainId === ChainId.BASE_SEPOLIA ||
    chainId === ChainId.OPTIMISM_SEPOLIA ||
    chainId === ChainId.BSC_TESTNET ||
    chainId === ChainId.ARBITRUM_SEPOLIA ||
    chainId === ChainId.SONIC_BLAZE
  ) {
    const baseUrl = EVM_CONFIGS[chainId].explorerBaseUrl;
    // Ensure base URL ends with a slash for proper URL joining
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    return `${normalizedBaseUrl}tx/${txHash}`;
  } else if (chainId === ChainId.SOLANA_DEVNET) {
    const baseUrl = SVM_CONFIGS[ChainId.SOLANA_DEVNET].explorerUrl;
    // Ensure base URL ends with a slash for proper URL joining
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    return `${normalizedBaseUrl}${txHash}?cluster=devnet`;
  }
  throw new Error(`No explorer URL available for chain ID: ${chainId}`);
}

/**
 * Get asset address for a specific chain and asset type
 */
export function getAssetAddress(chainId: ChainId, assetType: AssetType): string | PublicKey {
  if (chainId === ChainId.SOLANA_DEVNET) {
    const config = SVM_CONFIGS[ChainId.SOLANA_DEVNET];
    switch (assetType) {
      case AssetType.BNM:
        return config.bnmTokenMint;
      case AssetType.LINK:
        return config.linkTokenMint;
      case AssetType.SOL:
        return PublicKey.default;
      case AssetType.USDC:
        // This is a placeholder - replace with actual USDC mint on Solana Devnet
        return new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      default:
        return PublicKey.default;
    }
  } else {
    const config = EVM_CONFIGS[chainId as keyof typeof EVM_CONFIGS];
    if (!config) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    
    switch (assetType) {
      case AssetType.BNM:
        return config.bnmTokenAddress;
      case AssetType.LINK:
        return config.linkTokenAddress;
      case AssetType.ETH:
        return ethers.ZeroAddress; // Use zero address for native ETH
      case AssetType.USDC:
        // This is a placeholder - replace with actual USDC address on the specific chain
        return "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      default:
        return ethers.ZeroAddress;
    }
  }
}

/**
 * Get supported assets for a specific chain
 */
export function getSupportedAssets(chainId: ChainId): AssetType[] {
  if (chainId === ChainId.SOLANA_DEVNET) {
    return SVM_CONFIGS[ChainId.SOLANA_DEVNET].supportedAssets;
  } else {
    const config = EVM_CONFIGS[chainId as keyof typeof EVM_CONFIGS];
    if (!config) {
      return [AssetType.USDC, AssetType.BNM, AssetType.LINK];
    }
    return config.supportedAssets;
  }
}