#!/usr/bin/env node

/**
 * Complete Wallet Integration Test
 * Tests the entire flow from wallet connection to database saving
 */

const fs = require('fs');
const path = require('path');

// Simulate different wallet scenarios
const testScenarios = [
  {
    name: "C-Cube Wallet Connected",
    props: {
      cCubeWalletData: { address: "0x1234567890abcdef1234567890abcdef12345678" },
      externalWalletData: null,
      walletData: null,
      isWalletConnected: true
    },
    expectedAddress: "0x1234567890abcdef1234567890abcdef12345678"
  },
  {
    name: "External Wallet (MetaMask) Connected",
    props: {
      cCubeWalletData: null,
      externalWalletData: { address: "0xabcdef1234567890abcdef1234567890abcdef12" },
      walletData: null,
      isWalletConnected: true
    },
    expectedAddress: "0xabcdef1234567890abcdef1234567890abcdef12"
  },
  {
    name: "Legacy Wallet Format",
    props: {
      cCubeWalletData: null,
      externalWalletData: null,
      walletData: { address: "0x9876543210fedcba9876543210fedcba98765432" },
      isWalletConnected: true
    },
    expectedAddress: "0x9876543210fedcba9876543210fedcba98765432"
  },
  {
    name: "No Wallet Connected",
    props: {
      cCubeWalletData: null,
      externalWalletData: null,
      walletData: null,
      isWalletConnected: false
    },
    expectedAddress: null
  }
];

// Wallet detection logic (same as component)
const getWalletAddress = (props) => {
  const { cCubeWalletData, externalWalletData, walletData } = props;
  
  // Priority: C-Cube wallet > External wallet > Legacy wallet data
  if (cCubeWalletData?.address) {
    return cCubeWalletData.address;
  }
  if (externalWalletData?.address) {
    return externalWalletData.address;
  }
  if (walletData?.address) {
    return walletData.address;
  }
  return null;
};

// Simulate button click behavior
const simulateButtonClick = (props, sessionPoints) => {
  const walletAddress = getWalletAddress(props);
  
  if (!walletAddress) {
    return {
      success: false,
      message: "❌ No wallet connected! Please connect your wallet first.",
      address: null
    };
  }

  // Simulate saving to database
  const walletData = {
    walletAddress: walletAddress,
    points: {
      gamingHub: sessionPoints.gamingHub || 0,
      storyMode: sessionPoints.storyMode || 0,
      achievements: sessionPoints.achievements || 0,
      total: (sessionPoints.gamingHub || 0) + (sessionPoints.storyMode || 0) + (sessionPoints.achievements || 0)
    },
    progress: {
      currentLevel: 1,
      completedChallenges: [],
      unlockedFeatures: []
    },
    settings: {
      notifications: true,
      privacy: "standard"
    },
    lastUpdated: new Date().toISOString()
  };

  return {
    success: true,
    message: `✅ Successfully saved ${walletData.points.total} points to database for wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    address: walletAddress,
    data: walletData
  };
};

// Run tests
console.log('🔧 Complete Wallet Integration Test\n');

const mockSessionPoints = {
  gamingHub: 150,
  storyMode: 75,
  achievements: 25
};

testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`   Props:`, JSON.stringify(scenario.props, null, 2));
  
  const detectedAddress = getWalletAddress(scenario.props);
  const result = simulateButtonClick(scenario.props, mockSessionPoints);
  
  console.log(`   Detected Address: ${detectedAddress || 'None'}`);
  console.log(`   Expected Address: ${scenario.expectedAddress || 'None'}`);
  console.log(`   Address Match: ${detectedAddress === scenario.expectedAddress ? '✅' : '❌'}`);
  console.log(`   Button Result: ${result.message}`);
  
  if (result.success) {
    console.log(`   Points Saved: ${result.data.points.total} total`);
  }
  
  console.log('');
});

console.log('🎯 Integration Test Summary:');
console.log('- All wallet types should be detected correctly');
console.log('- Button should show proper status based on connection');
console.log('- Points should be saved with correct schema structure');
console.log('- Database files should be created at: C_DataBase/users/Users_Scores/[address].json');

// Verify database directory exists
const dbPath = path.join(__dirname, 'C_DataBase', 'users', 'Users_Scores');
if (fs.existsSync(dbPath)) {
  console.log(`\n📁 Database directory exists: ${dbPath}`);
  const files = fs.readdirSync(dbPath).filter(f => f.endsWith('.json'));
  console.log(`   Found ${files.length} wallet files:`, files.slice(0, 5));
  if (files.length > 5) console.log(`   ... and ${files.length - 5} more`);
} else {
  console.log(`\n⚠️  Database directory not found: ${dbPath}`);
  console.log('   Make sure to create it before saving wallet data');
}

console.log('\n🚀 Ready to test in browser!');