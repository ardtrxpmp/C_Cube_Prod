# BSC Testnet Token Creator

A simple tool to create and deploy ERC-20 tokens on Binance Smart Chain (BSC) Testnet.

## Features

- ✅ Deploy custom ERC-20 tokens to BSC Testnet
- ✅ Configurable token parameters via environment variables
- ✅ Built-in contract compilation
- ✅ Automatic transaction verification
- ✅ Deployment info logging
- ✅ Gas optimization

## Prerequisites

- Node.js (v16 or later)
- A wallet with BSC Testnet BNB for gas fees
- Private key of the deploying wallet

## Quick Start

### 1. Setup

```bash
# Navigate to token creator directory
cd token-creator

# Run setup script
node setup.js
```

### 2. Configure Environment

Edit the `.env` file with your details:

```env
# Wallet Configuration
WALLET_ADDRESS=0xYourWalletAddress
PRIVATE_KEY=your_private_key_without_0x_prefix

# Token Configuration
TOKEN_NAME=MyAwesomeToken
TOKEN_SYMBOL=MAT
TOKEN_DECIMALS=18
INITIAL_SUPPLY=1000000

# Network Configuration (defaults provided)
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
CHAIN_ID=97
```

### 3. Get Testnet BNB

Visit the [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart) to get free testnet BNB for gas fees.

### 4. Deploy Token

```bash
npm run deploy
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `WALLET_ADDRESS` | Your wallet address | ✅ | - |
| `PRIVATE_KEY` | Your wallet private key (without 0x) | ✅ | - |
| `TOKEN_NAME` | Name of your token | ✅ | - |
| `TOKEN_SYMBOL` | Token symbol/ticker | ✅ | - |
| `TOKEN_DECIMALS` | Number of decimals | ❌ | 18 |
| `INITIAL_SUPPLY` | Initial token supply | ✅ | - |
| `BSC_TESTNET_RPC` | BSC Testnet RPC URL | ❌ | Binance default |
| `CHAIN_ID` | BSC Testnet Chain ID | ❌ | 97 |
| `GAS_LIMIT` | Gas limit for deployment | ❌ | 2000000 |
| `GAS_PRICE` | Gas price in gwei | ❌ | Network default |

## Token Features

The deployed token includes:

- ✅ Standard ERC-20 functionality
- ✅ Minting capability (owner only)
- ✅ Burning capability
- ✅ Ownership transfer
- ✅ Full compliance with ERC-20 standard

## File Structure

```
token-creator/
├── contracts/
│   └── CustomToken.sol      # Smart contract
├── deploy.js                # Deployment script
├── setup.js                 # Setup script
├── package.json             # Dependencies
├── .env.example             # Environment template
├── .env                     # Your configuration (created by setup)
├── deployment-info.json     # Deployment results (created after deploy)
└── README.md               # This file
```

## After Deployment

After successful deployment, you'll receive:

- 📄 Contract address
- 🔗 Transaction hash
- 🌐 BSCScan testnet link
- 💾 Saved deployment info in `deployment-info.json`

## Example Output

```
🎉 TOKEN DEPLOYED SUCCESSFULLY! 🎉
==================================================
📄 Contract Address: 0x1234567890123456789012345678901234567890
🔗 Transaction Hash: 0xabc123...
🌐 BSC Testnet Explorer: https://testnet.bscscan.com/address/0x1234...
📊 Token Details:
   Name: MyAwesomeToken
   Symbol: MAT
   Total Supply: 1000000 MAT
==================================================
```

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit your `.env` file** - it contains your private key
2. **Use testnet only** - this tool is for testing purposes
3. **Keep private keys secure** - never share them publicly
4. **Verify contracts** - always verify on BSCScan after deployment

## Troubleshooting

### Common Issues

**Insufficient Funds Error:**
- Get testnet BNB from the faucet
- Check your wallet balance

**Gas Estimation Error:**
- Increase `GAS_LIMIT` in .env
- Check network connectivity

**RPC Error:**
- Try a different BSC Testnet RPC endpoint
- Check internet connection

### Support

For issues or questions:
1. Check the error message carefully
2. Verify your .env configuration
3. Ensure you have testnet BNB
4. Check BSC Testnet status

## License

MIT License - feel free to modify and use for your projects.

---

**Disclaimer:** This tool is for educational and testing purposes only. Always audit smart contracts before mainnet deployment.