/**
 * User Database Service
 * Manages user points and scores data in the Users_Scores folder
 */

const USER_SCORES_BASE_URL = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/users/Users_Scores';
const GITHUB_API_BASE_URL = 'https://api.github.com/repos/cyfocube/C_DataBase/contents/users/Users_Scores';

class UserDatabaseService {
  constructor() {
    this.cache = new Map(); // Cache for user data
    this.defaultUserSchema = this.getDefaultUserSchema();
  }

  /**
   * Get default user schema for new users
   */
  getDefaultUserSchema() {
    return {
      walletAddress: "",
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
   * Check if user scores data exists for a wallet
   */
  async checkUserScoresExists(walletAddress) {
    try {
      if (!this.isValidWalletAddress(walletAddress)) {
        throw new Error('Invalid wallet address format');
      }

      // Check cache first
      if (this.cache.has(walletAddress)) {
        console.log(`🔍 Cache hit: User scores for ${walletAddress} found`);
        return {
          exists: true,
          source: 'cache',
          data: this.cache.get(walletAddress)
        };
      }

      // Check Users_Scores folder
      const userScoresUrl = `${USER_SCORES_BASE_URL}/${walletAddress}.json`;
      const response = await fetch(userScoresUrl);
      
      if (response.ok) {
        const userData = await response.json();
        
        // Cache the user data
        this.cache.set(walletAddress, userData);
        
        console.log(`✅ User scores found for ${walletAddress}`);
        return {
          exists: true,
          source: 'database',
          data: userData
        };
      } else if (response.status === 404) {
        console.log(`🆕 No user scores found for ${walletAddress} - new user`);
        return {
          exists: false,
          source: 'database'
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error checking user scores existence:', error);
      return {
        exists: false,
        source: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get user scores data (load existing or return default schema)
   */
  async getUserScores(walletAddress) {
    try {
      console.log(`📊 Loading user scores for: ${walletAddress}`);
      
      const existsCheck = await this.checkUserScoresExists(walletAddress);
      
      if (existsCheck.exists) {
        console.log(`✅ Loaded existing user scores for ${walletAddress}`);
        return {
          success: true,
          isNew: false,
          userData: existsCheck.data,
          source: existsCheck.source
        };
      } else {
        // Return default schema for new users
        const defaultSchema = { ...this.defaultUserSchema };
        defaultSchema.walletAddress = walletAddress;
        
        console.log(`🆕 Returning default schema for new user: ${walletAddress}`);
        return {
          success: true,
          isNew: true,
          userData: defaultSchema,
          source: 'default_schema'
        };
      }
    } catch (error) {
      console.error('Error getting user scores:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create new user scores file (only if doesn't exist)
   */
  async createUserScores(walletAddress, initialData = null) {
    try {
      console.log(`🔄 Creating user scores for: ${walletAddress}`);
      
      // First check if user already exists (prevent duplicates)
      const existsCheck = await this.checkUserScoresExists(walletAddress);
      
      if (existsCheck.exists) {
        console.log(`⚠️ User scores already exist for ${walletAddress} - no duplicate created`);
        return {
          success: true,
          isNew: false,
          message: 'User scores already exist - no duplicate created',
          userData: existsCheck.data
        };
      }
      
      // Create new user data
      const newUserData = initialData || { ...this.defaultUserSchema };
      newUserData.walletAddress = walletAddress;
      newUserData.createdAt = new Date().toISOString();
      newUserData.lastActive = new Date().toISOString();
      
      // Cache the new user data
      this.cache.set(walletAddress, newUserData);
      
      console.log(`✅ New user scores created for ${walletAddress}`);
      
      // Note: In a real implementation, you would use GitHub API to commit this file
      // For now, we'll simulate the creation and return success
      return {
        success: true,
        isNew: true,
        message: 'New user scores created successfully',
        userData: newUserData
      };
      
    } catch (error) {
      console.error('Error creating user scores:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user points (add points to existing totals)
   */
  async updateUserPoints(walletAddress, category, subcategory, points) {
    try {
      console.log(`🎯 Updating points for ${walletAddress}: ${category}.${subcategory} +${points}`);
      
      // Get current user data
      const userResult = await this.getUserScores(walletAddress);
      
      if (!userResult.success) {
        throw new Error('Failed to load user data');
      }
      
      const userData = userResult.userData;
      
      // Update points
      if (userData.points[category] && userData.points[category].hasOwnProperty(subcategory)) {
        userData.points[category][subcategory] += points;
      } else {
        console.warn(`⚠️ Unknown category/subcategory: ${category}.${subcategory}`);
        return {
          success: false,
          error: `Unknown category/subcategory: ${category}.${subcategory}`
        };
      }
      
      // Recalculate total points
      userData.points.total = this.calculateTotalPoints(userData.points);
      
      // Update last active timestamp
      userData.lastActive = new Date().toISOString();
      
      // Update cache
      this.cache.set(walletAddress, userData);
      
      console.log(`✅ Points updated for ${walletAddress}: ${category}.${subcategory} = ${userData.points[category][subcategory]}`);
      
      return {
        success: true,
        userData: userData,
        pointsAdded: points,
        newTotal: userData.points.total
      };
      
    } catch (error) {
      console.error('Error updating user points:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user progress (quest completion, level, XP)
   */
  async updateUserProgress(walletAddress, progressUpdate) {
    try {
      console.log(`📈 Updating progress for ${walletAddress}:`, progressUpdate);
      
      // Get current user data
      const userResult = await this.getUserScores(walletAddress);
      
      if (!userResult.success) {
        throw new Error('Failed to load user data');
      }
      
      const userData = userResult.userData;
      
      // Update progress fields
      if (progressUpdate.completedNodes) {
        // Add new completed nodes (avoid duplicates)
        progressUpdate.completedNodes.forEach(node => {
          if (!userData.progress.completedNodes.includes(node)) {
            userData.progress.completedNodes.push(node);
          }
        });
      }
      
      if (progressUpdate.currentQuest !== undefined) {
        userData.progress.currentQuest = progressUpdate.currentQuest;
      }
      
      if (progressUpdate.level !== undefined) {
        userData.progress.level = progressUpdate.level;
      }
      
      if (progressUpdate.xp !== undefined) {
        userData.progress.xp = progressUpdate.xp;
      }
      
      // Update last active timestamp
      userData.lastActive = new Date().toISOString();
      
      // Update cache
      this.cache.set(walletAddress, userData);
      
      console.log(`✅ Progress updated for ${walletAddress}`);
      
      return {
        success: true,
        userData: userData
      };
      
    } catch (error) {
      console.error('Error updating user progress:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate total points across all categories
   */
  calculateTotalPoints(pointsData) {
    let total = 0;
    
    // Sum gaming hub points
    if (pointsData.gamingHub) {
      total += Object.values(pointsData.gamingHub).reduce((sum, val) => sum + val, 0);
    }
    
    // Add story mode points
    if (pointsData.storyMode && pointsData.storyMode.totalScore) {
      total += pointsData.storyMode.totalScore;
    }
    
    return total;
  }

  /**
   * Sync user data with session storage
   */
  async syncWithSessionStorage(walletAddress) {
    try {
      console.log(`🔄 Syncing user data with session storage for ${walletAddress}`);
      
      // Get user data from database
      const userResult = await this.getUserScores(walletAddress);
      
      if (!userResult.success) {
        return { success: false, error: 'Failed to load user data' };
      }
      
      const userData = userResult.userData;
      
      // DO NOT sync database points to session storage - session storage should only contain new gameplay points
      if (typeof sessionStorage !== 'undefined') {
        // Only set wallet address, but NOT the points (to prevent double-counting)
        sessionStorage.setItem('ccube_user_wallet', walletAddress);
        
        console.log(`✅ Wallet address synced to session storage for ${walletAddress} (points NOT synced to avoid double-counting)`);
      }
      
      return {
        success: true,
        userData: userData
      };
      
    } catch (error) {
      console.error('Error syncing with session storage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate Ethereum wallet address
   */
  isValidWalletAddress(address) {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 User database cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedUsers: this.cache.size,
      cachedWallets: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const userDatabase = new UserDatabaseService();

// Export class for testing
export { UserDatabaseService };

// Usage Examples:
/*
// Check if user exists and get their data
const userResult = await userDatabase.getUserScores('0x742d35CC6634C0532925a3b8D4301d13DC8C2E15');
if (userResult.isNew) {
  console.log('New user - creating initial data...');
  await userDatabase.createUserScores(walletAddress);
} else {
  console.log('Existing user - loading saved points...');
}

// Update user points
await userDatabase.updateUserPoints(
  '0x742d35CC6634C0532925a3b8D4301d13DC8C2E15',
  'gamingHub',
  'blockchainBasics',
  1.5
);

// Update user progress
await userDatabase.updateUserProgress(
  '0x742d35CC6634C0532925a3b8D4301d13DC8C2E15',
  {
    completedNodes: ['blockchain-basics-challenge-1'],
    currentQuest: 'crypto-security',
    level: 2,
    xp: 150
  }
);

// Sync with session storage
await userDatabase.syncWithSessionStorage('0x742d35CC6634C0532925a3b8D4301d13DC8C2E15');
*/