import React, { useContext, useState, useEffect } from 'react';
import AppContext from '../context/AppContext';
import { ethers } from 'ethers';
import CyberSecurityHeader from '../components/CyberSecurityHeader';
import networks from '../utils/networks';

// Import all the extracted components
import {
  ConsoleFrame,
  WalletContainer,
  Card,
  Title,
  ErrorMessage,
  SuccessMessage
} from '../components/wallet/WalletStyles';

import WalletInfoDisplay from '../components/wallet/WalletInfoDisplay';
import WalletControlsPanel from '../components/wallet/WalletControlsPanel';
import TabNavigation from '../components/wallet/TabNavigation';
import WalletInfoTab from '../components/wallet/WalletInfoTab';
import DecryptWalletTab from '../components/wallet/DecryptWalletTab';
import { ExportKeyTab, RecoveryPhraseTab } from '../components/wallet/ExportKeyTab';
import TransactionSigningTab from '../components/wallet/TransactionSigningTab';
import WalletCreationTab from '../components/wallet/WalletCreationTab';
import TokenManagementTab from '../components/wallet/TokenManagementTab';
import NoWalletView from '../components/wallet/NoWalletView';

const ColdWallet = () => {
  const { 
    activeWallet, 
    wallets, 
    setActiveWallet, 
    isWalletEncrypted, 
    decryptWallet, 
    signTransaction, 
    createEthereumWallet, 
    importWalletFromPrivateKey, 
    importWalletFromMnemonic,
    selectedNetwork,
    setSelectedNetwork,
    getWalletsForCurrentNetwork,
    // Network status
    networkStatus,
    // Token management
    userTokens,
    setUserTokens,
    addToken,
    removeToken,
    getTokensForNetwork,
    getTokenByAddress
  } = useContext(AppContext);
  
  // Filter wallets to show only those for the current network
  const networkWallets = selectedNetwork.isMultiChainView
    ? wallets.filter(wallet => wallet.isMultiChain === true)
    : wallets.filter(wallet => wallet.networkId === selectedNetwork.id || wallet.isMultiChain === true);
  
  // Auto-set isMultiChain to true when in multi-chain view
  useEffect(() => {
    if (selectedNetwork.isMultiChainView) {
      setIsMultiChain(true);
      setTxNetwork(null);
    } else {
      setTxNetwork(selectedNetwork);
      setSelectedWalletNetwork(selectedNetwork);
    }
  }, [selectedNetwork]);
  
  // Initialize selectedWalletNetwork when activeWallet changes
  useEffect(() => {
    if (activeWallet) {
      if (!activeWallet.isMultiChain) {
        const walletNetwork = networks.find(n => n.id === activeWallet.networkId);
        setSelectedWalletNetwork(walletNetwork || selectedNetwork);
      } else {
        setSelectedWalletNetwork(null);
      }
      setSelectedAsset('native');
      
      if (activeWallet.isMultiChain) {
        const multiChainNetwork = networks.find(n => n.isMultiChainView);
        if (multiChainNetwork && !selectedNetwork.isMultiChainView) {
          setSelectedNetwork(multiChainNetwork);
        }
      } else if (!selectedNetwork.isMultiChainView && activeWallet.networkId !== selectedNetwork.id) {
        const walletNetwork = networks.find(n => n.id === activeWallet.networkId);
        if (walletNetwork) {
          setSelectedNetwork(walletNetwork);
        }
      }
    }
  }, [activeWallet, networks, selectedNetwork, setSelectedNetwork]);
  
  // Update active wallet when selected network changes
  useEffect(() => {
    const walletsForNetwork = selectedNetwork.isMultiChainView
      ? wallets.filter(wallet => wallet.isMultiChain === true)
      : wallets.filter(wallet => wallet.networkId === selectedNetwork.id || wallet.isMultiChain === true);
    
    const isActiveWalletValid = activeWallet && (
      selectedNetwork.isMultiChainView ? activeWallet.isMultiChain : 
      (activeWallet.networkId === selectedNetwork.id || activeWallet.isMultiChain)
    );
    
    if (walletsForNetwork.length > 0 && !isActiveWalletValid) {
      setActiveWallet(walletsForNetwork[0]);
      setDecryptedWallet(null);
      setShowPrivateKey(false);
      setPassword('');
    }
  }, [selectedNetwork, wallets, activeWallet, setActiveWallet]);

  // Clear transaction state when activeWallet changes (including when wallet is removed)
  useEffect(() => {
    // Clear all transaction-related state when wallet changes
    setSignedTransaction('');
    setTxRecipient('');
    setTxAmount('');
    setTxData('');
    setTokenAddress('');
    setTokenSymbol('');
    setTokenDecimals(18);
    setPassword('');
    setDecryptedWallet(null);
    setMnemonic('');
    setError('');
    setSuccess('');
  }, [activeWallet]);

  // State variables
  const [activeTab, setActiveTab] = useState('info');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [password, setPassword] = useState('');
  const [decryptedWallet, setDecryptedWallet] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [newWalletPassword, setNewWalletPassword] = useState('');
  const [confirmNewWalletPassword, setConfirmNewWalletPassword] = useState('');
  const [usePasswordForNewWallet, setUsePasswordForNewWallet] = useState(true);
  const [isMultiChain, setIsMultiChain] = useState(selectedNetwork?.isMultiChainView || false);
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [importType, setImportType] = useState('privateKey');
  
  // Transaction signing form state
  const [txRecipient, setTxRecipient] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txData, setTxData] = useState('');
  const [txType, setTxType] = useState('native');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [txNetwork, setTxNetwork] = useState(null);
  const [signedTransaction, setSignedTransaction] = useState('');
  const [selectedWalletNetwork, setSelectedWalletNetwork] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState('native');

  // Handler functions
  const handleDecryptWallet = async () => {
    if (!activeWallet) return;
    
    setError('');
    setLoading(true);
    
    try {
      const wallet = decryptWallet(activeWallet, password);
      setDecryptedWallet(wallet);
      if (wallet.mnemonic) {
        setMnemonic(wallet.mnemonic);
      }
      setSuccess('Wallet successfully decrypted');
    } catch (err) {
      setError(`Failed to decrypt wallet: ${err.message}`);
      setDecryptedWallet(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (usePasswordForNewWallet) {
        if (newWalletPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        if (newWalletPassword !== confirmNewWalletPassword) {
          throw new Error('Passwords do not match');
        }
      }
      
      const wallet = await createEthereumWallet(
        usePasswordForNewWallet ? newWalletPassword : null,
        selectedNetwork.id,
        isMultiChain
      );
      setSuccess('New wallet created successfully');
      setNewWalletPassword('');
      setConfirmNewWalletPassword('');
      
      if (wallet.mnemonic) {
        setMnemonic(wallet.mnemonic);
        setActiveTab('recovery');
        setShowMnemonic(true);
      } else {
        setActiveTab('info');
      }
    } catch (err) {
      setError(`Failed to create wallet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleImportWallet = async () => {
    setError('');
    
    if (usePasswordForNewWallet) {
      if (newWalletPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (newWalletPassword !== confirmNewWalletPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    
    if (importType === 'privateKey') {
      if (!privateKey) {
        setError('Please enter a private key');
        return;
      }
      
      try {
        const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        new ethers.Wallet(formattedKey);
      } catch (err) {
        setError('Invalid private key format');
        return;
      }
    }
    
    if (importType === 'mnemonic') {
      if (!mnemonic) {
        setError('Please enter a recovery phrase');
        return;
      }
      
      try {
        const words = mnemonic.trim().split(/\s+/);
        if (words.length !== 12 && words.length !== 24) {
          setError('Recovery phrase must be 12 or 24 words');
          return;
        }
        ethers.Wallet.fromMnemonic(mnemonic.trim());
      } catch (err) {
        setError('Invalid recovery phrase');
        return;
      }
    }
    
    setLoading(true);
    try {
      if (importType === 'privateKey') {
        await importWalletFromPrivateKey(
          privateKey, 
          usePasswordForNewWallet ? newWalletPassword : null,
          selectedNetwork.id,
          isMultiChain
        );
      } else {
        await importWalletFromMnemonic(
          mnemonic.trim(), 
          usePasswordForNewWallet ? newWalletPassword : null,
          selectedNetwork.id,
          isMultiChain
        );
      }
      
      setSuccess('Wallet imported successfully');
      setMnemonic('');
      setActiveTab('info');
    } catch (err) {
      setError(`Failed to import wallet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignTransaction = async () => {
    if (!activeWallet) return;
    
    if (selectedNetwork.isMultiChainView && !txNetwork?.chainId) {
      setError('Please select a specific network for this transaction');
      return;
    }
    
    setError('');
    setLoading(true);
    setSignedTransaction('');
    
    try {
      if (!ethers.isAddress(txRecipient)) {
        throw new Error('Invalid recipient address');
      }
      
      let txObject;
      
      if (txType === 'native') {
        const amountInWei = ethers.parseEther(txAmount.toString());
        
        txObject = {
          to: txRecipient,
          value: amountInWei,
          data: txData || '0x',
          gasLimit: 21000,
          gasPrice: ethers.parseUnits('30', 'gwei'),
          chainId: txNetwork.chainId,
          nonce: 0,
        };
      } else {
        if (!ethers.isAddress(tokenAddress)) {
          throw new Error('Invalid token contract address');
        }
        
        const transferFunctionSignature = '0xa9059cbb';
        const encodedRecipient = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [txRecipient]).slice(2);
        const tokenAmount = ethers.parseUnits(txAmount.toString(), tokenDecimals);
        const encodedAmount = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [tokenAmount]).slice(2);
        const data = `${transferFunctionSignature}${encodedRecipient}${encodedAmount}`;
        
        txObject = {
          to: tokenAddress,
          value: 0,
          data: '0x' + data + (txData ? txData.replace(/^0x/, '') : ''),
          gasLimit: 100000,
          gasPrice: ethers.parseUnits('30', 'gwei'),
          chainId: txNetwork.chainId,
          nonce: 0,
        };
      }
      
      if (isWalletEncrypted && !decryptedWallet) {
        await handleDecryptWallet();
      }
      
      const walletToUse = decryptedWallet || activeWallet;
      const { signedTx } = await signTransaction(walletToUse, txObject, isWalletEncrypted ? password : null);
      
      setSignedTransaction(signedTx);
      
      if (txType === 'native') {
        setSuccess(`${txNetwork.symbol} transaction successfully signed on ${txNetwork.name} network`);
      } else {
        const tokenStandard = txNetwork.id === 'bsc' ? 'BEP-20' : 'ERC-20';
        setSuccess(`${tokenSymbol || tokenStandard + ' Token'} transaction successfully signed on ${txNetwork.name} network`);
      }
    } catch (err) {
      setError(`Failed to sign transaction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchWallet = () => {
    const currentIndex = networkWallets.findIndex(w => w.id === activeWallet.id);
    const nextIndex = (currentIndex + 1) % networkWallets.length;
    setActiveWallet(networkWallets[nextIndex]);
    setDecryptedWallet(null);
    setShowPrivateKey(false);
    setPassword('');
  };

  // If no wallet is available, show the NoWalletView
  if (!activeWallet) {
    return (
      <NoWalletView
        selectedNetwork={selectedNetwork}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        usePasswordForNewWallet={usePasswordForNewWallet}
        setUsePasswordForNewWallet={setUsePasswordForNewWallet}
        isMultiChain={isMultiChain}
        setIsMultiChain={setIsMultiChain}
        newWalletPassword={newWalletPassword}
        setNewWalletPassword={setNewWalletPassword}
        confirmNewWalletPassword={confirmNewWalletPassword}
        setConfirmNewWalletPassword={setConfirmNewWalletPassword}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        mnemonic={mnemonic}
        setMnemonic={setMnemonic}
        importType={importType}
        setImportType={setImportType}
        handleCreateWallet={handleCreateWallet}
        handleImportWallet={handleImportWallet}
        loading={loading}
      />
    );
  }

  // Main wallet view with all tabs
  return (
    <ConsoleFrame>
      <WalletContainer>
        <CyberSecurityHeader 
          title="C-CUBE" 
          subtitle="Offline cryptocurrency storage with enhanced security protocols"
        />
        
        <Card>
          <Title>Wallet Control Panel</Title>
          
          <WalletInfoDisplay 
            activeWallet={activeWallet}
            selectedNetwork={selectedNetwork}
          />
          
          <WalletControlsPanel
            networkWallets={networkWallets}
            activeWallet={activeWallet}
            isWalletEncrypted={isWalletEncrypted}
            decryptedWallet={decryptedWallet}
            onSwitchWallet={handleSwitchWallet}
            onSetActiveTab={setActiveTab}
          />
          
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isWalletEncrypted={isWalletEncrypted}
          />
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          {activeTab === 'info' && (
            <WalletInfoTab
              activeWallet={activeWallet}
              selectedNetwork={selectedNetwork}
              selectedWalletNetwork={selectedWalletNetwork}
              setSelectedWalletNetwork={setSelectedWalletNetwork}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              networks={networks}
              getTokensForNetwork={getTokensForNetwork}
              isWalletEncrypted={isWalletEncrypted}
              setSuccess={setSuccess}
              addToken={addToken}
            />
          )}
          
          {activeTab === 'decrypt' && (
            <DecryptWalletTab
              isWalletEncrypted={isWalletEncrypted}
              decryptedWallet={decryptedWallet}
              password={password}
              setPassword={setPassword}
              handleDecryptWallet={handleDecryptWallet}
              loading={loading}
              setDecryptedWallet={setDecryptedWallet}
              setSuccess={setSuccess}
            />
          )}
          
          {activeTab === 'export' && (
            <ExportKeyTab
              showPrivateKey={showPrivateKey}
              setShowPrivateKey={setShowPrivateKey}
              isWalletEncrypted={isWalletEncrypted}
              decryptedWallet={decryptedWallet}
              activeWallet={activeWallet}
              mnemonic={mnemonic}
              onSetActiveTab={setActiveTab}
            />
          )}
          
          {activeTab === 'recovery' && (
            <RecoveryPhraseTab
              showMnemonic={showMnemonic}
              setShowMnemonic={setShowMnemonic}
              isWalletEncrypted={isWalletEncrypted}
              decryptedWallet={decryptedWallet}
              activeWallet={activeWallet}
              mnemonic={mnemonic}
              onSetActiveTab={setActiveTab}
            />
          )}
          
          {activeTab === 'sign' && (
            <TransactionSigningTab
              selectedNetwork={selectedNetwork}
              activeWallet={activeWallet}
              networks={networks}
              wallets={wallets}
              txNetwork={txNetwork}
              setTxNetwork={setTxNetwork}
              txType={txType}
              setTxType={setTxType}
              txRecipient={txRecipient}
              setTxRecipient={setTxRecipient}
              txAmount={txAmount}
              setTxAmount={setTxAmount}
              txData={txData}
              setTxData={setTxData}
              tokenAddress={tokenAddress}
              setTokenAddress={setTokenAddress}
              tokenSymbol={tokenSymbol}
              setTokenSymbol={setTokenSymbol}
              tokenDecimals={tokenDecimals}
              setTokenDecimals={setTokenDecimals}
              password={password}
              setPassword={setPassword}
              signedTransaction={signedTransaction}
              handleSignTransaction={handleSignTransaction}
              loading={loading}
              isWalletEncrypted={isWalletEncrypted}
              decryptedWallet={decryptedWallet}
              userTokens={userTokens}
              getTokensForNetwork={getTokensForNetwork}
              addToken={addToken}
              removeToken={removeToken}
              networkStatus={networkStatus}
              setSuccess={setSuccess}
              setError={setError}
            />
          )}
          
          {activeTab === 'tokens' && (
            <TokenManagementTab
              userTokens={userTokens}
              setUserTokens={setUserTokens}
              networks={networks}
              removeToken={removeToken}
            />
          )}
          
          {activeTab === 'createWallet' && (
            <WalletCreationTab
              importType={importType}
              setImportType={setImportType}
              usePasswordForNewWallet={usePasswordForNewWallet}
              setUsePasswordForNewWallet={setUsePasswordForNewWallet}
              isMultiChain={isMultiChain}
              setIsMultiChain={setIsMultiChain}
              selectedNetwork={selectedNetwork}
              newWalletPassword={newWalletPassword}
              setNewWalletPassword={setNewWalletPassword}
              confirmNewWalletPassword={confirmNewWalletPassword}
              setConfirmNewWalletPassword={setConfirmNewWalletPassword}
              privateKey={privateKey}
              setPrivateKey={setPrivateKey}
              mnemonic={mnemonic}
              setMnemonic={setMnemonic}
              handleCreateWallet={handleCreateWallet}
              handleImportWallet={handleImportWallet}
              loading={loading}
            />
          )}
        </Card>
      </WalletContainer>
    </ConsoleFrame>
  );
};

export default ColdWallet;
