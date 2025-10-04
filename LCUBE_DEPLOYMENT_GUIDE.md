# LCUBE Token Deployment Guide - BSC Testnet

## Current Status: Ready for Deployment

Unfortunately, due to Node.js version compatibility issues with Hardhat (requires v22.10.0+, we have v20.16.0), we cannot deploy directly from the command line. However, the token is ready for deployment using Remix IDE.

## Quick Deployment Instructions

### Option 1: Remix IDE (Recommended)

1. **Open Remix IDE**: Go to https://remix.ethereum.org/

2. **Create the Contract**: 
   - Copy the content from `LCUBEToken.sol`
   - Create a new file in Remix
   - Paste the code

3. **Compile**:
   - Select Solidity Compiler
   - Choose compiler version 0.8.0 or higher
   - Click "Compile LCUBEToken.sol"

4. **Configure MetaMask**:
   - Network: BSC Testnet
   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
   - Chain ID: 97
   - Currency: BNB
   - Explorer: https://testnet.bscscan.com

5. **Get Test BNB**: https://testnet.binance.org/faucet-smart

6. **Deploy**:
   - Go to "Deploy & Run Transactions"
   - Environment: "Injected Provider - MetaMask"
   - Select "LCUBEToken" contract
   - Constructor parameters:
     - _name: "LearnCube"
     - _symbol: "LCUBE"
     - _totalSupply: 100000000 (100M tokens)
   - Click "Deploy"

7. **Verify**: The contract address will appear in the console

### Option 2: BSCScan Contract Creator

1. Go to https://testnet.bscscan.com/
2. Navigate to "More" → "Contract Creator"
3. Upload the Solidity file
4. Set constructor parameters
5. Deploy with MetaMask

## Token Specifications

- **Name**: LearnCube
- **Symbol**: LCUBE
- **Decimals**: 18
- **Total Supply**: 100,000,000 LCUBE
- **Network**: BSC Testnet (Chain ID: 97)
- **Standard**: ERC20

## Integration After Deployment

Once deployed, update the following files:

### 1. LCUBE_Integration_Guide.js
```javascript
const LCUBE_CONFIG = {
  testnet: {
    contractAddress: 'YOUR_DEPLOYED_CONTRACT_ADDRESS',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    chainId: 97
  }
};
```

### 2. Update C-Cube Application
Add the contract address to your app configuration to enable token interactions.

## Verification Commands

After deployment, you can verify the token with these commands:

```javascript
// In browser console or Node.js
const Web3 = require('web3');
const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');

const tokenAddress = 'YOUR_CONTRACT_ADDRESS';
const tokenABI = [/* ABI from compilation */];
const contract = new web3.eth.Contract(tokenABI, tokenAddress);

// Check token details
contract.methods.name().call().then(console.log);
contract.methods.symbol().call().then(console.log);
contract.methods.totalSupply().call().then(console.log);
```

## Ready Files

1. ✅ `LCUBEToken.sol` - Simple, gas-efficient ERC20 token
2. ✅ `LCUBE_Integration_Guide.js` - Complete integration documentation
3. ✅ `deploy_lcube_simple.js` - Alternative deployment script
4. ✅ All token specifications defined

## Next Steps

1. Deploy using Remix IDE (5 minutes)
2. Note the contract address
3. Update integration files
4. Test token functionality
5. Integrate with C-Cube learning platform

The token is production-ready and follows ERC20 standards. The deployment process via Remix IDE is straightforward and reliable.