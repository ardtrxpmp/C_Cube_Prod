/**
 * Auto-Registration Service
 * 
 * Automatically creates new user JSON schema only for new wallet addresses
 * Ensures no duplicate records and initializes proper points structure
 */

import userDatabaseService from './userDatabaseService.js';

class AutoRegistrationService {
  constructor() {
    this.baseUrl = 'https://api.github.com/repos/cyfocube/C_DataBase/contents/users';
    this.githubToken = null; // Set this via environment or config
    this.registrationQueue = new Map(); // Prevent duplicate registrations
  }

  /**
   * Auto-register user if they don't exist in database
   * @param {string} walletAddress - Wallet address to register
   * @returns {Promise<Object>} - User data (existing or newly created)
   */
  async autoRegisterUser(walletAddress) {
    if (!walletAddress || !this.isValidAddress(walletAddress)) {
      throw new Error('Invalid wallet address provided');
    }

    const normalizedAddress = this.normalizeAddress(walletAddress);
    console.log(`🎯 Auto-registering user: ${normalizedAddress.substring(0, 6)}...${normalizedAddress.substring(normalizedAddress.length - 4)}`);

    // Check if registration is already in progress
    if (this.registrationQueue.has(normalizedAddress)) {
      console.log('⏳ Registration already in progress, waiting...');
      return await this.registrationQueue.get(normalizedAddress);
    }

    // Start registration process
    const registrationPromise = this.performRegistration(normalizedAddress);
    this.registrationQueue.set(normalizedAddress, registrationPromise);

    try {
      const result = await registrationPromise;
      return result;
    } finally {
      // Clean up queue
      this.registrationQueue.delete(normalizedAddress);
    }
  }

  /**
   * Perform the actual registration process
   * @param {string} normalizedAddress - Normalized wallet address
   * @returns {Promise<Object>} - User data
   */
  async performRegistration(normalizedAddress) {
    try {
      // Step 1: Check if user already exists
      console.log('🔍 Step 1: Checking if user exists...');
      const existingUser = await userDatabaseService.checkUserExists(normalizedAddress);
      
      if (existingUser) {
        console.log('✅ User already exists, returning existing data');
        return existingUser;
      }

      // Step 2: Create new user schema
      console.log('👤 Step 2: Creating new user schema...');
      const newUserData = this.createUserSchema(normalizedAddress);

      // Step 3: Save to database (simulation - actual implementation would use GitHub API)
      console.log('💾 Step 3: Saving user to database...');
      await this.saveUserToDatabase(normalizedAddress, newUserData);

      // Step 4: Cache the new user data
      userDatabaseService.cacheUserData(normalizedAddress, newUserData);

      console.log('🎉 User registration completed successfully');
      return newUserData;

    } catch (error) {
      console.error('❌ Error during user registration:', error);
      throw error;
    }
  }

  /**
   * Create initial user schema with proper structure
   * @param {string} walletAddress - Wallet address
   * @returns {Object} - Initial user data structure
   */
  createUserSchema(walletAddress) {
    const now = new Date().toISOString();
    
    const userSchema = {
      walletAddress: walletAddress,
      createdAt: now,
      lastUpdated: now,
      version: "1.0.0",
      points: {
        gamingHub: {
          blockchainBasics: 0,
          smartContracts: 0,
          defiProtocols: 0,
          nftsWeb3: 0,
          cryptoSecurity: 0
        },
        storyMode: {
          chaptersCompleted: 0,
          questsFinished: 0,
          achievementsUnlocked: 0,
          totalStoryPoints: 0
        },
        achievements: {
          firstWallet: false,
          learningStreak: 0,
          perfectScores: 0,
          communityParticipation: 0,
          specialEvents: 0
        },
        total: {
          allTimePoints: 0,
          currentLevel: 1,
          experience: 0,
          badges: []
        }
      },
      preferences: {
        notifications: true,
        theme: "dark",
        language: "en",
        privacy: {
          shareProgress: false,
          publicProfile: false
        }
      },
      statistics: {
        sessionsCount: 1,
        totalTimeSpent: 0,
        averageSessionTime: 0,
        lastSessionDate: now,
        deviceCount: 1
      },
      metadata: {
        registrationSource: "auto",
        ipCountry: null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        platform: this.detectPlatform()
      }
    };

    console.log('📋 Created user schema with initial structure');
    return userSchema;
  }

  /**
   * Save user data to database
   * Note: This is a simulation. In production, this would use GitHub API
   * to create the actual JSON file in the repository
   * @param {string} walletAddress - Wallet address
   * @param {Object} userData - User data to save
   */
  async saveUserToDatabase(walletAddress, userData) {
    try {
      // For now, we'll simulate the save operation
      // In production, this would use GitHub API to create the file
      
      console.log('🔄 Simulating database save...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log what would be saved
      console.log('💾 Would save to database:', {
        filename: `${walletAddress}.json`,
        path: `users/${walletAddress}.json`,
        content: JSON.stringify(userData, null, 2),
        message: `Auto-register user ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
      });

      // TODO: Implement actual GitHub API call
      // const result = await this.createFileInGitHub(walletAddress, userData);
      
      console.log('✅ User data saved successfully (simulated)');
      
    } catch (error) {
      console.error('❌ Error saving user to database:', error);
      throw error;
    }
  }

  /**
   * Create file in GitHub repository (for future implementation)
   * @param {string} walletAddress - Wallet address
   * @param {Object} userData - User data
   */
  async createFileInGitHub(walletAddress, userData) {
    if (!this.githubToken) {
      throw new Error('GitHub token not configured');
    }

    const filename = `${walletAddress}.json`;
    const content = Buffer.from(JSON.stringify(userData, null, 2)).toString('base64');

    const requestBody = {
      message: `Auto-register user ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
      content: content,
      branch: 'main'
    };

    const response = await fetch(`${this.baseUrl}/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update existing user data
   * @param {string} walletAddress - Wallet address
   * @param {Object} updates - Data to update
   * @returns {Promise<Object>} - Updated user data
   */
  async updateUserData(walletAddress, updates) {
    const normalizedAddress = this.normalizeAddress(walletAddress);
    
    try {
      // Get existing user data
      const existingUser = await userDatabaseService.checkUserExists(normalizedAddress);
      
      if (!existingUser) {
        console.log('👤 User not found, creating new user');
        return await this.autoRegisterUser(walletAddress);
      }

      // Merge updates with existing data
      const updatedUser = this.mergeUserData(existingUser, updates);
      updatedUser.lastUpdated = new Date().toISOString();

      // Save updated data
      await this.saveUserToDatabase(normalizedAddress, updatedUser);

      // Update cache
      userDatabaseService.cacheUserData(normalizedAddress, updatedUser);

      console.log('✅ User data updated successfully');
      return updatedUser;

    } catch (error) {
      console.error('❌ Error updating user data:', error);
      throw error;
    }
  }

  /**
   * Merge user data updates
   * @param {Object} existingData - Existing user data
   * @param {Object} updates - Updates to apply
   * @returns {Object} - Merged data
   */
  mergeUserData(existingData, updates) {
    // Deep merge function
    const deepMerge = (target, source) => {
      const result = { ...target };
      
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }
      }
      
      return result;
    };

    return deepMerge(existingData, updates);
  }

  /**
   * Detect platform for metadata
   * @returns {string} - Platform identifier
   */
  detectPlatform() {
    if (typeof window === 'undefined') return 'server';
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  /**
   * Normalize wallet address
   * @param {string} address - Wallet address
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
   * Validate wallet address
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
   * Set GitHub token for API operations
   * @param {string} token - GitHub personal access token
   */
  setGitHubToken(token) {
    this.githubToken = token;
    console.log('🔑 GitHub token configured');
  }

  /**
   * Get registration queue status
   * @returns {Object} - Queue status
   */
  getQueueStatus() {
    return {
      activeRegistrations: this.registrationQueue.size,
      addresses: Array.from(this.registrationQueue.keys()).map(addr => 
        `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      )
    };
  }
}

// Create singleton instance
const autoRegistrationService = new AutoRegistrationService();

export default autoRegistrationService;