/**
 * Wallet Database Integration Service
 * 
 * Main service that connects all wallet-database components together
 * Integrates with existing addPoints function and migrate points system
 * Provides seamless wallet-to-database user experience
 */

import walletEventService from './walletEventService.js';
import pointsSyncService from './pointsSyncService.js';

class WalletDatabaseIntegration {
  constructor() {
    this.isInitialized = false;
    this.currentWallet = null;
    this.originalAddPoints = null; // Store reference to original addPoints
  }

  /**
   * Initialize the complete wallet-database integration system
   * @param {Function} addPointsFunction - The existing addPoints function
   */
  async initialize(addPointsFunction) {
    if (this.isInitialized) {
      console.log('🔄 Wallet-database integration already initialized');
      return;
    }

    console.log('🚀 Initializing wallet-database integration...');

    try {
      // Store original addPoints function
      this.originalAddPoints = addPointsFunction;

      // Set up wallet event listener
      walletEventService.onWalletEvent(this.handleWalletEvent.bind(this));

      // Check for existing wallet and initialize if found
      const existingWallet = walletEventService.getCurrentWallet();
      if (existingWallet) {
        await this.handleWalletEvent({
          type: 'existing_wallet',
          walletAddress: existingWallet,
          timestamp: new Date().toISOString()
        });
      }

      this.isInitialized = true;
      console.log('✅ Wallet-database integration initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing wallet-database integration:', error);
      throw error;
    }
  }

  /**
   * Handle wallet events (connect/import/create)
   * @param {Object} event - Wallet event data
   */
  async handleWalletEvent(event) {
    try {
      console.log(`🎯 Handling wallet event: ${event.type} for ${event.walletAddress.substring(0, 6)}...`);

      // Update current wallet
      this.currentWallet = event.walletAddress;

      // Initialize points synchronization
      await pointsSyncService.initializePointsSync(event.walletAddress);

      // Enhance the addPoints function with database sync
      this.enhanceAddPointsFunction();

      console.log('🎉 Wallet-database integration activated for user');

    } catch (error) {
      console.error('❌ Error handling wallet event:', error);
    }
  }

  /**
   * Enhance the existing addPoints function with database synchronization
   */
  enhanceAddPointsFunction() {
    if (!this.originalAddPoints) {
      console.warn('⚠️ Original addPoints function not available');
      return;
    }

    // Create enhanced addPoints function
    const enhancedAddPoints = async (category, subcategory, points) => {
      try {
        // Call original addPoints function
        if (this.originalAddPoints) {
          this.originalAddPoints(category, subcategory, points);
        }

        // Sync to database if wallet is connected
        if (this.currentWallet) {
          await pointsSyncService.addPoints(this.currentWallet, category, subcategory, points);
          console.log(`💎 Points synced to database: +${points} ${category}.${subcategory}`);
        }

      } catch (error) {
        console.error('❌ Error in enhanced addPoints:', error);
        // Fallback to original function
        if (this.originalAddPoints) {
          this.originalAddPoints(category, subcategory, points);
        }
      }
    };

    // Replace global addPoints if it exists
    if (typeof window !== 'undefined' && window.addPoints) {
      window.addPoints = enhancedAddPoints;
      console.log('🔧 Enhanced global addPoints function');
    }

    return enhancedAddPoints;
  }

  /**
   * Get enhanced addPoints function
   * @returns {Function} - Enhanced addPoints function
   */
  getEnhancedAddPoints() {
    return async (category, subcategory, points) => {
      try {
        // Call original addPoints function
        if (this.originalAddPoints) {
          this.originalAddPoints(category, subcategory, points);
        }

        // Sync to database if wallet is connected
        if (this.currentWallet) {
          await pointsSyncService.addPoints(this.currentWallet, category, subcategory, points);
          console.log(`💎 Points synced to database: +${points} ${category}.${subcategory}`);
        }

      } catch (error) {
        console.error('❌ Error in enhanced addPoints:', error);
        // Fallback to original function
        if (this.originalAddPoints) {
          this.originalAddPoints(category, subcategory, points);
        }
      }
    };
  }

  /**
   * Manually trigger wallet detection (for testing)
   * @param {string} walletAddress - Wallet address to simulate
   */
  async simulateWalletConnection(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address required for simulation');
    }

    console.log('🧪 Simulating wallet connection...');
    
    await this.handleWalletEvent({
      type: 'simulation',
      walletAddress: walletAddress,
      timestamp: new Date().toISOString()
    });

    console.log('✅ Wallet connection simulation completed');
  }

  /**
   * Get current integration status
   * @returns {Object} - Integration status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentWallet: this.currentWallet ? 
        `${this.currentWallet.substring(0, 6)}...${this.currentWallet.substring(this.currentWallet.length - 4)}` : 
        null,
      walletEventService: {
        isInitialized: walletEventService.isInitialized,
        currentWallet: walletEventService.getCurrentWallet()
      },
      pointsSync: pointsSyncService.getSyncStatus()
    };
  }

  /**
   * Force sync all points to database
   */
  async forceSyncToDatabase() {
    if (!this.currentWallet) {
      throw new Error('No wallet connected for sync');
    }

    try {
      await pointsSyncService.forceSyncToDatabase(this.currentWallet);
      console.log('💪 Force sync to database completed');
    } catch (error) {
      console.error('❌ Force sync failed:', error);
      throw error;
    }
  }

  /**
   * Handle wallet disconnect/logout
   */
  handleWalletDisconnect() {
    console.log('👋 Handling wallet disconnect...');
    
    // Clear current wallet
    this.currentWallet = null;
    
    // Clear points data
    pointsSyncService.clearPointsData();
    
    // Restore original addPoints function
    if (typeof window !== 'undefined' && this.originalAddPoints) {
      window.addPoints = this.originalAddPoints;
    }
    
    console.log('✅ Wallet disconnect handled');
  }

  /**
   * Get user points from database
   * @returns {Promise<Object>} - User points data
   */
  async getUserPoints() {
    if (!this.currentWallet) {
      return null;
    }

    try {
      const sessionPoints = pointsSyncService.getSessionPoints();
      return sessionPoints;
    } catch (error) {
      console.error('❌ Error getting user points:', error);
      return null;
    }
  }

  /**
   * Update user points manually
   * @param {Object} pointsUpdates - Points updates to apply
   */
  async updateUserPoints(pointsUpdates) {
    if (!this.currentWallet) {
      throw new Error('No wallet connected for points update');
    }

    try {
      await pointsSyncService.updatePointsEverywhere(this.currentWallet, pointsUpdates);
      console.log('✅ User points updated manually');
    } catch (error) {
      console.error('❌ Error updating user points:', error);
      throw error;
    }
  }

  /**
   * Get wallet-database integration statistics
   * @returns {Object} - Integration statistics
   */
  getIntegrationStats() {
    const status = this.getStatus();
    
    return {
      ...status,
      performance: {
        lastSyncTime: pointsSyncService.getSyncStatus().lastSyncTime,
        syncQueueSize: pointsSyncService.getSyncStatus().queueSize,
        autoSaveActive: pointsSyncService.getSyncStatus().autoSaveActive
      },
      metadata: {
        initializationTime: this.isInitialized ? new Date().toISOString() : null,
        totalWalletEvents: walletEventService.eventListeners?.length || 0
      }
    };
  }
}

// Create singleton instance
const walletDatabaseIntegration = new WalletDatabaseIntegration();

export default walletDatabaseIntegration;