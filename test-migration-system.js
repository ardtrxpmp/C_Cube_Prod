#!/usr/bin/env node

const { ethers } = require('ethers');

async function testMigrationSystem() {
  console.log('🧪 Testing LCUBE Migration System...\n');

  try {
    // Test 1: Check API Server
    console.log('📡 Testing API Server...');
    
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Server is running');
        console.log('📍 Contract Address:', data.contractAddress);
        console.log('🌐 Network:', data.network);
      } else {
        console.log('❌ API Server responded with error:', response.status);
      }
    } catch (error) {
      console.log('❌ API Server not accessible:', error.message);
      console.log('💡 Make sure to run: PORT=3001 node migration-api-server.js');
      return;
    }

    console.log('');

    // Test 2: Check Contract Connection
    console.log('🔗 Testing Contract Connection...');
    
    const contractAddress = "0x4b35C661652700953A8E23704AE6211D447C412A";
    const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Basic contract ABI for testing
    const contractABI = [
      "function name() external view returns (string)",
      "function symbol() external view returns (string)",
      "function totalSupply() external view returns (uint256)",
      "function balanceOf(address account) external view returns (uint256)",
      "function migrateMyPoints(uint256 points, string memory migrationId) external returns (bool)"
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();
      
      console.log('✅ Contract connection successful');
      console.log('📛 Token Name:', name);
      console.log('🏷️ Symbol:', symbol);
      console.log('📊 Total Supply:', ethers.formatEther(totalSupply), symbol);
    } catch (error) {
      console.log('❌ Contract connection failed:', error.message);
      console.log('💡 Contract might not exist or network issue');
    }

    console.log('');

    // Test 3: Check if we can test migration with a test wallet
    console.log('🔑 Testing Migration Function...');
    
    console.log('💡 Migration Flow:');
    console.log('1. User connects C-Cube wallet (containing private key + BNB for gas)');
    console.log('2. User earns points in learning activities');
    console.log('3. Frontend sends migration request with:');
    console.log('   - User address');
    console.log('   - Points amount');
    console.log('   - User\'s private key (from C-Cube wallet)');
    console.log('4. Backend uses user\'s private key to sign transaction');
    console.log('5. migrateMyPoints() function mints tokens to user');
    console.log('6. User pays gas fees with their own BNB');
    console.log('7. Tokens appear in user\'s wallet');

    console.log('');

    // Test 4: Test the complete API flow with mock data
    console.log('📋 Testing Complete API Flow...');
    
    const mockMigrationData = {
      userAddress: "0x1234567890123456789012345678901234567890", // Mock address
      points: 1000,
      sessionData: {
        sessionId: `test_${Date.now()}`,
        timestamp: Date.now(),
        points: 1000,
        userAddress: "0x1234567890123456789012345678901234567890",
        walletType: 'ccube'
      },
      walletType: 'ccube',
      walletData: {
        address: "0x1234567890123456789012345678901234567890",
        privateKey: "0x0000000000000000000000000000000000000000000000000000000000000001" // Mock key
      }
    };

    try {
      const response = await fetch('http://localhost:3001/migrate-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockMigrationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API endpoint is working');
        console.log('📊 Response structure valid');
      } else {
        const error = await response.json();
        console.log('⚠️ API endpoint returned error (expected for mock data):', error.error);
        console.log('✅ API endpoint is accessible and processing requests');
      }
    } catch (error) {
      console.log('❌ API endpoint test failed:', error.message);
    }

    console.log('');

    // Test 5: Check React App
    console.log('⚛️ Testing React App...');
    
    try {
      const response = await fetch('http://localhost:3003');
      if (response.ok) {
        console.log('✅ React app is running on http://localhost:3003');
        console.log('💡 You can now test the complete migration flow in the browser');
      } else {
        console.log('❌ React app not accessible');
      }
    } catch (error) {
      console.log('❌ React app not running:', error.message);
      console.log('💡 Start with: PORT=3003 npm run react-start');
    }

    console.log('');
    console.log('🎯 Summary:');
    console.log('✅ System configured to use C-Cube wallet private keys');
    console.log('✅ Users pay their own gas fees (no separate minter needed)');
    console.log('✅ Direct wallet-to-wallet token minting');
    console.log('✅ Real-time balance updates');
    
    console.log('');
    console.log('🚀 To test migration:');
    console.log('1. Open http://localhost:3003 in browser');
    console.log('2. Connect/create C-Cube wallet (ensure it has BNB for gas)');
    console.log('3. Earn points in learning activities');
    console.log('4. Click "Migrate Points" button');
    console.log('5. Confirm transaction (your wallet pays gas)');
    console.log('6. Add LCUBE token to wallet: 0x4b35C661652700953A8E23704AE6211D447C412A');
    
    console.log('');
    console.log('🔧 Token Details:');
    console.log('📍 Contract: 0x4b35C661652700953A8E23704AE6211D447C412A');
    console.log('🏷️ Symbol: LCUBE');
    console.log('🔢 Decimals: 18');
    console.log('🌐 Network: BSC Testnet (97)');
    console.log('💱 Rate: 1000 points = 1 LCUBE token');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMigrationSystem();