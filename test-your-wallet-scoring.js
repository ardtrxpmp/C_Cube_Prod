/**
 * Test Your Wallet Scoring System
 * This will help diagnose why your wallet scores aren't appearing in the database
 */

// Simulate the wallet scoring system
class WalletScoringTest {
  constructor() {
    this.USER_SCORES_BASE_URL = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/users/Users_Scores';
  }

  /**
   * Check if a wallet exists in the database
   */
  async checkWalletInDatabase(walletAddress) {
    try {
      console.log(`🔍 Checking database for wallet: ${walletAddress}`);
      
      // First, try to check local file (for newly created wallets)
      const fs = require('fs');
      const path = require('path');
      const localFilePath = path.join(__dirname, '..', 'C_DataBase', 'users', 'Users_Scores', `${walletAddress}.json`);
      
      if (fs.existsSync(localFilePath)) {
        try {
          const userData = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
          console.log(`✅ Found wallet in LOCAL database!`);
          console.log(`📊 Total points: ${userData.points?.total || 0}`);
          console.log(`🎮 Gaming Hub points: ${JSON.stringify(userData.points?.gamingHub || {})}`);
          console.log(`📚 Story Mode points: ${JSON.stringify(userData.points?.storyMode || {})}`);
          console.log(`🏆 Achievements: ${JSON.stringify(userData.points?.achievements || {})}`);
          return {
            exists: true,
            data: userData,
            source: 'local'
          };
        } catch (localError) {
          console.warn(`⚠️ Error reading local file: ${localError.message}`);
        }
      }
      
      // Then, try GitHub raw URL (for committed wallets)
      const userScoresUrl = `${this.USER_SCORES_BASE_URL}/${walletAddress}.json`;
      const response = await fetch(userScoresUrl);
      
      if (response.ok) {
        const userData = await response.json();
        console.log(`✅ Found wallet in REMOTE database!`);
        console.log(`📊 Total points: ${userData.points?.total || 0}`);
        console.log(`🎮 Gaming Hub points: ${JSON.stringify(userData.points?.gamingHub || {})}`);
        console.log(`📚 Story Mode points: ${JSON.stringify(userData.points?.storyMode || {})}`);
        console.log(`🏆 Achievements: ${JSON.stringify(userData.points?.achievements || {})}`);
        return {
          exists: true,
          data: userData,
          source: 'github'
        };
      } else {
        console.log(`❌ Wallet NOT found in remote database (Status: ${response.status})`);
        console.log(`❌ Wallet NOT found in local database either`);
        return {
          exists: false,
          status: response.status
        };
      }
    } catch (error) {
      console.error(`💥 Error checking wallet in database:`, error.message);
      return {
        exists: false,
        error: error.message
      };
    }
  }

  /**
   * Check session storage for points
   */
  checkSessionStorage() {
    try {
      // In a real browser environment, this would work
      console.log(`🔍 Checking session storage...`);
      
      // Simulate what would be in session storage
      console.log(`ℹ️  Note: Session storage can only be checked in a browser environment`);
      console.log(`ℹ️  In browser, check: sessionStorage.getItem('ccube_user_points')`);
      
      return null;
    } catch (error) {
      console.log(`⚠️ Session storage not available in Node.js environment`);
      return null;
    }
  }

  /**
   * Simulate wallet connection and scoring
   */
  async simulateWalletScoring(walletAddress) {
    console.log(`\n🎯 Simulating scoring for wallet: ${walletAddress}`);
    
    // Create mock user data that should be saved
    const mockUserData = {
      walletAddress: walletAddress,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      points: {
        gamingHub: {
          blockchainBasics: 5.5,
          smartContracts: 2.0,
          defiProtocols: 1.0,
          nftsWeb3: 0
        },
        storyMode: {
          chaptersCompleted: 1,
          totalScore: 25
        },
        achievements: {
          firstQuest: true,
          cryptoNovice: true,
          blockchainExplorer: false,
          defiMaster: false,
          speedLearner: false,
          perfectionist: false
        },
        total: 33.5
      },
      progress: {
        completedNodes: [
          "quest-started-blockchain-basics",
          "blockchain-basics-challenge-0",
          "blockchain-basics-challenge-1",
          "story-ch1-q1",
          "story-ch1-q2"
        ],
        currentQuest: "blockchain-basics",
        level: 2,
        xp: 135
      },
      settings: {
        autoSync: true,
        notifications: true
      }
    };
    
    console.log(`💾 This is what SHOULD be saved for your wallet:`);
    console.log(`📊 Total Points: ${mockUserData.points.total}`);
    console.log(`🎮 Gaming Hub: ${JSON.stringify(mockUserData.points.gamingHub)}`);
    console.log(`📚 Story Mode: ${JSON.stringify(mockUserData.points.storyMode)}`);
    console.log(`🏆 Progress: ${mockUserData.progress.completedNodes.length} completed nodes`);
    
    return mockUserData;
  }

  /**
   * Diagnose the scoring issue
   */
  async diagnoseIssue(yourWalletAddress) {
    console.log(`🔬 DIAGNOSING WALLET SCORING ISSUE\n`);
    console.log(`🎯 Your Wallet: ${yourWalletAddress}`);
    console.log(`📁 Expected Database Location: C_DataBase/users/Users_Scores/${yourWalletAddress}.json\n`);

    // Check 1: Is wallet in database?
    console.log(`📋 CHECK 1: Database Presence`);
    const dbCheck = await this.checkWalletInDatabase(yourWalletAddress);
    
    // Check 2: Session storage simulation
    console.log(`\n📋 CHECK 2: Session Storage`);
    this.checkSessionStorage();
    
    // Check 3: Simulate what should happen
    console.log(`\n📋 CHECK 3: Expected Behavior Simulation`);
    const expectedData = await this.simulateWalletScoring(yourWalletAddress);
    
    // Check 4: Compare with sample wallet
    console.log(`\n📋 CHECK 4: Sample Wallet Comparison`);
    const sampleCheck = await this.checkWalletInDatabase('0x742d35CC6634C0532925a3b8D4301d13DC8C2E15');
    
    // Analysis and recommendations
    console.log(`\n🔍 ANALYSIS & RECOMMENDATIONS:`);
    
    if (!dbCheck.exists) {
      console.log(`❌ ISSUE: Your wallet is NOT in the database`);
      console.log(`💡 POSSIBLE CAUSES:`);
      console.log(`   1. Wallet never properly connected during scoring`);
      console.log(`   2. Points were only saved to session storage (browser only)`);
      console.log(`   3. Network error prevented database sync`);
      console.log(`   4. Auto-registration service not working`);
      
      console.log(`\n🛠️  SOLUTIONS:`);
      console.log(`   1. Reconnect your wallet in the AI Tutor`);
      console.log(`   2. Complete at least one question to trigger database creation`);
      console.log(`   3. Check browser console for error messages`);
      console.log(`   4. Try the "Migrate Points" feature if available`);
    } else {
      console.log(`✅ SUCCESS: Your wallet is in the database!`);
      console.log(`📊 Current total points: ${dbCheck.data.points?.total || 0}`);
    }
    
    console.log(`\n📞 NEXT STEPS:`);
    console.log(`   1. Go to /ai-tutor page`);
    console.log(`   2. Connect your wallet: ${yourWalletAddress}`);
    console.log(`   3. Complete one Gaming Hub challenge or Story Mode question`);
    console.log(`   4. Check browser console for "Points synced to database" messages`);
    console.log(`   5. Run this test again to verify database creation`);
  }
}

// Example usage - replace with your actual wallet address
async function testYourWallet() {
  const tester = new WalletScoringTest();
  
  console.log(`🚀 WALLET SCORING DIAGNOSTIC TOOL\n`);
  
  // Test with some example wallet addresses you might be using
  const testWallets = [
    // Add your actual wallet address here
    '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12', // Test wallet we just created
    '0x1234567890123456789012345678901234567890', // Replace with your wallet
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', // Replace with your wallet
    // You can add multiple wallet addresses to test
  ];
  
  console.log(`ℹ️  INSTRUCTIONS:`);
  console.log(`   1. Replace the testWallets array above with YOUR actual wallet address`);
  console.log(`   2. Your wallet address should be 42 characters starting with "0x"`);
  console.log(`   3. You can find it in MetaMask or your connected wallet\n`);
  
  for (const wallet of testWallets) {
    await tester.diagnoseIssue(wallet);
    console.log(`\n${'='.repeat(80)}\n`);
  }
  
  // Show what exists in database currently
  console.log(`📁 CURRENT DATABASE CONTENTS:`);
  console.log(`   - 0x742d35CC6634C0532925a3b8D4301d13DC8C2E15.json (Sample wallet)`);
  console.log(`   - [Your wallet address].json (Should appear here after scoring)`);
  
  console.log(`\n🎯 TO FIX THE ISSUE:`);
  console.log(`   1. Get your exact wallet address from MetaMask/wallet`);
  console.log(`   2. Update this test file with your address`);
  console.log(`   3. Connect wallet in /ai-tutor and complete activities`);
  console.log(`   4. Run: node test-your-wallet-scoring.js`);
}

// Run the test
testYourWallet().catch(console.error);