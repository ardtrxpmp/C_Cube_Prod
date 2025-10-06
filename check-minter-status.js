#!/usr/bin/env node

const { ethers } = require('ethers');
require('dotenv').config();

async function checkMinterWallet() {
  console.log('🔍 Checking Minter Wallet Status...\n');

  try {
    // Configuration
    const rpcUrl = process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x742d35cc6635c0532925a3b8d5c9d7c5e6c5c0d2";

    if (!privateKey) {
      console.log('❌ PRIVATE_KEY not found in environment variables');
      console.log('📝 Please add your private key to .env file or environment variables');
      return;
    }

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('📊 Minter Wallet Information:');
    console.log('🏦 Address:', wallet.address);
    console.log('🌐 Network: BSC Testnet');
    console.log('📝 Contract:', contractAddress);
    console.log('');

    // Check BNB balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInBNB = ethers.formatEther(balance);
    
    console.log('💰 Current BNB Balance:', balanceInBNB, 'BNB');
    
    // Check if balance is sufficient
    const minRequired = 0.01;
    const isBalanceSufficient = parseFloat(balanceInBNB) >= minRequired;
    
    if (isBalanceSufficient) {
      console.log('✅ Balance is sufficient for gas fees');
    } else {
      console.log('❌ Insufficient balance for gas fees');
      console.log(`💡 Minimum required: ${minRequired} BNB`);
      console.log(`🚨 Please send at least ${minRequired - parseFloat(balanceInBNB)} BNB to:`, wallet.address);
    }

    console.log('');

    // Check contract connection
    try {
      const contractABI = [
        "function name() external view returns (string)",
        "function symbol() external view returns (string)",
        "function totalSupply() external view returns (uint256)",
        "function authorizedMinters(address) external view returns (bool)"
      ];

      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      const name = await contract.name();
      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();
      const isMinter = await contract.authorizedMinters(wallet.address);

      console.log('🪙 Token Contract Information:');
      console.log('📛 Name:', name);
      console.log('🏷️ Symbol:', symbol);
      console.log('📊 Total Supply:', ethers.formatEther(totalSupply), symbol);
      console.log('🔑 Is Authorized Minter:', isMinter ? '✅ Yes' : '❌ No');

      if (!isMinter) {
        console.log('');
        console.log('🚨 WARNING: Wallet is not authorized to mint tokens!');
        console.log('📝 Add this address as an authorized minter in the contract:');
        console.log('   ', wallet.address);
      }

    } catch (contractError) {
      console.log('❌ Failed to connect to contract:', contractError.message);
      console.log('🔍 Please check if the contract address is correct');
    }

    console.log('');
    console.log('🎯 Next Steps:');
    
    if (!isBalanceSufficient) {
      console.log('1. 💰 Fund the minter wallet with BNB for gas fees');
      console.log('   📍 Send to:', wallet.address);
      console.log('   💵 Amount: At least', (minRequired - parseFloat(balanceInBNB)).toFixed(4), 'BNB');
      console.log('   🌐 Network: BSC Testnet');
      console.log('   💡 You can get testnet BNB from: https://testnet.binance.org/faucet-smart');
    }
    
    console.log('2. 🚀 Start the migration API server: npm run start-migration-server');
    console.log('3. ✅ Test migration in the C-Cube app');

  } catch (error) {
    console.error('❌ Error checking minter wallet:', error.message);
  }
}

// Run the check
checkMinterWallet();