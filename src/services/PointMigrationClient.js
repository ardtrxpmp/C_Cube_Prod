import { ethers } from 'ethers';

/**
 * Frontend Point Migration Integration
 * Handles client-side point migration with wallet integration
 */
class PointMigrationClient {
  constructor(contractAddress, contractABI) {
    this.contractAddress = contractAddress;
    this.contractABI = contractABI;
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  /**
   * Initialize with wallet provider
   */
  async initialize(walletProvider) {
    try {
      this.provider = new ethers.BrowserProvider(walletProvider);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.provider
      );
      
      return true;
    } catch (error) {
      console.error('Failed to initialize migration client:', error);
      throw error;
    }
  }

  /**
   * Prepare migration session data
   */
  createMigrationSession(points, userAddress) {
    const sessionData = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      points: points,
      userAddress: userAddress,
      // Add any additional validation data needed
    };

    // Store in sessionStorage for validation
    sessionStorage.setItem('migration_session', JSON.stringify(sessionData));
    
    return sessionData;
  }

  /**
   * Direct blockchain migration (if user has minter rights)
   */
  async migratePointsDirectly(userAddress, points) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Generate migration ID
      const migrationId = `migration_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

      // Check if user is authorized minter
      const isAuthorized = await this.contract.authorizedMinters(await this.signer.getAddress());
      if (!isAuthorized) {
        throw new Error('User not authorized to mint tokens directly');
      }

      // Estimate gas
      const gasEstimate = await this.contract.migratePoints.estimateGas(
        userAddress,
        points,
        migrationId
      );

      // Execute transaction
      const tx = await this.contract.migratePoints(
        userAddress,
        points,
        migrationId,
        {
          gasLimit: gasEstimate * 120n / 100n // 20% buffer
        }
      );

      return {
        success: true,
        txHash: tx.hash,
        migrationId,
        waitForConfirmation: () => tx.wait()
      };

    } catch (error) {
      console.error('Direct migration failed:', error);
      throw error;
    }
  }

  /**
   * Server-side migration request
   */
  async requestMigration(points, userAddress, apiEndpoint) {
    try {
      // Create session data
      const sessionData = this.createMigrationSession(points, userAddress);

      // Sign the migration request for security
      const message = JSON.stringify({
        userAddress,
        points,
        timestamp: sessionData.timestamp,
        sessionId: sessionData.sessionId
      });

      let signature = null;
      try {
        signature = await this.signer.signMessage(message);
      } catch (error) {
        console.warn('Could not sign message:', error);
        // Continue without signature for testing
      }

      // Send request to backend API
      const response = await fetch(`${apiEndpoint}/migrate-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          points,
          sessionData,
          signature,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Migration request failed');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Migration request failed:', error);
      throw error;
    }
  }

  /**
   * Check migration transaction status
   */
  async checkTransactionStatus(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      if (receipt.status === 1) {
        // Parse events to get migration details
        const events = receipt.logs
          .map(log => {
            try {
              return this.contract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .filter(event => event !== null);

        const migrationEvent = events.find(event => event.name === 'PointsMigrated');
        
        return {
          status: 'confirmed',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          events: migrationEvent ? {
            user: migrationEvent.args.user,
            points: migrationEvent.args.points.toString(),
            tokens: ethers.formatEther(migrationEvent.args.tokens),
            migrationId: migrationEvent.args.migrationId
          } : null
        };
      } else {
        return { status: 'failed', blockNumber: receipt.blockNumber };
      }

    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Get user's token balance
   */
  async getUserBalance(userAddress) {
    try {
      const balance = await this.contract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get user balance:', error);
      return '0';
    }
  }

  /**
   * Get contract information
   */
  async getContractInfo() {
    try {
      const [name, symbol, decimals, totalSupply, pointToTokenRatio] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply(),
        this.contract.pointToTokenRatio()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatEther(totalSupply),
        pointToTokenRatio: pointToTokenRatio.toString(),
        contractAddress: this.contractAddress
      };
    } catch (error) {
      console.error('Failed to get contract info:', error);
      throw error;
    }
  }

  /**
   * Calculate tokens for points
   */
  async calculateTokensForPoints(points) {
    try {
      const tokens = await this.contract.getTokensForPoints(points);
      return ethers.formatEther(tokens);
    } catch (error) {
      console.error('Failed to calculate tokens:', error);
      return '0';
    }
  }

  /**
   * Validate migration prerequisites
   */
  async validateMigration(userAddress, points) {
    const errors = [];

    // Check if contract is initialized
    if (!this.contract) {
      errors.push('Contract not initialized');
    }

    // Validate address
    if (!ethers.isAddress(userAddress)) {
      errors.push('Invalid user address');
    }

    // Validate points
    if (!points || points <= 0) {
      errors.push('Points must be greater than 0');
    }

    // Check if migration ID generation would work
    try {
      const testMigrationId = `test_${Date.now()}`;
      const isUsed = await this.contract.isMigrationIdUsed(testMigrationId);
      // This should return false for a test ID
    } catch (error) {
      errors.push('Contract not accessible');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default PointMigrationClient;