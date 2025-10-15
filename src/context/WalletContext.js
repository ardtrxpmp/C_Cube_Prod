import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Create the Wallet Context
const WalletContext = createContext();

// Custom hook to use the Wallet Context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Wallet Provider Component
export const WalletProvider = ({ children }) => {
  // C-Cube Wallet State
  const [cCubeWalletConnected, setCCubeWalletConnected] = useState(false);
  const [cCubeWalletData, setCCubeWalletData] = useState(null);
  
  // External Wallet State
  const [externalWalletConnected, setExternalWalletConnected] = useState(false);
  const [externalWalletData, setExternalWalletData] = useState(null);
  
  // General Wallet State
  const [currentWalletType, setCurrentWalletType] = useState(null); // 'ccube' or 'external'
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [gasPrice, setGasPrice] = useState(null);
  const [isMainnet, setIsMainnet] = useState(false);
  
  // Load wallet state from localStorage on app initialization
  useEffect(() => {
    const loadPersistedWalletState = () => {
      try {
        // Load C-Cube wallet state
        const savedCCubeState = localStorage.getItem('cCubeWalletConnected');
        const savedCCubeData = localStorage.getItem('cCubeWalletData');
        
        if (savedCCubeState === 'true' && savedCCubeData) {
          setCCubeWalletConnected(true);
          setCCubeWalletData(JSON.parse(savedCCubeData));
          setCurrentWalletType('ccube');
        }
        
        // Load External wallet state
        const savedExternalState = localStorage.getItem('externalWalletConnected');
        const savedExternalData = localStorage.getItem('externalWalletData');
        
        if (savedExternalState === 'true' && savedExternalData) {
          setExternalWalletConnected(true);
          setExternalWalletData(JSON.parse(savedExternalData));
          if (!currentWalletType) {
            setCurrentWalletType('external');
          }
        }
        
        // Load network preference
        const savedNetworkState = localStorage.getItem('isMainnet');
        if (savedNetworkState !== null) {
          setIsMainnet(savedNetworkState === 'true');
        }
        
        console.log('✅ Wallet state loaded from localStorage');
      } catch (error) {
        console.error('❌ Error loading wallet state:', error);
      }
    };
    
    loadPersistedWalletState();
  }, []);
  
  // Persist wallet state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cCubeWalletConnected', cCubeWalletConnected.toString());
      if (cCubeWalletData) {
        localStorage.setItem('cCubeWalletData', JSON.stringify(cCubeWalletData));
      } else {
        localStorage.removeItem('cCubeWalletData');
      }
    } catch (error) {
      console.error('❌ Error saving C-Cube wallet state:', error);
    }
  }, [cCubeWalletConnected, cCubeWalletData]);
  
  useEffect(() => {
    try {
      localStorage.setItem('externalWalletConnected', externalWalletConnected.toString());
      if (externalWalletData) {
        localStorage.setItem('externalWalletData', JSON.stringify(externalWalletData));
      } else {
        localStorage.removeItem('externalWalletData');
      }
    } catch (error) {
      console.error('❌ Error saving external wallet state:', error);
    }
  }, [externalWalletConnected, externalWalletData]);
  
  useEffect(() => {
    try {
      localStorage.setItem('isMainnet', isMainnet.toString());
    } catch (error) {
      console.error('❌ Error saving network state:', error);
    }
  }, [isMainnet]);
  
  // C-Cube Wallet Connection Functions
  const connectCCubeWallet = async (walletData) => {
    try {
      console.log('🔗 Connecting C-Cube wallet...', walletData);
      
      // Disconnect any external wallet first
      if (externalWalletConnected) {
        await disconnectExternalWallet();
      }
      
      setCCubeWalletConnected(true);
      setCCubeWalletData(walletData);
      setCurrentWalletType('ccube');
      
      console.log('✅ C-Cube wallet connected successfully');
      return { success: true, walletData };
    } catch (error) {
      console.error('❌ Error connecting C-Cube wallet:', error);
      return { success: false, error: error.message };
    }
  };
  
  const disconnectCCubeWallet = async () => {
    try {
      console.log('🔌 Disconnecting C-Cube wallet...');
      
      setCCubeWalletConnected(false);
      setCCubeWalletData(null);
      
      // If this was the current wallet, clear current type
      if (currentWalletType === 'ccube') {
        setCurrentWalletType(null);
      }
      
      console.log('✅ C-Cube wallet disconnected successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error disconnecting C-Cube wallet:', error);
      return { success: false, error: error.message };
    }
  };
  
  // External Wallet Connection Functions
  const connectExternalWallet = async () => {
    try {
      console.log('🔗 Connecting external wallet...');
      
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask or compatible wallet not found');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      const walletData = {
        address,
        network: network.name,
        chainId: Number(network.chainId),
        provider: 'MetaMask' // or detect provider type
      };
      
      // Disconnect any C-Cube wallet first
      if (cCubeWalletConnected) {
        await disconnectCCubeWallet();
      }
      
      setExternalWalletConnected(true);
      setExternalWalletData(walletData);
      setCurrentWalletType('external');
      
      // Listen for account/network changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      console.log('✅ External wallet connected successfully:', walletData);
      return { success: true, walletData };
    } catch (error) {
      console.error('❌ Error connecting external wallet:', error);
      return { success: false, error: error.message };
    }
  };
  
  const disconnectExternalWallet = async () => {
    try {
      console.log('🔌 Disconnecting external wallet...');
      
      // Remove event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
      
      setExternalWalletConnected(false);
      setExternalWalletData(null);
      
      // If this was the current wallet, clear current type
      if (currentWalletType === 'external') {
        setCurrentWalletType(null);
      }
      
      console.log('✅ External wallet disconnected successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error disconnecting external wallet:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Handle MetaMask account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      await disconnectExternalWallet();
    } else {
      // Update wallet data with new account
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        const walletData = {
          address,
          network: network.name,
          chainId: Number(network.chainId),
          provider: 'MetaMask'
        };
        
        setExternalWalletData(walletData);
        console.log('🔄 External wallet account changed:', walletData);
      } catch (error) {
        console.error('❌ Error handling account change:', error);
      }
    }
  };
  
  // Handle MetaMask network changes
  const handleChainChanged = async (chainId) => {
    console.log('🔄 Network changed:', chainId);
    if (externalWalletConnected) {
      // Refresh wallet data with new network
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        const walletData = {
          address,
          network: network.name,
          chainId: Number(network.chainId),
          provider: 'MetaMask'
        };
        
        setExternalWalletData(walletData);
        console.log('✅ Wallet data updated for new network:', walletData);
      } catch (error) {
        console.error('❌ Error handling network change:', error);
      }
    }
  };
  
  // Disconnect all wallets
  const disconnectAllWallets = async () => {
    try {
      console.log('🔌 Disconnecting all wallets...');
      
      await Promise.all([
        disconnectCCubeWallet(),
        disconnectExternalWallet()
      ]);
      
      setCurrentWalletType(null);
      console.log('✅ All wallets disconnected successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error disconnecting all wallets:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Get current active wallet data
  const getCurrentWallet = () => {
    if (currentWalletType === 'ccube' && cCubeWalletConnected) {
      return {
        type: 'ccube',
        connected: true,
        data: cCubeWalletData
      };
    } else if (currentWalletType === 'external' && externalWalletConnected) {
      return {
        type: 'external',
        connected: true,
        data: externalWalletData
      };
    }
    return {
      type: null,
      connected: false,
      data: null
    };
  };
  
  // Check if any wallet is connected
  const isAnyWalletConnected = () => {
    return cCubeWalletConnected || externalWalletConnected;
  };
  
  // Get wallet display name
  const getWalletDisplayName = () => {
    const currentWallet = getCurrentWallet();
    if (!currentWallet.connected) return 'No Wallet Connected';
    
    if (currentWallet.type === 'ccube') {
      return `C-Cube Wallet (${currentWallet.data?.address?.slice(0, 6)}...${currentWallet.data?.address?.slice(-4)})`;
    } else if (currentWallet.type === 'external') {
      return `${currentWallet.data?.provider || 'External'} (${currentWallet.data?.address?.slice(0, 6)}...${currentWallet.data?.address?.slice(-4)})`;
    }
    
    return 'Unknown Wallet';
  };
  
  // Context value
  const contextValue = {
    // C-Cube Wallet
    cCubeWalletConnected,
    cCubeWalletData,
    connectCCubeWallet,
    disconnectCCubeWallet,
    
    // External Wallet
    externalWalletConnected,
    externalWalletData,
    connectExternalWallet,
    disconnectExternalWallet,
    
    // General
    currentWalletType,
    showWalletModal,
    setShowWalletModal,
    gasPrice,
    setGasPrice,
    isMainnet,
    setIsMainnet,
    
    // Utility Functions
    disconnectAllWallets,
    getCurrentWallet,
    isAnyWalletConnected,
    getWalletDisplayName,
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;