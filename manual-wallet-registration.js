/**
 * Manual Wallet Registration Tool
 * Creates a wallet file in the database manually
 */

const fs = require('fs');
const path = require('path');

class ManualWalletRegistration {
  constructor() {
    this.usersScoresDir = '/Users/oladimejishodipe/Desktop/Cold_Wallet_Git_Version/C_DataBase/users/Users_Scores';
  }

  /**
   * Validate wallet address format
   */
  isValidWalletAddress(address) {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  }

  /**
   * Create default user schema
   */
  getDefaultUserSchema(walletAddress) {
    return {
      walletAddress: walletAddress,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      points: {
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
      },
      progress: {
        completedNodes: [],
        currentQuest: null,
        level: 1,
        xp: 0
      },
      settings: {
        autoSync: true,
        notifications: true
      }
    };
  }

  /**
   * Create wallet file in database
   */
  createWalletFile(walletAddress, initialPoints = null) {
    try {
      console.log(`🔧 Creating wallet file for: ${walletAddress}`);

      // Validate address
      if (!this.isValidWalletAddress(walletAddress)) {
        throw new Error('Invalid wallet address format. Must be 42 characters starting with 0x');
      }

      // Check if file already exists
      const filePath = path.join(this.usersScoresDir, `${walletAddress}.json`);
      if (fs.existsSync(filePath)) {
        console.log(`⚠️ Wallet file already exists: ${walletAddress}`);
        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📊 Current total points: ${existingData.points?.total || 0}`);
        return existingData;
      }

      // Create user data
      const userData = this.getDefaultUserSchema(walletAddress);
      
      // Add initial points if provided
      if (initialPoints) {
        console.log(`🎯 Adding initial points:`, initialPoints);
        
        if (initialPoints.gamingHub) {
          Object.assign(userData.points.gamingHub, initialPoints.gamingHub);
        }
        
        if (initialPoints.storyMode) {
          Object.assign(userData.points.storyMode, initialPoints.storyMode);
        }
        
        if (initialPoints.achievements) {
          Object.assign(userData.points.achievements, initialPoints.achievements);
        }
        
        // Recalculate total
        const gamingTotal = Object.values(userData.points.gamingHub).reduce((sum, val) => sum + val, 0);
        const storyTotal = Object.values(userData.points.storyMode).reduce((sum, val) => sum + val, 0);
        userData.points.total = gamingTotal + storyTotal;
      }

      // Create the file
      fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
      
      console.log(`✅ Wallet file created successfully!`);
      console.log(`📁 Location: ${filePath}`);
      console.log(`📊 Total points: ${userData.points.total}`);
      console.log(`🎮 Gaming Hub: ${JSON.stringify(userData.points.gamingHub)}`);
      console.log(`📚 Story Mode: ${JSON.stringify(userData.points.storyMode)}`);
      
      return userData;

    } catch (error) {
      console.error(`❌ Error creating wallet file:`, error.message);
      throw error;
    }
  }

  /**
   * Update existing wallet points
   */
  updateWalletPoints(walletAddress, pointsUpdate) {
    try {
      const filePath = path.join(this.usersScoresDir, `${walletAddress}.json`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Wallet file not found: ${walletAddress}`);
      }

      // Load existing data
      const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Update points
      if (pointsUpdate.gamingHub) {
        Object.keys(pointsUpdate.gamingHub).forEach(key => {
          userData.points.gamingHub[key] = (userData.points.gamingHub[key] || 0) + pointsUpdate.gamingHub[key];
        });
      }
      
      if (pointsUpdate.storyMode) {
        Object.keys(pointsUpdate.storyMode).forEach(key => {
          userData.points.storyMode[key] = (userData.points.storyMode[key] || 0) + pointsUpdate.storyMode[key];
        });
      }

      // Update total
      const gamingTotal = Object.values(userData.points.gamingHub).reduce((sum, val) => sum + val, 0);
      const storyTotal = Object.values(userData.points.storyMode).reduce((sum, val) => sum + val, 0);
      userData.points.total = gamingTotal + storyTotal;
      
      // Update timestamp
      userData.lastActive = new Date().toISOString();

      // Save file
      fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
      
      console.log(`✅ Wallet points updated successfully!`);
      console.log(`📊 New total points: ${userData.points.total}`);
      
      return userData;

    } catch (error) {
      console.error(`❌ Error updating wallet points:`, error.message);
      throw error;
    }
  }

  /**
   * List all wallets in database
   */
  listAllWallets() {
    try {
      const files = fs.readdirSync(this.usersScoresDir).filter(file => file.endsWith('.json'));
      
      console.log(`📁 Wallets in database: ${files.length}`);
      
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
}

// Interactive setup
async function setupYourWallet() {
  const registration = new ManualWalletRegistration();
  
  console.log(`🚀 MANUAL WALLET REGISTRATION TOOL\n`);
  
  console.log(`📋 CURRENT WALLETS IN DATABASE:`);
  registration.listAllWallets();
  
  console.log(`\n🔧 TO ADD YOUR WALLET:`);
  console.log(`\n1. Replace 'YOUR_WALLET_ADDRESS_HERE' below with your actual wallet address:`);
  
  // Example wallet addresses to replace
  const exampleWallets = [
    {
      address: 'YOUR_WALLET_ADDRESS_HERE',
      initialPoints: {
        gamingHub: {
          blockchainBasics: 5.5, // Points you think you earned in Gaming Hub
          smartContracts: 2.0,
          defiProtocols: 1.0,
          nftsWeb3: 0
        },
        storyMode: {
          totalScore: 25, // Points from Story Mode
          chaptersCompleted: 1
        },
        achievements: {
          firstQuest: true,
          cryptoNovice: true
        }
      }
    }
  ];
  
  console.log(`\n2. Edit this file and update the wallet address and points:`);
  console.log(`   File: manual-wallet-registration.js`);
  console.log(`   Look for: 'YOUR_WALLET_ADDRESS_HERE'`);
  console.log(`   Replace with your actual MetaMask address\n`);
  
  console.log(`3. Update the initialPoints with your estimated scores\n`);
  
  console.log(`4. Run: node manual-wallet-registration.js\n`);
  
  // Process example wallets
  for (const wallet of exampleWallets) {
    if (wallet.address === 'YOUR_WALLET_ADDRESS_HERE') {
      console.log(`⚠️ Please update the wallet address before running!`);
      console.log(`   Current: ${wallet.address}`);
      console.log(`   Replace with your MetaMask address (0x...)\n`);
      continue;
    }
    
    try {
      console.log(`\n🔄 Processing wallet: ${wallet.address}`);
      const userData = registration.createWalletFile(wallet.address, wallet.initialPoints);
      
      console.log(`✅ Success! Your wallet is now in the database.`);
      console.log(`📊 Total points assigned: ${userData.points.total}`);
      
    } catch (error) {
      console.error(`❌ Failed to create wallet:`, error.message);
    }
  }
  
  console.log(`\n🎯 NEXT STEPS AFTER CREATING YOUR WALLET:`);
  console.log(`1. Go to /ai-tutor and connect your wallet`);
  console.log(`2. Complete one activity to test auto-sync`);
  console.log(`3. Run: node test-your-wallet-scoring.js to verify`);
  console.log(`4. Your wallet should now appear in the database!\n`);
  
  console.log(`🔍 VERIFY YOUR WALLET WAS CREATED:`);
  console.log(`Check folder: C_DataBase/users/Users_Scores/`);
  console.log(`Look for: [YOUR_WALLET_ADDRESS].json\n`);
}

// Run the setup
setupYourWallet().catch(console.error);