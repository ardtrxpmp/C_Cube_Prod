const { ethers } = require("ethers");
const crypto = require("crypto");

/**
 * Point Migration Service
 * Handles secure point-to-token migration on the blockchain
 */
class PointMigrationService {
  constructor(config) {
    this.contractAddress = config.contractAddress;
    this.privateKey = config.privateKey;
    this.rpcUrl = config.rpcUrl;
    this.contractABI = config.contractABI;
    
    // Initialize provider and signer
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    this.signer = new ethers.Wallet(this.privateKey, this.provider);
    
    // Initialize contract
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.contractABI,
      this.signer
    );
    
    // Migration tracking (in production, use a database)
    this.migrationHistory = new Map();
  }

  /**
   * Generate a unique migration ID
   */
  generateMigrationId(userAddress, points, timestamp) {
    const data = `${userAddress}-${points}-${timestamp}-${crypto.randomBytes(16).toString('hex')}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate migration request
   */
  validateMigrationRequest(userAddress, points, sessionData) {
    // Validate user address
    if (!ethers.isAddress(userAddress)) {
      throw new Error("Invalid user address");
    }

    // Validate points
    if (!points || points <= 0 || !Number.isInteger(points)) {
      throw new Error("Invalid points amount");
    }

    // Validate session data (implement your own validation logic)
    if (!sessionData || !this.validateSessionData(sessionData)) {
      throw new Error("Invalid session data");
    }

    // Prevent double spending (check if points were already migrated)
    const sessionId = sessionData.sessionId;
    if (this.migrationHistory.has(sessionId)) {
      throw new Error("Points already migrated for this session");
    }

    return true;
  }

  /**
   * Validate session data (implement your own logic)
   */
  validateSessionData(sessionData) {
    // Basic validation - in production, implement proper signature verification
    return sessionData && 
           sessionData.sessionId && 
           sessionData.timestamp && 
           sessionData.points &&
           (Date.now() - sessionData.timestamp) < 300000; // 5 minutes max age
  }

  /**
   * Check if minter wallet has sufficient balance for gas
   */
  async checkMinterBalance() {
    try {
      const balance = await this.provider.getBalance(this.signer.address);
      const balanceInBNB = ethers.formatEther(balance);
      console.log(`💰 Minter wallet balance: ${balanceInBNB} BNB`);
      
      // Check if balance is sufficient (minimum 0.01 BNB for gas)
      const minBalanceRequired = ethers.parseEther("0.01");
      if (balance < minBalanceRequired) {
        throw new Error(`Insufficient gas balance. Minter wallet needs at least 0.01 BNB, current: ${balanceInBNB} BNB. Please fund the minter wallet: ${this.signer.address}`);
      }
      
      return { balance: balanceInBNB, sufficient: true };
    } catch (error) {
      console.error('❌ Failed to check minter balance:', error);
      throw error;
    }
  }

  /**
   * Migrate points to tokens using a specific private key
   */
  async migratePointsWithKey(userAddress, points, sessionData, privateKey) {
    try {
      console.log(`🔄 Starting migration with user's private key for ${userAddress}: ${points} points`);

      // Validate the migration request
      this.validateMigrationRequest(userAddress, points, sessionData);

      // Create a new signer with the user's private key
      const userWallet = new ethers.Wallet(privateKey, this.provider);
      const userContract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        userWallet
      );

      // Check if user wallet has sufficient balance for gas
      const userBalance = await this.provider.getBalance(userWallet.address);
      const userBalanceInBNB = ethers.formatEther(userBalance);
      console.log(`💰 User wallet balance: ${userBalanceInBNB} BNB`);
      
      // Check if balance is sufficient (minimum 0.005 BNB for gas)
      const minBalanceRequired = ethers.parseEther("0.005");
      if (userBalance < minBalanceRequired) {
        throw new Error(`Insufficient gas balance. User wallet needs at least 0.005 BNB, current: ${userBalanceInBNB} BNB.`);
      }

      // Check if user is authorized to mint (or if the contract allows self-minting)
      try {
        const isMinter = await userContract.authorizedMinters(userWallet.address);
        if (!isMinter) {
          // Try to use owner/admin permissions to mint to user
          return await this.migratePoints(userAddress, points, sessionData);
        }
      } catch (error) {
        console.log('🔍 Cannot check minter status, proceeding with user wallet...');
      }

      // Generate unique migration ID
      const migrationId = this.generateMigrationId(userAddress, points, Date.now());

      // Check if migration ID is already used (extra safety)
      const isUsed = await userContract.usedMigrationIds(migrationId);
      if (isUsed) {
        throw new Error("Migration ID collision - please retry");
      }

      // Get estimated gas and current gas price using self-minting function
      const estimatedGas = await userContract.migrateMyPoints.estimateGas(
        points,
        migrationId
      );

      const gasPrice = await this.provider.getFeeData();
      const estimatedCost = estimatedGas * gasPrice.gasPrice;
      
      console.log(`⛽ Estimated gas: ${estimatedGas.toString()}`);
      console.log(`💰 Estimated cost: ${ethers.formatEther(estimatedCost)} BNB`);

      // Execute migration transaction with user's wallet using self-minting
      const tx = await userContract.migrateMyPoints(
        points,
        migrationId,
        {
          gasLimit: estimatedGas * 120n / 100n, // Add 20% buffer
          gasPrice: gasPrice.gasPrice
        }
      );

      console.log(`📡 Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      // Calculate tokens received
      const tokensReceived = (points / 1000).toFixed(6); // 1000 points = 1 token

      // Mark as completed in history
      const sessionId = sessionData.sessionId;
      this.migrationHistory.set(sessionId, {
        userAddress,
        points,
        tokensReceived,
        txHash: tx.hash,
        timestamp: Date.now(),
        migrationId
      });

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        userAddress,
        points,
        tokensReceived,
        contractAddress: this.contractAddress,
        migrationId,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('❌ Migration with user key failed:', error);
      throw error;
    }
  }

  /**
   * Migrate points to tokens (original method using admin key)
   */
  async migratePoints(userAddress, points, sessionData) {
    try {
      console.log(`🔄 Starting migration for ${userAddress}: ${points} points`);

      // Validate the migration request
      this.validateMigrationRequest(userAddress, points, sessionData);

      // Check minter wallet balance first
      await this.checkMinterBalance();

      // Generate unique migration ID
      const migrationId = this.generateMigrationId(userAddress, points, Date.now());

      // Check if migration ID is already used (extra safety)
      const isUsed = await this.contract.isMigrationIdUsed(migrationId);
      if (isUsed) {
        throw new Error("Migration ID collision - please retry");
      }

      // Get estimated gas and current gas price
      const estimatedGas = await this.contract.migratePoints.estimateGas(
        userAddress,
        points,
        migrationId
      );

      const gasPrice = await this.provider.getFeeData();
      const estimatedCost = estimatedGas * gasPrice.gasPrice;
      
      console.log(`⛽ Estimated gas: ${estimatedGas.toString()}`);
      console.log(`💰 Estimated cost: ${ethers.formatEther(estimatedCost)} BNB`);

      // Execute migration transaction
      const tx = await this.contract.migratePoints(
        userAddress,
        points,
        migrationId,
        {
          gasLimit: estimatedGas * 120n / 100n, // Add 20% buffer
          gasPrice: gasPrice.gasPrice
        }
      );

      console.log(`📡 Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      // Record migration to prevent double spending
      this.migrationHistory.set(sessionData.sessionId, {
        userAddress,
        points,
        migrationId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now()
      });

      // Get the actual tokens minted
      const tokensForPoints = await this.contract.getTokensForPoints(points);

      return {
        success: true,
        migrationId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        userAddress,
        points,
        tokensReceived: ethers.formatEther(tokensForPoints),
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return { status: 'pending' };
      }

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Get user's total migrated points
   */
  async getUserMigrationInfo(userAddress) {
    try {
      const [totalMigrated, canMigrate] = await this.contract.getMigrationInfo(userAddress);
      return {
        totalPointsMigrated: totalMigrated.toString(),
        canMigrate
      };
    } catch (error) {
      throw new Error(`Failed to get user migration info: ${error.message}`);
    }
  }

  /**
   * Get contract info
   */
  async getContractInfo() {
    try {
      const [name, symbol, decimals, totalSupply, owner, ratio] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply(),
        this.contract.owner(),
        this.contract.pointToTokenRatio()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatEther(totalSupply),
        owner,
        pointToTokenRatio: ratio.toString(),
        contractAddress: this.contractAddress
      };
    } catch (error) {
      throw new Error(`Failed to get contract info: ${error.message}`);
    }
  }
}

module.exports = PointMigrationService;