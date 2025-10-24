#!/usr/bin/env node

/**
 * Test API Endpoint for Saving Points to GitHub
 */

const fetch = require('node-fetch');

// Test data - simulating what the React component sends
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

async function testAPIEndpoint() {
  console.log('🧪 Testing API Endpoint for GitHub Database Save\n');
  
  // Try different possible ports where the server might be running
  const possiblePorts = [3334, 3333, 3001, 3000, 8000];
  
  for (const port of possiblePorts) {
    const apiUrl = `http://localhost:${port}/api/save-user-scores`;
    console.log(`🔄 Testing port ${port}...`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      console.log(`📡 Response from port ${port}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ SUCCESS! API endpoint is working!');
        console.log('📊 Result:', JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('\n🎉 Points saved to GitHub database!');
          console.log(`   Method: ${result.data.saveMethod}`);
          console.log(`   Repository: ${result.data.repository}`);
          console.log(`   Total Points: ${result.data.totalPoints}`);
          if (result.data.githubUrl) {
            console.log(`   GitHub URL: ${result.data.githubUrl}`);
          }
        }
        return;
      } else {
        const errorText = await response.text();
        console.log(`❌ Error from port ${port}:`, errorText);
      }
      
    } catch (error) {
      console.log(`❌ Port ${port} not accessible:`, error.message);
    }
    
    console.log('');
  }
  
  console.log('❌ No working API endpoint found on any port');
  console.log('💡 The server may not be running or may be on a different port');
}

testAPIEndpoint();