const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const PointMigrationService = require('./services/PointMigrationService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration (update with your values)
const CONFIG = {
  contractAddress: process.env.CONTRACT_ADDRESS || "0x4b35C661652700953A8E23704AE6211D447C412A",
  privateKey: process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001", // Dummy key for initialization
  rpcUrl: process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
  contractABI: [
    "function migratePoints(address user, uint256 points, string memory migrationId) external returns (bool)",
    "function migrateMyPoints(uint256 points, string memory migrationId) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function getTokensForPoints(uint256 points) external view returns (uint256)",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function totalSupply() external view returns (uint256)",
    "function pointToTokenRatio() external view returns (uint256)",
    "function authorizedMinters(address) external view returns (bool)",
    "function usedMigrationIds(string memory migrationId) external view returns (bool)",
    "function totalPointsMigrated(address user) external view returns (uint256)",
    "event PointsMigrated(address indexed user, uint256 points, uint256 tokens, string migrationId)"
  ]
};

// Initialize migration service
let migrationService;
try {
  migrationService = new PointMigrationService(CONFIG);
  console.log('✅ Point Migration Service initialized');
  console.log('🔧 Contract Address:', CONFIG.contractAddress);
  console.log('🌐 Network: BSC Testnet');
  console.log('💡 Ready to process C-Cube wallet migrations');
} catch (error) {
  console.error('❌ Failed to initialize migration service:', error);
  console.error('💡 This is normal - migrations will use user wallet private keys');
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    contractAddress: CONFIG.contractAddress,
    network: 'BSC Testnet',
    features: ['C-Cube Wallet Integration', 'Self-Minting', 'Real-time Balance']
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: '🚀 LCUBE Migration API Server is running!',
    contractAddress: CONFIG.contractAddress,
    network: 'BSC Testnet (97)',
    endpoints: {
      health: '/health',
      migrate: '/migrate-points',
      balance: '/user/:address/balance',
      minterBalance: '/minter/balance'
    }
  });
});

// Check minter wallet balance
app.get('/minter/balance', async (req, res) => {
  try {
    const balanceInfo = await migrationService.checkMinterBalance();
    res.json({
      success: true,
      data: {
        address: migrationService.signer.address,
        balance: balanceInfo.balance,
        sufficient: balanceInfo.sufficient,
        network: 'BSC Testnet'
      }
    });
  } catch (error) {
    console.error('❌ Failed to check minter balance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get contract information
app.get('/contract-info', async (req, res) => {
  try {
    const info = await migrationService.getContractInfo();
    res.json({ success: true, data: info });
  } catch (error) {
    console.error('Failed to get contract info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user migration info
app.get('/user/:address/migration-info', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ success: false, error: 'Invalid address' });
    }

    const info = await migrationService.getUserMigrationInfo(address);
    res.json({ success: true, data: info });
  } catch (error) {
    console.error('Failed to get user migration info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user token balance
app.get('/user/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ success: false, error: 'Invalid address' });
    }

    // Get balance from contract
    const balanceWei = await migrationService.contract.balanceOf(address);
    const balance = ethers.formatEther(balanceWei);

    res.json({ 
      success: true, 
      data: { 
        balance: balance,
        balanceWei: balanceWei.toString(),
        address: address
      } 
    });
  } catch (error) {
    console.error('Failed to get user balance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Migrate points
app.post('/migrate-points', async (req, res) => {
  try {
    const { userAddress, points, sessionData, signature, walletType, walletData } = req.body;

    // Validate request
    if (!userAddress || !points || !sessionData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userAddress, points, sessionData' 
      });
    }

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid user address' });
    }

    console.log(`🔄 Processing migration for ${walletType || 'unknown'} wallet:`, userAddress);
    console.log(`📊 Points to migrate: ${points}`);

    // Special handling for C-Cube wallet
    if (walletType === 'ccube') {
      console.log('✅ C-Cube wallet detected - processing migration');
      
      // Validate C-Cube wallet session
      if (!sessionData.sessionId || !sessionData.timestamp) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid C-Cube wallet session data' 
        });
      }

      // Check session age (5 minutes max)
      const sessionAge = Date.now() - sessionData.timestamp;
      if (sessionAge > 300000) {
        return res.status(400).json({ 
          success: false, 
          error: 'Session expired - please try again' 
        });
      }
    }

    // Optional: Verify signature if provided
    if (signature) {
      try {
        const message = JSON.stringify({
          userAddress,
          points,
          timestamp: sessionData.timestamp,
          sessionId: sessionData.sessionId
        });
        
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
          console.warn('⚠️ Signature verification failed - continuing anyway for C-Cube wallet');
        } else {
          console.log('✅ Signature verified for:', userAddress);
        }
      } catch (sigError) {
        console.warn('⚠️ Signature verification failed:', sigError.message);
        // Continue without signature verification for C-Cube wallets
      }
    }

    // Perform migration - use user's private key if provided (C-Cube wallet)
    let result;
    if (walletData && walletData.privateKey && walletType === 'ccube') {
      console.log('🔑 Using C-Cube wallet private key for minting...');
      result = await migrationService.migratePointsWithKey(
        userAddress, 
        points, 
        sessionData, 
        walletData.privateKey
      );
    } else {
      console.log('🔑 Using admin/minter key for minting...');
      result = await migrationService.migratePoints(userAddress, points, sessionData);
    }
    
    // Enhanced response for C-Cube wallets
    const response = {
      ...result,
      walletType: walletType || 'unknown',
      pointsConverted: points,
      conversionRate: '1000:1', // 1000 points = 1 token
      networkInfo: {
        network: 'BSC Testnet',
        chainId: 97
      }
    };
    
    console.log('✅ Migration successful for C-Cube wallet:', {
      user: userAddress,
      points: points,
      tokens: result.tokensReceived,
      txHash: result.txHash
    });
    
    res.json({ success: true, data: response });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check migration status
app.get('/migration-status/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const status = await migrationService.getMigrationStatus(txHash);
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Failed to get migration status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Point Migration API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Contract info: http://localhost:${PORT}/contract-info`);
});

module.exports = app;