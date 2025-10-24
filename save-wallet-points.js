/**
 * Manual Wallet Points Saver
 * Run this script to manually save wallet points to the database
 * Usage: node save-wallet-points.js [WALLET_ADDRESS] [POINTS_DATA]
 */

const fs = require('fs');
const path = require('path');

class WalletPointsSaver {
  constructor() {
    this.usersScoresDir = path.join(__dirname, '..', 'C_DataBase', 'users', 'Users_Scores');
  }

  /**
   * Validate wallet address format
   */
  isValidWalletAddress(address) {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  }

  /**
   * Get default user schema
   */
  getDefaultUserSchema(walletAddress, customPoints = null) {
    const now = new Date().toISOString();
    
    const defaultPoints = {
      gamingHub: {
        blockchainBasics: 0,
        smartContracts: 0,
        defiProtocols: 0,
        nftsWeb3: 0
      },
      storyMode: {
        chaptersCompleted: 0,
        totalScore: 0
      },
      achievements: {
        firstQuest: false,
        cryptoNovice: false,
        blockchainExplorer: false,
        defiMaster: false,
        speedLearner: false,
        perfectionist: false
      },
      total: 0
    };

    // Merge with custom points if provided
    if (customPoints) {
      if (customPoints.gamingHub) {
        Object.assign(defaultPoints.gamingHub, customPoints.gamingHub);
      }
      if (customPoints.storyMode) {
        Object.assign(defaultPoints.storyMode, customPoints.storyMode);
      }
      if (customPoints.achievements) {
        Object.assign(defaultPoints.achievements, customPoints.achievements);
      }
      
      // Recalculate total
      const gamingTotal = Object.values(defaultPoints.gamingHub).reduce((sum, val) => sum + val, 0);
      const storyTotal = defaultPoints.storyMode.totalScore || Object.values(defaultPoints.storyMode).reduce((sum, val) => sum + val, 0);
      defaultPoints.total = gamingTotal + storyTotal;
      
      // Auto-set achievements based on points
      defaultPoints.achievements.firstQuest = defaultPoints.total > 0;
      defaultPoints.achievements.cryptoNovice = defaultPoints.total >= 5;
      defaultPoints.achievements.blockchainExplorer = defaultPoints.total >= 20;
      defaultPoints.achievements.defiMaster = defaultPoints.total >= 50;
    }

    return {
      walletAddress: walletAddress,
      createdAt: now,
      lastActive: now,
      points: defaultPoints,
      progress: {
        completedNodes: [],
        currentQuest: null,
        level: Math.floor(defaultPoints.total / 10) + 1,
        xp: defaultPoints.total * 10
      },
      settings: {
        autoSync: true,
        notifications: true
      }
    };
  }

  /**
   * Save wallet points to database
   */
  saveWalletPoints(walletAddress, pointsData = null) {
    try {
      console.log(`💾 Saving wallet points for: ${walletAddress}`);

      // Validate address
      if (!this.isValidWalletAddress(walletAddress)) {
        throw new Error('Invalid wallet address format. Must be 42 characters starting with 0x');
      }

      // Ensure directory exists
      if (!fs.existsSync(this.usersScoresDir)) {
        fs.mkdirSync(this.usersScoresDir, { recursive: true });
        console.log(`📁 Created directory: ${this.usersScoresDir}`);
      }

      // Check if file already exists
      const filePath = path.join(this.usersScoresDir, `${walletAddress}.json`);
      const fileExists = fs.existsSync(filePath);

      let userData;

      if (fileExists) {
        console.log(`⚠️ Wallet file exists, merging data: ${walletAddress}`);
        
        // Load existing data
        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (pointsData) {
          // Merge points (take higher values)
          const mergedPoints = { ...existingData.points };
          
          if (pointsData.gamingHub) {
            Object.keys(pointsData.gamingHub).forEach(key => {
              mergedPoints.gamingHub[key] = Math.max(
                mergedPoints.gamingHub[key] || 0,
                pointsData.gamingHub[key] || 0
              );
            });
          }
          
          if (pointsData.storyMode) {
            Object.keys(pointsData.storyMode).forEach(key => {
              mergedPoints.storyMode[key] = Math.max(
                mergedPoints.storyMode[key] || 0,
                pointsData.storyMode[key] || 0
              );
            });
          }
          
          if (pointsData.achievements) {
            Object.keys(pointsData.achievements).forEach(key => {
              mergedPoints.achievements[key] = mergedPoints.achievements[key] || pointsData.achievements[key] || false;
            });
          }
          
          // Recalculate total
          const gamingTotal = Object.values(mergedPoints.gamingHub).reduce((sum, val) => sum + val, 0);
          const storyTotal = mergedPoints.storyMode.totalScore || Object.values(mergedPoints.storyMode).reduce((sum, val) => sum + val, 0);
          mergedPoints.total = gamingTotal + storyTotal;
          
          userData = {
            ...existingData,
            lastActive: new Date().toISOString(),
            points: mergedPoints,
            progress: {
              ...existingData.progress,
              level: Math.floor(mergedPoints.total / 10) + 1,
              xp: mergedPoints.total * 10
            }
          };
        } else {
          // Just update timestamp
          userData = {
            ...existingData,
            lastActive: new Date().toISOString()
          };
        }
      } else {
        console.log(`🆕 Creating new wallet file: ${walletAddress}`);
        userData = this.getDefaultUserSchema(walletAddress, pointsData);
      }

      // Write the file
      fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
      
      console.log(`✅ Wallet file saved successfully!`);
      console.log(`📁 Location: ${filePath}`);
      console.log(`📊 Total points: ${userData.points.total}`);
      console.log(`🎮 Gaming Hub: ${JSON.stringify(userData.points.gamingHub)}`);
      console.log(`📚 Story Mode: ${JSON.stringify(userData.points.storyMode)}`);
      console.log(`🏆 Achievements: ${JSON.stringify(userData.points.achievements)}`);
      
      return userData;

    } catch (error) {
      console.error(`❌ Error saving wallet points:`, error.message);
      throw error;
    }
  }

  /**
   * List all wallets in database
   */
  listWallets() {
    try {
      if (!fs.existsSync(this.usersScoresDir)) {
        console.log('📁 Users_Scores directory does not exist yet');
        return [];
      }

      const files = fs.readdirSync(this.usersScoresDir).filter(file => file.endsWith('.json'));
      
      console.log(`\n📁 Wallets in database: ${files.length}`);
      
      files.forEach(file => {
        const walletAddress = file.replace('.json', '');
        const filePath = path.join(this.usersScoresDir, file);
        const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`💎 ${walletAddress}: ${userData.points?.total || 0} points`);
      });
      
      return files.map(file => file.replace('.json', ''));

    } catch (error) {
      console.error(`❌ Error listing wallets:`, error.message);
      return [];
    }
  }

  /**
   * Save wallet with session storage data format
   */
  saveFromSessionData(walletAddress, sessionData) {
    console.log(`🔄 Converting session storage format for: ${walletAddress}`);
    
    // Convert session storage format to database format
    const convertedPoints = {
      gamingHub: {
        blockchainBasics: sessionData.gamingHub?.blockchainBasics || 0,
        smartContracts: sessionData.gamingHub?.smartContracts || 0,
        defiProtocols: sessionData.gamingHub?.defiProtocols || 0,
        nftsWeb3: sessionData.gamingHub?.nftsWeb3 || 0
      },
      storyMode: {
        chaptersCompleted: Object.values(sessionData.storyMode || {}).filter(score => score > 0).length,
        totalScore: Object.values(sessionData.storyMode || {}).reduce((sum, val) => sum + val, 0)
      },
      achievements: {
        firstQuest: sessionData.total > 0,
        cryptoNovice: sessionData.total >= 5,
        blockchainExplorer: sessionData.total >= 20,
        defiMaster: sessionData.total >= 50,
        speedLearner: false,
        perfectionist: false
      }
    };
    
    return this.saveWalletPoints(walletAddress, convertedPoints);
  }
}

// Interactive CLI usage
async function runInteractiveSave() {
  const saver = new WalletPointsSaver();
  
  console.log(`🚀 WALLET POINTS SAVER\n`);
  
  // Show current wallets
  console.log(`📋 CURRENT WALLETS:`);
  saver.listWallets();
  
  console.log(`\n🔧 USAGE EXAMPLES:\n`);
  
  // Example 1: Save wallet with custom points
  console.log(`1. Save wallet with points:`);
  console.log(`   node save-wallet-points.js save 0xYOUR_WALLET_ADDRESS`);
  
  // Example 2: List wallets
  console.log(`\n2. List all wallets:`);
  console.log(`   node save-wallet-points.js list`);
  
  // Example 3: Save with specific points
  console.log(`\n3. Save wallet with specific points (advanced):`);
  console.log(`   Edit this file and modify the examplePoints below\n`);
  
  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  const walletAddress = args[1];
  
  if (command === 'list') {
    console.log(`\n📊 LISTING ALL WALLETS:\n`);
    saver.listWallets();
    return;
  }
  
  if (command === 'save' && walletAddress) {
    console.log(`\n💾 SAVING WALLET: ${walletAddress}\n`);
    
    // Example points - modify these to match your earned points
    const examplePoints = {
      gamingHub: {
        blockchainBasics: 8.5,    // Your Gaming Hub blockchain basics points
        smartContracts: 3.0,      // Your Gaming Hub smart contracts points  
        defiProtocols: 2.0,       // Your Gaming Hub DeFi protocols points
        nftsWeb3: 1.5            // Your Gaming Hub NFTs & Web3 points
      },
      storyMode: {
        chaptersCompleted: 3,     // Number of Story Mode chapters completed
        totalScore: 45           // Total Story Mode points earned
      },
      achievements: {
        firstQuest: true,
        cryptoNovice: true,
        blockchainExplorer: true,
        defiMaster: false,
        speedLearner: false,
        perfectionist: false
      }
    };
    
    try {
      const result = saver.saveWalletPoints(walletAddress, examplePoints);
      console.log(`\n✅ SUCCESS! Wallet saved to database.`);
      console.log(`📁 File: C_DataBase/users/Users_Scores/${walletAddress}.json`);
      console.log(`📊 Total Points: ${result.points.total}`);
    } catch (error) {
      console.error(`\n❌ ERROR:`, error.message);
    }
    return;
  }
  
  // No valid command provided
  console.log(`⚠️ INVALID USAGE\n`);
  console.log(`✅ Valid commands:`);
  console.log(`   node save-wallet-points.js list`);
  console.log(`   node save-wallet-points.js save 0xYOUR_WALLET_ADDRESS`);
  console.log(`\nℹ️  Replace 0xYOUR_WALLET_ADDRESS with your actual MetaMask address`);
}

// Run if called directly
if (require.main === module) {
  runInteractiveSave().catch(console.error);
}

module.exports = WalletPointsSaver;