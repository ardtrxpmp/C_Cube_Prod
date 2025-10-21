/**
 * Points Synchronization Service
 * 
 * Syncs points between sessionStorage and database
 * Loads existing points for returning users, saves points updates to database
 * Ensures seamless cross-device synchronization
 */

import userDatabaseService from './userDatabaseService.js';
import autoRegistrationService from './autoRegistrationService.js';

class PointsSyncService {
  constructor() {
    this.syncInProgress = false;
    this.syncQueue = [];
    this.sessionStorageKey = 'ccube_user_points';
    this.lastSyncTime = null;
    this.autoSaveInterval = 30000; // 30 seconds
    this.autoSaveTimer = null;
  }

  /**
   * Initialize points synchronization for a wallet
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} - Synchronized points data
   */
  async initializePointsSync(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address required for points sync');
    }

    console.log(`🔄 Initializing points sync for wallet: ${walletAddress.substring(0, 6)}...`);

    try {
      // Step 1: Get or create user in database
      const userData = await autoRegistrationService.autoRegisterUser(walletAddress);
      
      // Step 2: Get current session points
      const sessionPoints = this.getSessionPoints();
      
      // Step 3: Determine sync strategy
      const syncedPoints = await this.determineSyncStrategy(userData.points, sessionPoints);
      
      // Step 4: Update both storages with synced data
      await this.updatePointsEverywhere(walletAddress, syncedPoints);
      
      // Step 5: Start auto-save
      this.startAutoSave(walletAddress);
      
      console.log('✅ Points synchronization initialized successfully');
      return syncedPoints;

    } catch (error) {
      console.error('❌ Error initializing points sync:', error);
      throw error;
    }
  }

  /**
   * Determine the best sync strategy for points
   * @param {Object} databasePoints - Points from database
   * @param {Object} sessionPoints - Points from session storage
   * @returns {Promise<Object>} - Merged points data
   */
  async determineSyncStrategy(databasePoints, sessionPoints) {
    console.log('🤔 Determining sync strategy...');
    
    // If no session points, use database points
    if (!sessionPoints || this.isEmptyPoints(sessionPoints)) {
      console.log('📥 Using database points (no session data)');
      return databasePoints;
    }
    
    // If no database points, use session points
    if (!databasePoints || this.isEmptyPoints(databasePoints)) {
      console.log('📤 Using session points (no database data)');
      return sessionPoints;
    }
    
    // Both exist - use higher values (user benefits from best of both)
    console.log('🔄 Merging points (taking highest values)');
    return this.mergePointsWithMaxValues(databasePoints, sessionPoints);
  }

  /**
   * Merge points by taking maximum values
   * @param {Object} dbPoints - Database points
   * @param {Object} sessionPoints - Session points
   * @returns {Object} - Merged points
   */
  mergePointsWithMaxValues(dbPoints, sessionPoints) {
    const merged = JSON.parse(JSON.stringify(dbPoints)); // Deep copy
    
    // Merge gaming hub points
    if (sessionPoints.gamingHub) {
      merged.gamingHub = merged.gamingHub || {};
      for (const [key, value] of Object.entries(sessionPoints.gamingHub)) {
        merged.gamingHub[key] = Math.max(merged.gamingHub[key] || 0, value || 0);
      }
    }
    
    // Merge story mode points
    if (sessionPoints.storyMode) {
      merged.storyMode = merged.storyMode || {};
      for (const [key, value] of Object.entries(sessionPoints.storyMode)) {
        merged.storyMode[key] = Math.max(merged.storyMode[key] || 0, value || 0);
      }
    }
    
    // Merge achievements
    if (sessionPoints.achievements) {
      merged.achievements = merged.achievements || {};
      for (const [key, value] of Object.entries(sessionPoints.achievements)) {
        if (typeof value === 'boolean') {
          merged.achievements[key] = merged.achievements[key] || value;
        } else {
          merged.achievements[key] = Math.max(merged.achievements[key] || 0, value || 0);
        }
      }
    }
    
    // Merge totals
    if (sessionPoints.total) {
      merged.total = merged.total || {};
      for (const [key, value] of Object.entries(sessionPoints.total)) {
        if (Array.isArray(value)) {
          // For arrays (like badges), merge unique values
          merged.total[key] = [...new Set([...(merged.total[key] || []), ...value])];
        } else {
          merged.total[key] = Math.max(merged.total[key] || 0, value || 0);
        }
      }
    }
    
    console.log('🔀 Points merged successfully');
    return merged;
  }

  /**
   * Update points in all storage locations
   * @param {string} walletAddress - Wallet address
   * @param {Object} points - Points data to save
   */
  async updatePointsEverywhere(walletAddress, points) {
    try {
      // Update session storage
      this.saveSessionPoints(points);
      
      // Update database (async, don't wait)
      this.updateDatabasePoints(walletAddress, points).catch(error => {
        console.error('⚠️ Database update failed (will retry):', error);
        this.queueSync(walletAddress, points);
      });
      
      console.log('💾 Points updated in all storage locations');
      
    } catch (error) {
      console.error('❌ Error updating points everywhere:', error);
      throw error;
    }
  }

  /**
   * Get points from session storage
   * @returns {Object|null} - Session points or null
   */
  getSessionPoints() {
    try {
      const stored = sessionStorage.getItem(this.sessionStorageKey);
      if (stored) {
        const points = JSON.parse(stored);
        console.log('📱 Retrieved session points');
        return points;
      }
    } catch (error) {
      console.error('❌ Error reading session points:', error);
    }
    return null;
  }

  /**
   * Save points to session storage
   * @param {Object} points - Points to save
   */
  saveSessionPoints(points) {
    try {
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(points));
      console.log('💾 Saved points to session storage');
    } catch (error) {
      console.error('❌ Error saving session points:', error);
    }
  }

  /**
   * Update points in database
   * @param {string} walletAddress - Wallet address
   * @param {Object} points - Points to update
   */
  async updateDatabasePoints(walletAddress, points) {
    try {
      const updates = {
        points: points,
        lastUpdated: new Date().toISOString()
      };
      
      await autoRegistrationService.updateUserData(walletAddress, updates);
      this.lastSyncTime = Date.now();
      console.log('☁️ Database points updated successfully');
      
    } catch (error) {
      console.error('❌ Error updating database points:', error);
      throw error;
    }
  }

  /**
   * Add points to user's total
   * @param {string} walletAddress - Wallet address
   * @param {string} category - Points category (gamingHub, storyMode, etc.)
   * @param {string} subcategory - Points subcategory
   * @param {number} points - Points to add
   */
  async addPoints(walletAddress, category, subcategory, points) {
    if (!walletAddress) {
      console.warn('⚠️ No wallet address provided for points addition');
      return;
    }

    try {
      console.log(`➕ Adding ${points} points to ${category}.${subcategory}`);
      
      // Get current points
      const currentPoints = this.getSessionPoints() || this.createEmptyPointsStructure();
      
      // Add points to category
      if (!currentPoints[category]) {
        currentPoints[category] = {};
      }
      
      currentPoints[category][subcategory] = (currentPoints[category][subcategory] || 0) + points;
      
      // Update total points
      currentPoints.total = currentPoints.total || {};
      currentPoints.total.allTimePoints = (currentPoints.total.allTimePoints || 0) + points;
      
      // Save everywhere
      await this.updatePointsEverywhere(walletAddress, currentPoints);
      
      console.log('✅ Points added successfully');
      
    } catch (error) {
      console.error('❌ Error adding points:', error);
    }
  }

  /**
   * Create empty points structure
   * @returns {Object} - Empty points structure
   */
  createEmptyPointsStructure() {
    return {
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
    };
  }

  /**
   * Check if points structure is empty
   * @param {Object} points - Points to check
   * @returns {boolean} - True if empty
   */
  isEmptyPoints(points) {
    if (!points || typeof points !== 'object') return true;
    
    const checkCategory = (category) => {
      if (!category || typeof category !== 'object') return true;
      return Object.values(category).every(value => 
        value === 0 || value === false || (Array.isArray(value) && value.length === 0)
      );
    };
    
    return Object.values(points).every(category => checkCategory(category));
  }

  /**
   * Start auto-save timer
   * @param {string} walletAddress - Wallet address
   */
  startAutoSave(walletAddress) {
    this.stopAutoSave(); // Clear existing timer
    
    this.autoSaveTimer = setInterval(async () => {
      try {
        const sessionPoints = this.getSessionPoints();
        if (sessionPoints) {
          await this.updateDatabasePoints(walletAddress, sessionPoints);
          console.log('🔄 Auto-save completed');
        }
      } catch (error) {
        console.error('⚠️ Auto-save failed:', error);
      }
    }, this.autoSaveInterval);
    
    console.log('⏰ Auto-save timer started');
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('⏹️ Auto-save timer stopped');
    }
  }

  /**
   * Queue sync operation for retry
   * @param {string} walletAddress - Wallet address
   * @param {Object} points - Points to sync
   */
  queueSync(walletAddress, points) {
    this.syncQueue.push({
      walletAddress,
      points,
      timestamp: Date.now()
    });
    
    console.log(`📋 Sync queued. Queue size: ${this.syncQueue.length}`);
  }

  /**
   * Process sync queue
   */
  async processSyncQueue() {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Processing sync queue: ${this.syncQueue.length} items`);

    while (this.syncQueue.length > 0) {
      const syncItem = this.syncQueue.shift();
      
      try {
        await this.updateDatabasePoints(syncItem.walletAddress, syncItem.points);
        console.log('✅ Queued sync completed');
      } catch (error) {
        console.error('❌ Queued sync failed:', error);
        // Re-queue if not too old (5 minutes)
        if (Date.now() - syncItem.timestamp < 5 * 60 * 1000) {
          this.syncQueue.push(syncItem);
        }
        break; // Stop processing on error
      }
    }

    this.syncInProgress = false;
  }

  /**
   * Force sync points to database
   * @param {string} walletAddress - Wallet address
   */
  async forceSyncToDatabase(walletAddress) {
    try {
      const sessionPoints = this.getSessionPoints();
      if (sessionPoints) {
        await this.updateDatabasePoints(walletAddress, sessionPoints);
        console.log('💪 Force sync completed');
      }
    } catch (error) {
      console.error('❌ Force sync failed:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   * @returns {Object} - Sync status information
   */
  getSyncStatus() {
    return {
      syncInProgress: this.syncInProgress,
      queueSize: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      autoSaveActive: !!this.autoSaveTimer
    };
  }

  /**
   * Clear all points data (for logout)
   */
  clearPointsData() {
    try {
      sessionStorage.removeItem(this.sessionStorageKey);
      this.stopAutoSave();
      this.syncQueue.length = 0;
      this.lastSyncTime = null;
      console.log('🗑️ Points data cleared');
    } catch (error) {
      console.error('❌ Error clearing points data:', error);
    }
  }
}

// Create singleton instance
const pointsSyncService = new PointsSyncService();

// Start queue processing every 60 seconds
setInterval(() => {
  pointsSyncService.processSyncQueue();
}, 60000);

export default pointsSyncService;