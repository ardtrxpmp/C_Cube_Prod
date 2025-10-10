// Token storage utilities for cold wallet
class TokenStorage {
  constructor() {
    this.storageKey = 'cold_wallet_tokens';
  }

  // Get all stored tokens
  getTokens() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return [];
    }
  }

  // Save token
  saveToken(token) {
    try {
      const tokens = this.getTokens();
      const existingIndex = tokens.findIndex(t => 
        t.address?.toLowerCase() === token.address?.toLowerCase() && 
        t.chainId === token.chainId
      );

      if (existingIndex >= 0) {
        tokens[existingIndex] = { ...tokens[existingIndex], ...token };
      } else {
        tokens.push(token);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(tokens));
      return true;
    } catch (error) {
      console.error('Error saving token:', error);
      return false;
    }
  }

  // Remove token
  removeToken(address, chainId) {
    try {
      const tokens = this.getTokens();
      const filteredTokens = tokens.filter(token => 
        !(token.address?.toLowerCase() === address?.toLowerCase() && token.chainId === chainId)
      );
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredTokens));
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  }

  // Get tokens for specific network
  getTokensByNetwork(chainId) {
    const allTokens = this.getTokens();
    return allTokens.filter(token => token.chainId === chainId);
  }

  // Clear all tokens
  clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing tokens:', error);
      return false;
    }
  }

  // Import tokens from backup
  importTokens(tokenData) {
    try {
      if (Array.isArray(tokenData)) {
        localStorage.setItem(this.storageKey, JSON.stringify(tokenData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing tokens:', error);
      return false;
    }
  }

  // Export tokens for backup
  exportTokens() {
    return this.getTokens();
  }
}

// Export singleton instance
export default new TokenStorage();