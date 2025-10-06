#!/usr/bin/env node

const { ethers } = require('ethers');

async function checkTokenTransfer() {
  console.log('🔍 Checking Token Transfer Status...\n');

  const contractAddress = "0x4b35C661652700953A8E23704AE6211D447C412A";
  const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const contractABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function name() external view returns (string)",
      "function symbol() external view returns (string)",
      "function decimals() external view returns (uint8)"
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Get contract info
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();

    console.log('📋 Token Contract Information:');
    console.log('📍 Address:', contractAddress);
    console.log('📛 Name:', name);
    console.log('🏷️ Symbol:', symbol);
    console.log('🔢 Decimals:', decimals);
    console.log('📊 Total Supply:', ethers.formatUnits(totalSupply, decimals), symbol);
    console.log('');

    // Check if you can provide a wallet address to check balance
    console.log('💡 To check if tokens were transferred to your wallet:');
    console.log('1. Replace YOUR_WALLET_ADDRESS below with your actual address');
    console.log('2. Run this function again');
    console.log('');

    // Example: Check a specific wallet balance (replace with actual address)
    const testAddress = "0x1234567890123456789012345678901234567890"; // Replace with real address
    
    console.log('🔍 Checking example address:', testAddress);
    try {
      const balance = await contract.balanceOf(testAddress);
      const formattedBalance = ethers.formatUnits(balance, decimals);
      console.log('💰 Balance:', formattedBalance, symbol);
    } catch (error) {
      console.log('⚠️ Could not check balance (invalid address or network issue)');
    }

    console.log('');
    console.log('🛠️ Troubleshooting Token Transfer Issues:');
    console.log('');
    console.log('1. 🔍 Transaction Not Mined:');
    console.log('   - Check if transaction was actually sent');
    console.log('   - Verify sufficient gas fees were paid');
    console.log('   - Check BSC Testnet explorer: https://testnet.bscscan.com/');
    console.log('');
    console.log('2. 🔑 Private Key Issues:');
    console.log('   - Ensure C-Cube wallet private key is valid');
    console.log('   - Check wallet has BNB for gas fees');
    console.log('   - Verify wallet address matches the one receiving tokens');
    console.log('');
    console.log('3. 📱 Token Visibility:');
    console.log('   - Tokens may be transferred but not visible in wallet app');
    console.log('   - Must manually add token to wallet:');
    console.log('     • Contract: 0x4b35C661652700953A8E23704AE6211D447C412A');
    console.log('     • Symbol: LCUBE');
    console.log('     • Decimals: 18');
    console.log('');
    console.log('4. 🌐 Network Issues:');
    console.log('   - Ensure wallet is connected to BSC Testnet');
    console.log('   - Check RPC connection');
    console.log('   - Verify contract exists on BSC Testnet');
    console.log('');
    console.log('5. 🔄 Migration API Issues:');
    console.log('   - Check if API server is running on port 3001');
    console.log('   - Verify migration request was successful');
    console.log('   - Check browser console for errors');

    console.log('');
    console.log('📊 Next Steps to Verify Transfer:');
    console.log('1. Go to: http://localhost:3003');
    console.log('2. Connect your C-Cube wallet');
    console.log('3. Check the migration dashboard for your balance');
    console.log('4. Try migrating some test points');
    console.log('5. Check browser network tab for API calls');
    console.log('6. Add LCUBE token to your wallet app');

  } catch (error) {
    console.error('❌ Failed to check token contract:', error.message);
    console.log('');
    console.log('💡 Possible Issues:');
    console.log('- Network connection problem');
    console.log('- Contract address incorrect');
    console.log('- BSC Testnet RPC issues');
  }
}

// Run the check
checkTokenTransfer();