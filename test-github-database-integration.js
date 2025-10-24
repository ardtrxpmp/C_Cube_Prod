#!/usr/bin/env node

/**
 * Complete GitHub Database Integration Test
 * Tests saving wallet data to https://github.com/cyfocube/C_DataBase.git
 */

const fetch = require('node-fetch');

// Test configuration
const TEST_WALLET = '0x1234567890abcdef1234567890abcdef12345678';
const API_URL = 'http://localhost:3001/api/save-user-scores'; // Adjust port as needed

// Mock user data following Users_Scores schema
const mockUserData = {
  walletAddress: TEST_WALLET,
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  points: {
    gamingHub: {
      blockchainBasics: 8.5,
      smartContracts: 4.0,
      defiProtocols: 2.5,
      nftsWeb3: 1.0
    },
    storyMode: {
      chaptersCompleted: 3,
      totalScore: 45
    },
    achievements: {
      firstQuest: true,
      cryptoNovice: true,
      blockchainExplorer: true,
      defiMaster: false,
      speedLearner: false,
      perfectionist: false
    },
    total: 61
  },
  progress: {
    completedNodes: ['node1', 'node2', 'node3'],
    currentQuest: 'defi-basics',
    level: 6,
    xp: 610
  },
  settings: {
    autoSync: true,
    notifications: true
  }
};

async function testGitHubDatabaseSave() {
  console.log('🧪 Testing GitHub Database Integration\n');
  
  console.log('📊 Test Data:');
  console.log(`   Wallet: ${TEST_WALLET}`);
  console.log(`   Total Points: ${mockUserData.points.total}`);
  console.log(`   Gaming Hub: ${Object.values(mockUserData.points.gamingHub).reduce((a,b) => a+b, 0)}`);
  console.log(`   Story Mode: ${mockUserData.points.storyMode.totalScore}`);
  console.log('');

  try {
    console.log('🔄 Sending request to API...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: TEST_WALLET,
        userData: mockUserData
      })
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ API Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      const data = result.data;
      console.log('\n🎉 SUCCESS! Wallet data saved to database!');
      console.log(`   Method: ${data.saveMethod}`);
      console.log(`   Repository: ${data.repository || 'Local filesystem'}`);
      console.log(`   File: ${data.fileName}`);
      console.log(`   Total Points: ${data.totalPoints}`);
      
      if (data.githubUrl) {
        console.log(`   GitHub URL: ${data.githubUrl}`);
      }
      
      console.log(`   Action: ${data.action}`);
    } else {
      console.log('❌ API returned success=false:', result);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure the server is running on the correct port');
    console.log('2. Check if GITHUB_TOKEN environment variable is set');
    console.log('3. Verify the API endpoint path is correct');
    console.log('4. Check server logs for detailed error information');
  }
}

// Environment check
function checkEnvironment() {
  console.log('🔧 Environment Check:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   GitHub Token: ${process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Not set'}`);
  console.log(`   API URL: ${API_URL}`);
  console.log('');
}

// Main execution
async function main() {
  console.log('🚀 GitHub Database Integration Test\n');
  console.log('Target Repository: https://github.com/cyfocube/C_DataBase.git');
  console.log('Target Path: users/Users_Scores/[wallet].json\n');
  
  checkEnvironment();
  await testGitHubDatabaseSave();
  
  console.log('\n📝 Next Steps:');
  console.log('1. If successful, check the GitHub repository for your wallet file');
  console.log('2. Test the "Save Points to Database" button in the React app');
  console.log('3. Verify wallet detection works with connected wallets');
  console.log('4. Check that points are properly merged on subsequent saves');
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});

// Run the test
main().catch(console.error);