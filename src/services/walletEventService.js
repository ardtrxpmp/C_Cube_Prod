/**
 * Wallet Event Detection Service
 * 
 * Detects wallet connection, import, and creation events across the application
 * Triggers user database operations for auto-registration and data sync
 */

class WalletEventService {
  constructor() {
    this.eventListeners = [];
    this.currentWalletAddress = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the wallet event detection system
   */
  initialize() {
    if (this.isInitialized) {
      console.log('🔄 Wallet event service already initialized');
      return;
    }

    console.log('🚀 Initializing wallet event detection service...');
    
    // Monitor localStorage changes for wallet data
    this.setupStorageListener();
    
    // Monitor sessionStorage changes for wallet connections
    this.setupSessionListener();
    
    // Check for existing wallet on initialization
    this.checkExistingWallet();
    
    this.isInitialized = true;
    console.log('✅ Wallet event service initialized successfully');
  }

  /**
   * Set up storage event listener for wallet changes
   */
  setupStorageListener() {
    // Listen for localStorage changes (wallet creation/import)
    window.addEventListener('storage', (event) => {
      if (this.isWalletRelatedKey(event.key)) {
        console.log('💼 Wallet storage event detected:', event.key);
        this.handleWalletEvent('storage_change', event.newValue);
      }
    });

    // Listen for manual storage updates within the same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      originalSetItem.call(localStorage, key, value);
      if (this.isWalletRelatedKey(key)) {
        console.log('💼 Wallet localStorage update detected:', key);
        this.handleWalletEvent('local_storage_update', value);
      }
    };
  }

  /**
   * Set up session storage listener for wallet connections
   */
  setupSessionListener() {
    // Listen for sessionStorage changes (wallet connections)
    const originalSessionSetItem = sessionStorage.setItem;
    sessionStorage.setItem = (key, value) => {
      originalSessionSetItem.call(sessionStorage, key, value);
      if (this.isWalletRelatedKey(key)) {
        console.log('🔗 Wallet session connection detected:', key);
        this.handleWalletEvent('session_connection', value);
      }
    };
  }

  /**
   * Check if a storage key is wallet-related
   */
  isWalletRelatedKey(key) {
    const walletKeys = [
      'ccube_wallet_address',
      'ccube_wallet_data',
      'ccube_current_wallet',
      'wallet_connected',
      'user_wallet',
      'metamask_account',
      'web3_wallet'
    ];
    
    return walletKeys.some(walletKey => 
      key && key.toLowerCase().includes(walletKey.toLowerCase())
    );
  }

  /**
   * Handle wallet events and extract wallet address
   */
  async handleWalletEvent(eventType, data) {
    try {
      let walletAddress = null;

      // Extract wallet address from different data formats
      if (typeof data === 'string') {
        // Direct address string
        if (this.isValidAddress(data)) {
          walletAddress = data;
        }
        // JSON string containing wallet data
        else {
          try {
            const parsed = JSON.parse(data);
            walletAddress = this.extractAddressFromObject(parsed);
          } catch (e) {
            // Not JSON, might be other wallet data
            console.log('📄 Non-JSON wallet data detected');
          }
        }
      } else if (typeof data === 'object' && data !== null) {
        walletAddress = this.extractAddressFromObject(data);
      }

      if (walletAddress && walletAddress !== this.currentWalletAddress) {
        console.log(`🎯 New wallet detected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);
        
        this.currentWalletAddress = walletAddress;
        await this.notifyListeners(eventType, walletAddress);
      }
    } catch (error) {
      console.error('❌ Error handling wallet event:', error);
    }
  }

  /**
   * Extract wallet address from object data
   */
  extractAddressFromObject(obj) {
    const addressKeys = ['address', 'account', 'wallet', 'walletAddress', 'selectedAccount'];
    
    for (const key of addressKeys) {
      if (obj[key] && this.isValidAddress(obj[key])) {
        return obj[key];
      }
    }

    // Check nested objects
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        const nestedAddress = this.extractAddressFromObject(value);
        if (nestedAddress) return nestedAddress;
      }
    }

    return null;
  }

  /**
   * Validate if string is a valid wallet address
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
   * Check for existing wallet on service initialization
   */
  checkExistingWallet() {
    console.log('🔍 Checking for existing wallet...');
    
    // Check localStorage
    const localWallet = this.findWalletInStorage(localStorage);
    if (localWallet) {
      console.log('📦 Found wallet in localStorage');
      this.handleWalletEvent('existing_local', localWallet);
      return;
    }

    // Check sessionStorage
    const sessionWallet = this.findWalletInStorage(sessionStorage);
    if (sessionWallet) {
      console.log('🔗 Found wallet in sessionStorage');
      this.handleWalletEvent('existing_session', sessionWallet);
      return;
    }

    console.log('📭 No existing wallet found');
  }

  /**
   * Find wallet data in storage
   */
  findWalletInStorage(storage) {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (this.isWalletRelatedKey(key)) {
        const value = storage.getItem(key);
        if (value) {
          // Try to extract address from the value
          let address = null;
          
          if (this.isValidAddress(value)) {
            address = value;
          } else {
            try {
              const parsed = JSON.parse(value);
              address = this.extractAddressFromObject(parsed);
            } catch (e) {
              // Not JSON, skip
            }
          }
          
          if (address) return address;
        }
      }
    }
    return null;
  }

  /**
   * Register event listener for wallet changes
   */
  onWalletEvent(callback) {
    this.eventListeners.push(callback);
    console.log(`📋 Wallet event listener registered. Total listeners: ${this.eventListeners.length}`);
  }

  /**
   * Remove event listener
   */
  removeWalletEventListener(callback) {
    const index = this.eventListeners.indexOf(callback);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
      console.log(`🗑️ Wallet event listener removed. Remaining: ${this.eventListeners.length}`);
    }
  }

  /**
   * Notify all registered listeners of wallet events
   */
  async notifyListeners(eventType, walletAddress) {
    console.log(`📢 Notifying ${this.eventListeners.length} listeners of wallet event: ${eventType}`);
    
    for (const callback of this.eventListeners) {
      try {
        await callback({
          type: eventType,
          walletAddress: walletAddress,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error in wallet event listener:', error);
      }
    }
  }

  /**
   * Get current wallet address
   */
  getCurrentWallet() {
    return this.currentWalletAddress;
  }

  /**
   * Manual wallet detection trigger (for testing)
   */
  triggerWalletDetection(address) {
    if (this.isValidAddress(address)) {
      console.log('🧪 Manual wallet detection triggered');
      this.handleWalletEvent('manual_trigger', address);
    } else {
      console.error('❌ Invalid wallet address for manual trigger');
    }
  }
}

// Create singleton instance
const walletEventService = new WalletEventService();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      walletEventService.initialize();
    });
  } else {
    walletEventService.initialize();
  }
}

export default walletEventService;