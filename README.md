# CCIP Cross-Chain Transfer Implementation

This project demonstrates how to implement real cross-chain transfers using Chainlink's Cross-Chain Interoperability Protocol (CCIP). It includes both a frontend interface and a backend service to handle the actual blockchain interactions.

## Project Structure

The project is organized into two main parts:

1. **Frontend**: A React application with a user interface for initiating cross-chain transfers
2. **Backend**: A Node.js service that handles the actual blockchain interactions

### Frontend

The frontend is built with React, TypeScript, and Tailwind CSS. It provides a user interface for:

- Connecting wallets (Ethereum and Solana)
- Initiating cross-chain transfers
- Viewing transaction history
- Tracking transaction status

### Backend

The backend is a Node.js service that:

- Handles CCIP transfer requests from the frontend
- Manages private keys securely
- Interacts with blockchain networks
- Executes cross-chain transfers using CCIP
- Returns transaction status and details to the frontend

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- Ethereum and Solana wallets with testnet tokens
- API keys for Ethereum RPC providers (Infura, Alchemy, etc.)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ccip-cross-chain-transfer.git
   cd ccip-cross-chain-transfer
   ```

2. Install dependencies:
   ```
   # Install frontend dependencies
   cd Frontend
   npm install

   # Install backend dependencies
   cd ../Backend/ccip-backend
   npm install
   ```

3. Configure environment variables:
   
   **Backend**:
   Create a `.env` file in the `Backend/ccip-backend` directory based on the `.env.example` file:
   ```
   # EVM Configuration
   EVM_PRIVATE_KEY=your_evm_private_key_here
   ETHEREUM_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
   BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
   ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

   # Solana Configuration
   SOLANA_PRIVATE_KEY=your_solana_private_key_here
   SOLANA_RPC_URL=https://api.devnet.solana.com

   # Server Configuration
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   ```

   **Frontend**:
   Create a `.env` file in the `Frontend` directory:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

4. Build the backend:
   ```
   cd Backend/ccip-backend
   npm run build
   ```

5. Start the backend server:
   ```
   npm start
   ```

6. Start the frontend development server:
   ```
   cd Frontend
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5173`

## Using the Application

1. Connect your wallet using the "Connect Wallet" button
2. Navigate to the "Cross-Chain Transfer" section
3. Select the source and destination chains
4. Enter the amount and asset to transfer
5. Enter the receiver address on the destination chain
6. Select the fee token to use for CCIP fees
7. Click "Execute Transfer" to initiate the transfer
8. Monitor the transaction status in the "Transaction History" section

## Supported Chains

The application supports the following chains:

- **Ethereum Sepolia**: Ethereum testnet
- **Base Sepolia**: Base testnet
- **Optimism Sepolia**: Optimism testnet
- **Arbitrum Sepolia**: Arbitrum testnet
- **BSC Testnet**: Binance Smart Chain testnet
- **Solana Devnet**: Solana testnet

## Security Considerations

- **Private Keys**: The backend service manages private keys for signing transactions. Ensure that your `.env` file is secure and not committed to version control.
- **RPC URLs**: Use secure RPC providers and consider using API keys with restricted access.
- **Error Handling**: The application includes error handling to prevent unexpected behavior.

## Troubleshooting

- **Transaction Fails**: Ensure you have enough tokens for the transfer and fees
- **Connection Issues**: Check your internet connection and RPC provider status
- **Wallet Connection**: Make sure your wallet is connected to the correct network

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Chainlink CCIP](https://chain.link/cross-chain)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Ethers.js](https://docs.ethers.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)