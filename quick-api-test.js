#!/usr/bin/env node

/**
 * Simple API Test to Existing Server
 */

const fetch = require('node-fetch');

const testData = {
  walletAddress: '0x1234567890123456789012345678901234567890',
  userData: {
    walletAddress: '0x1234567890123456789012345678901234567890',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    points: {
      gamingHub: {
        blockchainBasics: 12,
        smartContracts: 6,
        defiProtocols: 4,
        nftsWeb3: 2
      },
      storyMode: {
        chaptersCompleted: 3,
        totalScore: 55
      },
      achievements: {
        firstQuest: true,
        cryptoNovice: true,
        blockchainExplorer: true,
        defiMaster: false,
        speedLearner: false,
        perfectionist: false
      },
      total: 79
    },
    progress: {
      completedNodes: ['intro', 'basics', 'intermediate'],
      currentQuest: 'advanced-concepts',  
      level: 8,
      xp: 790
    },
    settings: {
      autoSync: true,
      notifications: true
    }
  }
};

async function quickTest() {
  console.log('🧪 Quick API Test on Port 3334');
  
  try {
    const response = await fetch('http://localhost:3334/api/save-user-scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📡 Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS!', result);
      
      if (result.data && result.data.saveMethod === 'github') {
        console.log('🎉 GitHub save worked! Check:', result.data.githubUrl);
      }
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
}

quickTest();