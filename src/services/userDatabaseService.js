/**
 * User Database Check Service
 * 
 * Checks if wallet address exists in C_DataBase repository
 * Returns existing user data if found, null if new user
 * Ensures no duplicate records are created
 */

class UserDatabaseService {
  constructor() {
    this.baseUrl = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/users';
    this.cache = new Map(); // Cache for user data to reduce API calls
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Check if user exists in database by wallet address
   * @param {string} walletAddress - The wallet address to check
   * @returns {Promise<Object|null>} - User data if exists, null if new user
   */
  async checkUserExists(walletAddress) {
    if (!walletAddress || !this.isValidAddress(walletAddress)) {
      console.error('❌ Invalid wallet address provided');
      return null;
    }

    const normalizedAddress = this.normalizeAddress(walletAddress);
    console.log(`🔍 Checking if user exists: ${normalizedAddress.substring(0, 6)}...${normalizedAddress.substring(normalizedAddress.length - 4)}`);

    // Check cache first
    const cachedData = this.getCachedUserData(normalizedAddress);
    if (cachedData !== null) {
      console.log('⚡ Returning cached user data');
      return cachedData;
    }

    try {
      // Try to fetch user data from database
      const userData = await this.fetchUserFromDatabase(normalizedAddress);
      
      if (userData) {
        console.log('✅ User found in database');
        this.cacheUserData(normalizedAddress, userData);
        return userData;
      } else {
        console.log('👤 New user - not found in database');
        this.cacheUserData(normalizedAddress, null); // Cache negative result
        return null;
      }
    } catch (error) {
      console.error('❌ Error checking user existence:', error);
      return null;
    }
  }

  /**
   * Fetch user data from database
   * @param {string} normalizedAddress - Normalized wallet address
   * @returns {Promise<Object|null>} - User data or null
   */
  async fetchUserFromDatabase(normalizedAddress) {
    try {
      // Try different possible file naming conventions
      const possibleUrls = this.generatePossibleUserUrls(normalizedAddress);
      
      for (const url of possibleUrls) {
        try {
          console.log(`🌐 Trying URL: ${url}`);
          const response = await fetch(url);
          
          if (response.ok) {
            const userData = await response.json();
            
            // Validate user data structure
            if (this.isValidUserData(userData)) {
              console.log('✅ Valid user data found');
              return userData;
            } else {
              console.warn('⚠️ Invalid user data structure found');
            }
          }
        } catch (fetchError) {
          // Continue to next URL if this one fails
          console.log(`⏭️ URL failed, trying next: ${fetchError.message}`);
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching user from database:', error);
      return null;
    }
  }

  /**
   * Generate possible URLs for user data files
   * @param {string} normalizedAddress - Normalized wallet address
   * @returns {Array<string>} - Array of possible URLs
   */
  generatePossibleUserUrls(normalizedAddress) {
    const lowerAddress = normalizedAddress.toLowerCase();
    const upperAddress = normalizedAddress.toUpperCase();
    
    return [
      `${this.baseUrl}/${lowerAddress}.json`,
      `${this.baseUrl}/${upperAddress}.json`,
      `${this.baseUrl}/${normalizedAddress}.json`,
      `${this.baseUrl}/user_${lowerAddress}.json`,
      `${this.baseUrl}/wallet_${lowerAddress}.json`,
      `${this.baseUrl}/${lowerAddress.substring(2)}.json`, // Remove 0x prefix
      `${this.baseUrl}/users/${lowerAddress}.json`,
      `${this.baseUrl}/wallets/${lowerAddress}.json`
    ];
  }

  /**
   * Validate user data structure
   * @param {Object} userData - User data to validate
   * @returns {boolean} - True if valid structure
   */
  isValidUserData(userData) {
    if (!userData || typeof userData !== 'object') {
      return false;
    }

    // Check for required fields
    const requiredFields = ['walletAddress', 'points', 'createdAt'];
    for (const field of requiredFields) {
      if (!(field in userData)) {
        console.warn(`⚠️ Missing required field: ${field}`);
        return false;
      }
    }

    // Check points structure
    if (!userData.points || typeof userData.points !== 'object') {
      console.warn('⚠️ Invalid points structure');
      return false;
    }

    // Check for expected points categories
    const expectedCategories = ['gamingHub', 'storyMode', 'achievements', 'total'];
    for (const category of expectedCategories) {
      if (!(category in userData.points)) {
        console.warn(`⚠️ Missing points category: ${category}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Get user data from cache
   * @param {string} normalizedAddress - Normalized wallet address
   * @returns {Object|null} - Cached data or null
   */
  getCachedUserData(normalizedAddress) {
    const cached = this.cache.get(normalizedAddress);
    
    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(normalizedAddress);
      console.log('🕐 Cache expired for user');
      return null;
    }

    return cached.data;
  }

  /**
   * Cache user data
   * @param {string} normalizedAddress - Normalized wallet address
   * @param {Object|null} userData - User data to cache
   */
  cacheUserData(normalizedAddress, userData) {
    this.cache.set(normalizedAddress, {
      data: userData,
      timestamp: Date.now()
    });
    
    console.log(`💾 Cached user data for ${normalizedAddress.substring(0, 6)}...`);
  }

  /**
   * Clear cache for specific user
   * @param {string} walletAddress - Wallet address to clear from cache
   */
  clearUserCache(walletAddress) {
    const normalizedAddress = this.normalizeAddress(walletAddress);
    this.cache.delete(normalizedAddress);
    console.log('🗑️ Cleared user cache');
  }

  /**
   * Clear all cached data
   */
  clearAllCache() {
    this.cache.clear();
    console.log('🗑️ Cleared all user cache');
  }

  /**
   * Normalize wallet address for consistent storage
   * @param {string} address - Wallet address to normalize
   * @returns {string} - Normalized address
   */
  normalizeAddress(address) {
    if (!address) return '';
    
    // For Ethereum addresses, ensure lowercase
    if (address.startsWith('0x')) {
      return address.toLowerCase();
    }
    
    return address;
  }

  /**
   * Validate wallet address format
   * @param {string} address - Address to validate
   * @returns {boolean} - True if valid
   */
  isValidAddress(address) {
    if (typeof address !== 'string') return false;
    
    // Ethereum address format (0x + 40 hex characters)
    const ethPattern = /^0x[a-fA-F0-9]{40}$/;
    
    // Bitcoin address patterns
    const btcLegacyPattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const btcSegwitPattern = /^bc1[a-z0-9]{39,59}$/;
    
    return ethPattern.test(address) || 
           btcLegacyPattern.test(address) || 
           btcSegwitPattern.test(address);
  }

  /**
   * Get user data with retry mechanism
   * @param {string} walletAddress - Wallet address
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<Object|null>} - User data or null
   */
  async getUserWithRetry(walletAddress, maxRetries = 3) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} to fetch user data`);
        const userData = await this.checkUserExists(walletAddress);
        return userData;
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('❌ All retry attempts failed:', lastError);
    return null;
  }

  /**
   * Check if database is accessible
   * @returns {Promise<boolean>} - True if accessible
   */
  async isDatabaseAccessible() {
    try {
      const testUrl = `${this.baseUrl.replace('/users', '')}/README.md`;
      const response = await fetch(testUrl);
      return response.ok;
    } catch (error) {
      console.error('❌ Database accessibility check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const userDatabaseService = new UserDatabaseService();

export default userDatabaseService;