import React, { createContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import networks, { getNetworkById } from '../utils/networks.js';
import TokenStorage from '../utils/TokenStorage.js';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeWallet, setActiveWallet] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [isWalletEncrypted, setIsWalletEncrypted] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    lastChecked: new Date()
  });
  const [userTokens, setUserTokens] = useState([]); // Store user's tokens

  // Load wallets and tokens from storage on app init
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load wallets
        const savedWallets = localStorage.getItem('wallets');
        if (savedWallets) {
          const parsedWallets = JSON.parse(savedWallets);
          
          // Add networkId to wallets if missing (backward compatibility)
          const updatedWallets = parsedWallets.map(wallet => {
            if (!wallet.networkId) {
              return { ...wallet, networkId: networks[0].id };
            }
            return wallet;
          });
          
          setWallets(updatedWallets);
          
          // Set the encryption status
          setIsWalletEncrypted(updatedWallets.length > 0 && updatedWallets[0].encryptedPrivateKey !== undefined);
          
          // Get saved selected network or default to first network
          const savedNetworkId = localStorage.getItem('selectedNetwork');
          if (savedNetworkId) {
            const network = getNetworkById(savedNetworkId);
            if (network) {
              setSelectedNetwork(network);
              
              // Find wallets for this network
              const networkWallets = updatedWallets.filter(wallet => wallet.networkId === savedNetworkId);
              
              // Set the active wallet to the first one for the selected network if available
              if (networkWallets.length > 0) {
                setActiveWallet(networkWallets[0]);
              } else if (updatedWallets.length > 0) {
                setActiveWallet(updatedWallets[0]);
              }
            }
          } else if (updatedWallets.length > 0) {
            setActiveWallet(updatedWallets[0]);
          }
        }
      } catch (error) {
        console.error('Error loading wallets from localStorage:', error);
      }
      
      // Load tokens using the TokenStorage utility
      try {
        const tokens = await TokenStorage.loadTokens();
        if (tokens && tokens.length > 0) {
          setUserTokens(tokens);
        }
      } catch (err) {
        console.error('Error loading tokens:', err);
        
        // Fall back to localStorage if TokenStorage fails
        try {
          const savedTokens = localStorage.getItem('userTokens');
          if (savedTokens) {
            setUserTokens(JSON.parse(savedTokens));
          }
        } catch (localStorageErr) {
          console.error('Error parsing saved tokens from localStorage:', localStorageErr);
        }
      }
    };

    loadData();
  }, []);

  // Save wallets to localStorage when they change
  useEffect(() => {
    if (wallets.length > 0) {
      localStorage.setItem('wallets', JSON.stringify(wallets));
    }
  }, [wallets]);
  
  // Save tokens to persistent storage when they change
  useEffect(() => {
    const saveTokens = async () => {
      try {
        await TokenStorage.saveTokens(userTokens);
      } catch (error) {
        console.error('Failed to save tokens using TokenStorage:', error);
        // Fall back to localStorage
        localStorage.setItem('userTokens', JSON.stringify(userTokens));
      }
    };
    
    if (userTokens.length > 0) {
      saveTokens();
    }
  }, [userTokens]);
  
  // Save selected network to localStorage when it changes
  useEffect(() => {
    if (selectedNetwork) {
      localStorage.setItem('selectedNetwork', selectedNetwork.id);
    }
  }, [selectedNetwork]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus({
        isOnline: true,
        lastChecked: new Date()
      });
    };

    const handleOffline = () => {
      setNetworkStatus({
        isOnline: false,
        lastChecked: new Date()
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper function to get the next available wallet number
  const getNextWalletNumber = (isMultiChain, networkName = null) => {
    const pattern = isMultiChain 
      ? /^(Multi-Chain Wallet|Imported Multi-Chain Wallet) (\d+)$/
      : new RegExp(`^(${networkName} Wallet|Imported ${networkName} Wallet) (\\d+)$`);
    
    const existingNumbers = wallets
      .map(wallet => {
        const match = wallet.name.match(pattern);
        return match ? parseInt(match[2]) : 0;
      })
      .filter(num => num > 0);
    
    if (existingNumbers.length === 0) return 1;
    
    // Find the first gap in the sequence or return the next number
    const sortedNumbers = existingNumbers.sort((a, b) => a - b);
    for (let i = 1; i <= sortedNumbers.length; i++) {
      if (!sortedNumbers.includes(i)) {
        return i;
      }
    }
    return sortedNumbers.length + 1;
  };

  // Create a new wallet for the selected network
  const createEthereumWallet = async (password = null, networkId = null, isMultiChain = false) => {
    try {
      // Generate a new random wallet
      const wallet = ethers.Wallet.createRandom();
      
      // Extract wallet details
      const privateKey = wallet.privateKey;
      const publicKey = wallet.publicKey;
      const address = wallet.address;
      const mnemonic = wallet.mnemonic.phrase;
      
      // Use provided networkId or default to currently selected network
      const network = networkId ? getNetworkById(networkId) : selectedNetwork;
      
      const walletNumber = getNextWalletNumber(isMultiChain, network.name);
      
      let newWallet = {
        id: Date.now().toString(),
        name: isMultiChain ? `Multi-Chain Wallet ${walletNumber}` : `${network.name} Wallet ${walletNumber}`,
        type: 'ethereum',
        address,
        publicKey,
        mnemonic,
        networkId: network.id,
        isMultiChain: !!isMultiChain,
        createdAt: new Date().toISOString(),
      };

      // If password provided, encrypt the private key
      if (password) {
        const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, password).toString();
        newWallet.encryptedPrivateKey = encryptedPrivateKey;
        setIsWalletEncrypted(true);
      } else {
        newWallet.privateKey = privateKey;
        setIsWalletEncrypted(false);
      }

      // Add the new wallet
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      setActiveWallet(newWallet);
      return newWallet;
    } catch (error) {
      console.error('Error creating Ethereum wallet:', error);
      throw error;
    }
  };

  // Import an existing wallet from private key
  const importWalletFromPrivateKey = async (privateKey, password = null, networkId = null, isMultiChain = false) => {
    try {
      // Create wallet instance from private key
      const wallet = new ethers.Wallet(privateKey);
      
      // Use provided networkId or default to currently selected network
      const network = networkId ? getNetworkById(networkId) : selectedNetwork;
      
      const walletNumber = getNextWalletNumber(isMultiChain, network.name);
      
      let newWallet = {
        id: Date.now().toString(),
        name: isMultiChain ? `Imported Multi-Chain Wallet ${walletNumber}` : `Imported ${network.name} Wallet ${walletNumber}`,
        type: 'ethereum',
        address: wallet.address,
        publicKey: wallet.publicKey,
        networkId: network.id,
        isMultiChain: !!isMultiChain,
        createdAt: new Date().toISOString(),
      };

      // If password provided, encrypt the private key
      if (password) {
        const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, password).toString();
        newWallet.encryptedPrivateKey = encryptedPrivateKey;
        setIsWalletEncrypted(true);
      } else {
        newWallet.privateKey = privateKey;
        setIsWalletEncrypted(false);
      }

      // Add the new wallet
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      setActiveWallet(newWallet);
      return newWallet;
    } catch (error) {
      console.error('Error importing wallet from private key:', error);
      throw error;
    }
  };
  
  // Import an existing wallet from mnemonic phrase
  const importWalletFromMnemonic = async (mnemonic, password = null, networkId = null, isMultiChain = false) => {
    try {
      // Create wallet instance from mnemonic
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);
      
      // Use provided networkId or default to currently selected network
      const network = networkId ? getNetworkById(networkId) : selectedNetwork;
      
      const walletNumber = getNextWalletNumber(isMultiChain, network.name);
      
      let newWallet = {
        id: Date.now().toString(),
        name: isMultiChain ? `Imported Multi-Chain Wallet ${walletNumber}` : `Imported ${network.name} Wallet ${walletNumber}`,
        type: 'ethereum',
        address: wallet.address,
        publicKey: wallet.publicKey,
        mnemonic,
        networkId: network.id,
        isMultiChain: !!isMultiChain,
        createdAt: new Date().toISOString(),
      };

      // If password provided, encrypt the private key
      if (password) {
        const encryptedPrivateKey = CryptoJS.AES.encrypt(wallet.privateKey, password).toString();
        const encryptedMnemonic = CryptoJS.AES.encrypt(mnemonic, password).toString();
        newWallet.encryptedPrivateKey = encryptedPrivateKey;
        newWallet.encryptedMnemonic = encryptedMnemonic;
        setIsWalletEncrypted(true);
      } else {
        newWallet.privateKey = wallet.privateKey;
        setIsWalletEncrypted(false);
      }

      // Add the new wallet
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      setActiveWallet(newWallet);
      return newWallet;
    } catch (error) {
      console.error('Error importing wallet from mnemonic:', error);
      throw error;
    }
  };

  // Decrypt a wallet with password
  const decryptWallet = (wallet, password) => {
    try {
      if (!wallet.encryptedPrivateKey) {
        throw new Error('This wallet is not encrypted');
      }
      
      const decryptedBytes = CryptoJS.AES.decrypt(wallet.encryptedPrivateKey, password);
      const privateKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      // Verify that the private key is valid
      if (!privateKey || privateKey.length !== 66 || !privateKey.startsWith('0x')) {
        throw new Error('Invalid password or corrupted wallet data');
      }
      
      // Decrypt mnemonic if available
      let mnemonic = null;
      if (wallet.encryptedMnemonic) {
        const decryptedMnemonicBytes = CryptoJS.AES.decrypt(wallet.encryptedMnemonic, password);
        mnemonic = decryptedMnemonicBytes.toString(CryptoJS.enc.Utf8);
      }
      
      // Return a temporary decrypted wallet (never stored)
      return {
        ...wallet,
        privateKey,
        mnemonic,
        tempDecrypted: true
      };
    } catch (error) {
      console.error('Error decrypting wallet:', error);
      throw error;
    }
  };

  // Sign an Ethereum transaction
  const signTransaction = async (wallet, txData, password = null, metadata = {}) => {
    try {
      let privateKey;
      
      // If the wallet is encrypted, decrypt it first
      if (wallet.encryptedPrivateKey) {
        if (!password) {
          throw new Error('Password required to decrypt wallet');
        }
        const decryptedWallet = decryptWallet(wallet, password);
        privateKey = decryptedWallet.privateKey;
      } else {
        privateKey = wallet.privateKey;
      }
      
      // Get the network for the wallet
      const network = getNetworkById(wallet.networkId) || selectedNetwork;
      
      // Create a wallet instance from the private key
      const signingWallet = new ethers.Wallet(privateKey);
      
      // Sign the transaction
      const signedTx = await signingWallet.signTransaction(txData);
      
      // Add to transaction history
      const txRecord = {
        id: Date.now().toString(),
        walletId: wallet.id,
        networkId: wallet.networkId,
        txHash: ethers.keccak256(signedTx),
        signedTx,
        data: txData,
        status: 'signed',
        createdAt: new Date().toISOString(),
        // Transaction details from metadata
        recipient: metadata.recipient || txData.to,
        amount: metadata.amount || '0',
        tokenSymbol: metadata.tokenSymbol || (metadata.txType === 'native' ? metadata.networkSymbol : 'Token'),
        txType: metadata.txType || 'unknown',
        networkName: metadata.networkName || 'Unknown',
        explorerUrl: metadata.explorerUrl || null,
      };
      
      setTransactions([...transactions, txRecord]);
      
      return {
        signedTx,
        txRecord
      };
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  };

  // Remove a wallet from the wallet list
  const removeWallet = (walletToRemove) => {
    if (!walletToRemove) {
      throw new Error('No wallet specified for removal');
    }

    // Filter out the wallet to remove (compare by address and networkId)
    const updatedWallets = wallets.filter(wallet => {
      // For multi-chain wallets, compare by address only
      if (wallet.isMultiChain && walletToRemove.isMultiChain) {
        return wallet.address.toLowerCase() !== walletToRemove.address.toLowerCase();
      }
      // For network-specific wallets, compare by both address and networkId
      return !(wallet.address.toLowerCase() === walletToRemove.address.toLowerCase() && 
               wallet.networkId === walletToRemove.networkId);
    });

    setWallets(updatedWallets);

    // If the removed wallet was the active wallet, set a new active wallet
    if (activeWallet && 
        activeWallet.address.toLowerCase() === walletToRemove.address.toLowerCase() &&
        (!activeWallet.networkId || activeWallet.networkId === walletToRemove.networkId)) {
      
      // Find appropriate replacement wallet for current network
      const networkWallets = selectedNetwork.isMultiChainView
        ? updatedWallets.filter(wallet => wallet.isMultiChain === true)
        : updatedWallets.filter(wallet => wallet.networkId === selectedNetwork.id || wallet.isMultiChain === true);
      
      if (networkWallets.length > 0) {
        setActiveWallet(networkWallets[0]);
      } else {
        setActiveWallet(null);
      }
    }

    // Update localStorage
    if (updatedWallets.length > 0) {
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
    } else {
      localStorage.removeItem('wallets');
    }

    return true;
  };

  // Get wallets for the currently selected network (including multi-chain wallets)
  const getWalletsForCurrentNetwork = () => {
    // If in multi-chain view, show only multi-chain wallets
    if (selectedNetwork.isMultiChainView) {
      return wallets.filter(wallet => wallet.isMultiChain === true);
    }
    // Otherwise, show network-specific wallets plus multi-chain wallets
    return wallets.filter(wallet => wallet.networkId === selectedNetwork.id || wallet.isMultiChain === true);
  };
  
  // Switch active network
  const switchNetwork = (networkId) => {
    const network = getNetworkById(networkId);
    if (network) {
      setSelectedNetwork(network);
      
      let networkWallets;
      
      // If switching to multi-chain view, only show multi-chain wallets
      if (network.isMultiChainView) {
        networkWallets = wallets.filter(wallet => wallet.isMultiChain === true);
      } else {
        // Otherwise show both network-specific and multi-chain wallets
        networkWallets = wallets.filter(wallet => wallet.networkId === networkId || wallet.isMultiChain === true);
      }
      
      // If the current active wallet is multi-chain, keep it selected as long as it's still in the view
      if (activeWallet && activeWallet.isMultiChain && 
          (network.isMultiChainView || !network.isMultiChainView)) {
        // Keep the multi-chain wallet selected
      } 
      // Otherwise, set first wallet of the selected network as active, if available
      else if (networkWallets.length > 0) {
        setActiveWallet(networkWallets[0]);
      } else {
        setActiveWallet(null);
      }
    }
  };

  // Token management functions
  const addToken = (token) => {
    // Validate token object
    if (!token.address || !token.symbol || !token.networkId) {
      throw new Error('Invalid token data. Address, symbol, and networkId are required.');
    }
    
    // Check if token already exists
    const existingToken = userTokens.find(t => 
      t.address.toLowerCase() === token.address.toLowerCase() && 
      t.networkId === token.networkId
    );
    
    if (existingToken) {
      // Update existing token
      const updatedTokens = userTokens.map(t => 
        (t.address.toLowerCase() === token.address.toLowerCase() && t.networkId === token.networkId) 
          ? {...t, ...token} 
          : t
      );
      setUserTokens(updatedTokens);
      return updatedTokens;
    } else {
      // Add new token
      const newToken = {
        ...token,
        id: Date.now().toString(), // Generate unique ID
        dateAdded: new Date().toISOString()
      };
      const updatedTokens = [...userTokens, newToken];
      setUserTokens(updatedTokens);
      return updatedTokens;
    }
  };
  
  const removeToken = (tokenId) => {
    const updatedTokens = userTokens.filter(token => token.id !== tokenId);
    setUserTokens(updatedTokens);
    return updatedTokens;
  };
  
  const getTokensForNetwork = (networkId) => {
    return userTokens.filter(token => token.networkId === networkId);
  };
  
  const getTokenByAddress = (address, networkId) => {
    return userTokens.find(token => 
      token.address.toLowerCase() === address.toLowerCase() && 
      token.networkId === networkId
    );
  };

  return (
    <AppContext.Provider 
      value={{
        activeWallet,
        setActiveWallet,
        wallets,
        setWallets,
        isWalletEncrypted,
        encryptionPassword,
        setEncryptionPassword,
        transactions,
        setTransactions,
        networkStatus,
        // Network related
        selectedNetwork,
        setSelectedNetwork,
        switchNetwork,
        getWalletsForCurrentNetwork,
        networks,
        // Wallet functions
        createEthereumWallet,
        importWalletFromPrivateKey,
        importWalletFromMnemonic,
        removeWallet,
        decryptWallet,
        signTransaction,
        // Token management
        userTokens,
        setUserTokens,
        addToken,
        removeToken,
        getTokensForNetwork,
        getTokenByAddress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
