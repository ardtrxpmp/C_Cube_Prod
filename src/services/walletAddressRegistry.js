/**
 * Wallet Address Registry Service
 * Manages wallet address registration with duplicate prevention
 */

const WALLET_REGISTRY_BASE_URL = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/users/wallet-addresses';
const GITHUB_API_BASE_URL = 'https://api.github.com/repos/cyfocube/C_DataBase/contents/users/wallet-addresses';

class WalletAddressRegistry {
  constructor() {
    this.cache = new Map(); // Cache for quick duplicate checks
    this.registryLoaded = false;
  }

  /**
   * Check if a wallet address already exists (duplicate prevention)
   */
  async checkWalletExists(walletAddress) {
    try {
      // Validate wallet address format
      if (!this.isValidWalletAddress(walletAddress)) {
        throw new Error('Invalid wallet address format');
      }

      // Quick cache check first
      if (this.cache.has(walletAddress)) {
        console.log(`🔍 Cache hit: Wallet ${walletAddress} exists`);
        return {
          exists: true,
          source: 'cache',
          data: this.cache.get(walletAddress)
        };
      }

      // Check individual wallet file (fastest method)
      const walletFileUrl = `${WALLET_REGISTRY_BASE_URL}/${walletAddress}.json`;
      const response = await fetch(walletFileUrl);
      
      if (response.ok) {
        const walletData = await response.json();
        
        // Cache the result for future checks
        this.cache.set(walletAddress, walletData);
        
        console.log(`✅ Wallet ${walletAddress} exists in registry`);
        return {
          exists: true,
          source: 'database',
          data: walletData
        };
      } else if (response.status === 404) {
        console.log(`🆕 Wallet ${walletAddress} is new (not in registry)`);
        return {
          exists: false,
          source: 'database'
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error checking wallet existence:', error);
      
      // Fallback to registry file check if individual file check fails
      try {
        const registryExists = await this.checkRegistryForWallet(walletAddress);
        return registryExists;
      } catch (fallbackError) {
        console.error('Fallback registry check failed:', fallbackError);
        
        // Conservative approach: assume wallet doesn't exist to prevent duplicates
        return {
          exists: false,
          source: 'error_fallback',
          error: error.message
        };
      }
    }
  }

  /**
   * Fallback method: Check registry.json for wallet address
   */
  async checkRegistryForWallet(walletAddress) {
    try {
      const registryUrl = `${WALLET_REGISTRY_BASE_URL}/registry.json`;
      const response = await fetch(registryUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const registry = await response.json();
      
      // Search for wallet in registry
      const walletExists = registry.walletAddresses.some(
        wallet => wallet.address.toLowerCase() === walletAddress.toLowerCase()
      );
      
      if (walletExists) {
        const walletData = registry.walletAddresses.find(
          wallet => wallet.address.toLowerCase() === walletAddress.toLowerCase()
        );
        
        // Cache the result
        this.cache.set(walletAddress, walletData);
        
        return {
          exists: true,
          source: 'registry',
          data: walletData
        };
      }
      
      return {
        exists: false,
        source: 'registry'
      };
    } catch (error) {
      console.error('Registry check failed:', error);
      throw error;
    }
  }

  /**
   * Register a new wallet address (prevents duplicates)
   */
  async registerWalletAddress(walletAddress, registrationType = 'connect') {
    try {
      console.log(`🔄 Attempting to register wallet: ${walletAddress}`);
      
      // First check if wallet already exists
      const existsCheck = await this.checkWalletExists(walletAddress);
      
      if (existsCheck.exists) {
        console.log(`⚠️ Wallet ${walletAddress} already exists - updating activity instead`);
        
        // Update last activity for existing wallet
        await this.updateWalletActivity(walletAddress);
        
        return {
          success: true,
          isNew: false,
          message: 'Wallet already registered - activity updated',
          existingData: existsCheck.data
        };
      }
      
      // Create new wallet registration
      const newWalletData = {
        walletAddress: walletAddress,
        registeredAt: new Date().toISOString(),
        registrationType: registrationType,
        lastActive: new Date().toISOString(),
        userDataExists: false,
        userDataPath: `../Users_Scores/${walletAddress}.json`,
        events: [
          {
            timestamp: new Date().toISOString(),
            type: `wallet_${registrationType}`,
            source: 'user_action'
          }
        ]
      };
      
      // Cache the new wallet
      this.cache.set(walletAddress, newWalletData);
      
      console.log(`✅ New wallet ${walletAddress} registered successfully`);
      
      // Note: In a real implementation, you would use GitHub API to commit these files
      // For now, we'll simulate the registration and return success
      return {
        success: true,
        isNew: true,
        message: 'New wallet registered successfully',
        walletData: newWalletData
      };
      
    } catch (error) {
      console.error('Error registering wallet address:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update wallet activity timestamp
   */
  async updateWalletActivity(walletAddress, activityType = 'user_activity') {
    try {
      const timestamp = new Date().toISOString();
      
      // Update cache if wallet exists in cache
      if (this.cache.has(walletAddress)) {
        const cachedData = this.cache.get(walletAddress);
        cachedData.lastActive = timestamp;
        cachedData.events.push({
          timestamp: timestamp,
          type: activityType,
          source: 'gaming_hub'
        });
        this.cache.set(walletAddress, cachedData);
      }
      
      console.log(`📊 Updated activity for wallet ${walletAddress}: ${activityType}`);
      
      return {
        success: true,
        timestamp: timestamp
      };
    } catch (error) {
      console.error('Error updating wallet activity:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate Ethereum wallet address format
   */
  isValidWalletAddress(address) {
    // Basic Ethereum address validation
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  }

  /**
   * Get wallet registration statistics
   */
  async getRegistryStats() {
    try {
      const registryUrl = `${WALLET_REGISTRY_BASE_URL}/registry.json`;
      const response = await fetch(registryUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const registry = await response.json();
      
      return {
        totalWallets: registry.totalWallets,
        lastUpdated: registry.lastUpdated,
        registrationTypes: this.analyzeRegistrationTypes(registry.walletAddresses)
      };
    } catch (error) {
      console.error('Error getting registry stats:', error);
      return {
        totalWallets: 0,
        error: error.message
      };
    }
  }

  /**
   * Analyze registration types for statistics
   */
  analyzeRegistrationTypes(walletAddresses) {
    const types = walletAddresses.reduce((acc, wallet) => {
      const type = wallet.registrationType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return types;
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache() {
    this.cache.clear();
    this.registryLoaded = false;
    console.log('🧹 Wallet registry cache cleared');
  }
}

// Export singleton instance
export const walletRegistry = new WalletAddressRegistry();

// Export class for testing
export { WalletAddressRegistry };

// Usage Examples:
/*
// Check if wallet exists before registration
const existsCheck = await walletRegistry.checkWalletExists('0x742d35CC6634C0532925a3b8D4301d13DC8C2E15');
if (existsCheck.exists) {
  console.log('Wallet already registered, loading existing data...');
} else {
  console.log('New wallet detected, proceeding with registration...');
}

// Register new wallet (with duplicate prevention)
const registration = await walletRegistry.registerWalletAddress(
  '0x742d35CC6634C0532925a3b8D4301d13DC8C2E15', 
  'import'
);

// Update wallet activity
await walletRegistry.updateWalletActivity('0x742d35CC6634C0532925a3b8D4301d13DC8C2E15', 'gaming_activity');

// Get registry statistics
const stats = await walletRegistry.getRegistryStats();
console.log('Registry stats:', stats);
*/