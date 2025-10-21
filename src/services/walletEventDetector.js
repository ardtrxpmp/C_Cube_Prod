/**
 * Enhanced Wallet Event Detection Service
 * Detects wallet creation, import, and connection events with duplicate prevention
 */

import { walletRegistry } from './walletAddressRegistry.js';

class WalletEventDetector {
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
    this.detectedWallets = new Set(); // Track wallets detected in current session
  }

  /**
   * Initialize wallet event detection
   */
  async initialize() {
    try {
      console.log('🔍 Initializing wallet event detection...');
      
      // Set up event listeners for different wallet events
      this.setupWalletCreationDetection();
      this.setupWalletImportDetection();
      this.setupWalletConnectionDetection();
      this.setupStorageListeners();
      
      // Process any existing wallets in session storage
      await this.processExistingWallets();
      
      console.log('✅ Wallet event detection initialized');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize wallet event detection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect wallet creation events
   */
  setupWalletCreationDetection() {
    // Listen for new wallet creation in local storage
    this.addStorageListener('ccube_created_wallet', async (walletData) => {
      console.log('🆕 Wallet creation detected:', walletData);
      await this.handleWalletEvent(walletData.address, 'create', walletData);
    });

    // Monitor wallet generation API calls
    this.interceptWalletGenerationAPIs();
  }

  /**
   * Detect wallet import events
   */
  setupWalletImportDetection() {
    // Listen for wallet import storage events
    this.addStorageListener('ccube_imported_wallet', async (walletData) => {
      console.log('📥 Wallet import detected:', walletData);
      await this.handleWalletEvent(walletData.address, 'import', walletData);
    });

    // Monitor private key/mnemonic import forms
    this.monitorImportForms();
  }

  /**
   * Detect wallet connection events (Web3/MetaMask)
   */
  setupWalletConnectionDetection() {
    // Listen for Web3 wallet connections
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          console.log('🔗 Wallet connection detected:', accounts[0]);
          await this.handleWalletEvent(accounts[0], 'connect', { 
            accounts: accounts,
            provider: 'metamask'
          });
        }
      });

      window.ethereum.on('connect', async (connectInfo) => {
        console.log('🌐 Web3 provider connected:', connectInfo);
        // Get current accounts
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await this.handleWalletEvent(accounts[0], 'connect', { 
              accounts: accounts,
              chainId: connectInfo.chainId,
              provider: 'web3'
            });
          }
        } catch (error) {
          console.error('Error getting accounts after connection:', error);
        }
      });
    }

    // Listen for wallet connection storage events
    this.addStorageListener('ccube_connected_wallet', async (walletData) => {
      console.log('🔌 Wallet connection detected:', walletData);
      await this.handleWalletEvent(walletData.address, 'connect', walletData);
    });
  }

  /**
   * Set up storage event listeners
   */
  setupStorageListeners() {
    if (typeof window !== 'undefined') {
      // Listen for storage changes across tabs
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith('ccube_') && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            this.handleStorageEvent(event.key, data);
          } catch (error) {
            console.error('Error parsing storage event data:', error);
          }
        }
      });
    }
  }

  /**
   * Process existing wallets from session storage
   */
  async processExistingWallets() {
    try {
      const existingWallets = this.getExistingWalletsFromStorage();
      
      for (const walletInfo of existingWallets) {
        if (walletInfo.address && !this.detectedWallets.has(walletInfo.address)) {
          console.log('🔄 Processing existing wallet:', walletInfo.address);
          await this.handleWalletEvent(walletInfo.address, walletInfo.type || 'existing', walletInfo);
        }
      }
    } catch (error) {
      console.error('Error processing existing wallets:', error);
    }
  }

  /**
   * Get existing wallets from various storage locations
   */
  getExistingWalletsFromStorage() {
    const wallets = [];
    
    try {
      // Check different storage keys where wallet data might be stored
      const storageKeys = [
        'ccube_wallet_address',
        'ccube_current_wallet',
        'ccube_user_wallet',
        'wallet_address',
        'current_wallet_address'
      ];
      
      storageKeys.forEach(key => {
        const value = sessionStorage.getItem(key) || localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.address || typeof parsed === 'string') {
              wallets.push({
                address: parsed.address || parsed,
                type: 'existing',
                source: key
              });
            }
          } catch {
            // If not JSON, treat as plain address string
            if (value.startsWith('0x') && value.length === 42) {
              wallets.push({
                address: value,
                type: 'existing',
                source: key
              });
            }
          }
        }
      });
    } catch (error) {
      console.error('Error reading existing wallets from storage:', error);
    }
    
    return wallets;
  }

  /**
   * Handle wallet events with duplicate prevention
   */
  async handleWalletEvent(walletAddress, eventType, additionalData = {}) {
    try {
      // Validate wallet address
      if (!walletAddress || !this.isValidWalletAddress(walletAddress)) {
        console.warn('⚠️ Invalid wallet address detected:', walletAddress);
        return { success: false, error: 'Invalid wallet address' };
      }

      // Prevent duplicate processing in current session
      const sessionKey = `${walletAddress}_${eventType}`;
      if (this.detectedWallets.has(sessionKey)) {
        console.log(`⏭️ Wallet event already processed: ${sessionKey}`);
        return { success: true, duplicate: true };
      }

      console.log(`🎯 Processing wallet event: ${eventType} for ${walletAddress}`);

      // Check if wallet already exists in database
      const existsCheck = await walletRegistry.checkWalletExists(walletAddress);
      
      let registrationResult;
      
      if (existsCheck.exists) {
        console.log(`✅ Existing wallet detected: ${walletAddress}`);
        
        // Update activity for existing wallet
        await walletRegistry.updateWalletActivity(walletAddress, `wallet_${eventType}`);
        
        registrationResult = {
          success: true,
          isNew: false,
          message: 'Existing wallet - activity updated',
          existingData: existsCheck.data
        };
      } else {
        console.log(`🆕 New wallet detected: ${walletAddress}`);
        
        // Register new wallet address
        registrationResult = await walletRegistry.registerWalletAddress(walletAddress, eventType);
      }

      // Mark as processed in current session
      this.detectedWallets.add(sessionKey);
      this.detectedWallets.add(walletAddress);

      // Trigger wallet event callbacks
      await this.triggerWalletEventCallbacks({
        address: walletAddress,
        type: eventType,
        isNew: registrationResult.isNew,
        registrationResult: registrationResult,
        additionalData: additionalData,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        walletAddress: walletAddress,
        eventType: eventType,
        isNew: registrationResult.isNew,
        registrationResult: registrationResult
      };

    } catch (error) {
      console.error('❌ Error handling wallet event:', error);
      return {
        success: false,
        error: error.message,
        walletAddress: walletAddress,
        eventType: eventType
      };
    }
  }

  /**
   * Add storage event listener
   */
  addStorageListener(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
  }

  /**
   * Handle storage events
   */
  async handleStorageEvent(key, data) {
    if (this.listeners.has(key)) {
      const callbacks = this.listeners.get(key);
      for (const callback of callbacks) {
        try {
          await callback(data);
        } catch (error) {
          console.error(`Error in storage listener for ${key}:`, error);
        }
      }
    }
  }

  /**
   * Intercept wallet generation APIs
   */
  interceptWalletGenerationAPIs() {
    // This would intercept ethers.js wallet creation, Web3.js account generation, etc.
    // Implementation depends on the specific wallet libraries used
    console.log('🔧 Wallet generation API interception set up');
  }

  /**
   * Monitor import forms
   */
  monitorImportForms() {
    // This would monitor form submissions with private keys or mnemonics
    // Implementation depends on the specific UI framework used
    console.log('📋 Import form monitoring set up');
  }

  /**
   * Validate Ethereum wallet address
   */
  isValidWalletAddress(address) {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  }

  /**
   * Register callback for wallet events
   */
  onWalletEvent(callback) {
    if (!this.listeners.has('wallet_events')) {
      this.listeners.set('wallet_events', []);
    }
    this.listeners.get('wallet_events').push(callback);
  }

  /**
   * Trigger wallet event callbacks
   */
  async triggerWalletEventCallbacks(eventData) {
    if (this.listeners.has('wallet_events')) {
      const callbacks = this.listeners.get('wallet_events');
      for (const callback of callbacks) {
        try {
          await callback(eventData);
        } catch (error) {
          console.error('Error in wallet event callback:', error);
        }
      }
    }
  }

  /**
   * Manually trigger wallet event (for testing or manual registration)
   */
  async triggerWalletEvent(walletAddress, eventType = 'manual', additionalData = {}) {
    return await this.handleWalletEvent(walletAddress, eventType, additionalData);
  }

  /**
   * Get detection statistics
   */
  getDetectionStats() {
    return {
      detecteWalletsInSession: this.detectedWallets.size,
      listenerCount: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
      isProcessing: this.isProcessing
    };
  }

  /**
   * Clear session detection cache
   */
  clearSessionCache() {
    this.detectedWallets.clear();
    console.log('🧹 Wallet detection session cache cleared');
  }
}

// Export singleton instance
export const walletEventDetector = new WalletEventDetector();

// Export class for testing
export { WalletEventDetector };