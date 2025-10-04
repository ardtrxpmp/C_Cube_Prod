import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  FormGroup,
  Label,
  InputWrapper,
  Input,
  Button
} from './WalletStyles';

const WalletInfoTab = ({
  activeWallet,
  selectedNetwork,
  selectedWalletNetwork,
  setSelectedWalletNetwork,
  selectedAsset,
  setSelectedAsset,
  networks,
  getTokensForNetwork,
  isWalletEncrypted,
  setSuccess,
  addToken
}) => {
  const [nativeBalance, setNativeBalance] = useState('0.00');
  const [tokenBalance, setTokenBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  
  // Token addition form state
  const [showAddToken, setShowAddToken] = useState(false);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenSymbol, setNewTokenSymbol] = useState('');
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenDecimals, setNewTokenDecimals] = useState('18');
  const [isAddingToken, setIsAddingToken] = useState(false);

  // Fetch balance from blockchain
  const fetchBalance = async () => {
    if (!activeWallet || !activeWallet.address) {
      console.log('No wallet or address available');
      return;
    }
    
    const currentNetwork = selectedWalletNetwork || selectedNetwork;
    if (!currentNetwork.rpcUrl || currentNetwork.rpcUrl.includes('your-infura-key')) {
      console.log('No valid RPC URL for network:', currentNetwork.name);
      setNativeBalance('RPC Error');
      setTokenBalance('RPC Error');
      return;
    }

    console.log('Fetching balance for:', activeWallet.address, 'on network:', currentNetwork.name);
    setIsLoading(true);
    
    try {
      const provider = new ethers.JsonRpcProvider(currentNetwork.rpcUrl);
      
      if (selectedAsset === 'native') {
        console.log('Fetching native balance...');
        // Fetch native token balance
        const balance = await provider.getBalance(activeWallet.address);
        const formattedBalance = ethers.formatEther(balance);
        console.log('Native balance:', formattedBalance);
        setNativeBalance(parseFloat(formattedBalance).toFixed(4));
      } else if (selectedAsset.startsWith('token-')) {
        console.log('Fetching token balance...');
        // Fetch ERC-20/BEP-20 token balance
        const tokenId = selectedAsset.replace('token-', '');
        const networkTokens = getTokensForNetwork(currentNetwork.id);
        const token = networkTokens.find(t => t.id === tokenId);
        
        if (token && token.address) {
          const tokenContract = new ethers.Contract(
            token.address,
            ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
            provider
          );
          
          const balance = await tokenContract.balanceOf(activeWallet.address);
          const decimals = await tokenContract.decimals();
          const formattedBalance = ethers.formatUnits(balance, decimals);
          console.log('Token balance:', formattedBalance);
          setTokenBalance(parseFloat(formattedBalance).toFixed(4));
        } else {
          console.log('Token not found:', tokenId);
          setTokenBalance('Token Error');
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      if (selectedAsset === 'native') {
        setNativeBalance('Network Error');
      } else {
        setTokenBalance('Network Error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balance when wallet, network, or asset changes
  useEffect(() => {
    fetchBalance();
  }, [activeWallet, selectedWalletNetwork, selectedNetwork, selectedAsset]);

  // Add new token function
  const handleAddToken = async () => {
    if (!newTokenAddress || !newTokenSymbol) {
      setSuccess('Please enter token address and symbol');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    const currentNetwork = selectedWalletNetwork || selectedNetwork;
    if (currentNetwork.isMultiChainView) {
      setSuccess('Please select a specific network to add tokens');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    setIsAddingToken(true);
    try {
      await addToken({
        address: newTokenAddress.trim(),
        symbol: newTokenSymbol.trim().toUpperCase(),
        name: newTokenName.trim() || newTokenSymbol.trim(),
        decimals: parseInt(newTokenDecimals),
        networkId: currentNetwork.id
      });
      
      setSuccess(`${newTokenSymbol.toUpperCase()} token added successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Reset form
      setNewTokenAddress('');
      setNewTokenSymbol('');
      setNewTokenName('');
      setNewTokenDecimals('18');
      setShowAddToken(false);
      
    } catch (error) {
      setSuccess(`Error adding token: ${error.message}`);
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setIsAddingToken(false);
    }
  };

  return (
    <div>
      <FormGroup>
        <Label>Wallet Type</Label>
        {/* Show network dropdown ONLY if we're in multi-chain view AND the wallet is multi-chain */}
        {selectedNetwork.isMultiChainView && activeWallet.isMultiChain ? (
          <select
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#00cc33',
              border: '1px solid #00cc33',
              borderRadius: '2px',
              fontFamily: 'monospace',
              marginBottom: '1rem'
            }}
            onChange={(e) => {
              const networkId = e.target.value;
              const network = networks.find(n => n.id === networkId);
              setSelectedWalletNetwork(network);
              setSelectedAsset('native'); // Reset to native asset when changing networks
            }}
            value={selectedWalletNetwork?.id || ''}
          >
            <option value="">-- Multi-Chain Wallet --</option>
            {networks
              .filter(n => !n.isMultiChainView)
              .map(network => (
                <option 
                  key={network.id} 
                  value={network.id}
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
                >
                  {network.name} ({network.symbol})
                </option>
              ))}
          </select>
        ) : (
          /* In specific network view or for single-network wallets, show static text */
          <InputWrapper>
            <Input 
              value={
                activeWallet.isMultiChain 
                  ? `Multi-Chain Wallet on ${selectedNetwork.name}`
                  : `${selectedNetwork.name} (${selectedNetwork.symbol})`
              } 
              readOnly 
            />
          </InputWrapper>
        )}
      </FormGroup>
      
      <FormGroup>
        <Label>Asset</Label>
        <select
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#00cc33',
            border: '1px solid #00cc33',
            borderRadius: '2px',
            fontFamily: 'monospace',
            marginBottom: '1rem'
          }}
          onChange={(e) => setSelectedAsset(e.target.value)}
          value={selectedAsset}
        >
          {/* Native coin option */}
          <option value="native">
            {selectedWalletNetwork 
              ? `${selectedWalletNetwork.symbol} (Native Coin)` 
              : activeWallet.isMultiChain 
                ? "Select Network First" 
                : `${selectedNetwork.symbol} (Native Coin)`}
          </option>
          
          {/* Token category option */}
          <option disabled style={{ fontWeight: 'bold' }}>
            {/* Use BSC check for either the wallet network (in multi-chain view) or the global network */}
            {(selectedWalletNetwork?.id === 'bsc' || (!selectedWalletNetwork && selectedNetwork.id === 'bsc'))
              ? '---- BEP-20 Tokens ----' 
              : '---- ERC-20 Tokens ----'}
          </option>
          
          {/* Get tokens for the current network */}
          {(() => {
            // Determine which network to use for token filtering
            const networkId = selectedWalletNetwork 
              ? selectedWalletNetwork.id 
              : activeWallet.isMultiChain 
                ? null 
                : selectedNetwork.id;
            
            // If we have a valid network, show its tokens
            if (networkId) {
              const networkTokens = getTokensForNetwork(networkId);
              
              if (networkTokens.length === 0) {
                return (
                  <option disabled>
                    No saved tokens for this network
                  </option>
                );
              }
              
              return networkTokens.map(token => (
                <option key={token.id} value={`token-${token.id}`}>
                  {token.symbol} - {token.name || 'Token'}
                </option>
              ));
            } else {
              return (
                <option disabled>
                  Select a network to see tokens
                </option>
              );
            }
          })()}
        </select>
      </FormGroup>

      {/* Add Token Section */}
      <FormGroup>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <Label>Manage Tokens</Label>
          <Button
            onClick={() => setShowAddToken(!showAddToken)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            {showAddToken ? 'Cancel' : 'Add Token'}
          </Button>
        </div>
        
        {showAddToken && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid #00cc33',
            borderRadius: '4px',
            marginTop: '0.5rem'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Token Contract Address *</label>
              <Input
                type="text"
                placeholder="0x..."
                value={newTokenAddress}
                onChange={(e) => setNewTokenAddress(e.target.value)}
                style={{ marginBottom: '0.5rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Symbol *</label>
                <Input
                  type="text"
                  placeholder="TOKEN"
                  value={newTokenSymbol}
                  onChange={(e) => setNewTokenSymbol(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Decimals</label>
                <Input
                  type="number"
                  value={newTokenDecimals}
                  onChange={(e) => setNewTokenDecimals(e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Token Name (Optional)</label>
              <Input
                type="text"
                placeholder="Token Name"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
              />
            </div>
            
            <Button
              onClick={handleAddToken}
              disabled={isAddingToken || !newTokenAddress || !newTokenSymbol}
              style={{ 
                width: '100%',
                opacity: (isAddingToken || !newTokenAddress || !newTokenSymbol) ? 0.5 : 1
              }}
            >
              {isAddingToken ? 'Adding Token...' : 'Add Token'}
            </Button>
          </div>
        )}
      </FormGroup>
      
      <FormGroup>
        <Label>Created</Label>
        <InputWrapper>
          <Input value={new Date(activeWallet.createdAt).toLocaleString()} readOnly />
        </InputWrapper>
      </FormGroup>
      
      <FormGroup>
        <Label>Security</Label>
        <InputWrapper>
          <Input value={isWalletEncrypted ? 'Encrypted' : 'Not Encrypted'} readOnly />
        </InputWrapper>
      </FormGroup>
      
      {/* Display address for selected network */}
      {(selectedWalletNetwork || !activeWallet.isMultiChain) && (
        <>
          <FormGroup>
            <Label>
              {activeWallet.isMultiChain && selectedWalletNetwork
                ? `${selectedWalletNetwork.name} Address`
                : 'Wallet Address'}
            </Label>
            <InputWrapper>
              <Input value={activeWallet.address} readOnly />
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(activeWallet.address);
                  setSuccess('Address copied to clipboard');
                  setTimeout(() => setSuccess(''), 3000);
                }}
                style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
              >
                Copy
              </Button>
            </InputWrapper>
          </FormGroup>
        </>
      )}
      
      {/* Balance Information - Always show when we have a wallet */}
      <FormGroup>
        <Label>
          {selectedAsset === 'native' 
            ? `${selectedWalletNetwork?.symbol || selectedNetwork.symbol} Balance`
            : 'Token Balance'}
        </Label>
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#00cc33',
          border: '1px solid #00cc33',
          borderRadius: '2px',
          fontFamily: 'monospace'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {selectedAsset === 'native'
                ? `${selectedWalletNetwork?.symbol || selectedNetwork.symbol}`
                : (selectedWalletNetwork?.id === 'bsc' || (!selectedWalletNetwork && selectedNetwork.id === 'bsc'))
                  ? 'BEP-20 Token' 
                  : 'ERC-20 Token'}
            </span>
            <span>
              {isLoading 
                ? 'Loading...'
                : selectedAsset === 'native'
                  ? nativeBalance
                  : tokenBalance}
            </span>
          </div>
          <div style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.8rem', 
            opacity: 0.8,
            padding: '0.5rem',
            backgroundColor: 'rgba(0, 204, 51, 0.1)',
            border: '1px dashed rgba(0, 204, 51, 0.3)',
            borderRadius: '4px'
          }}>
            <button 
              onClick={fetchBalance}
              disabled={isLoading}
              style={{
                background: 'none',
                border: '1px solid #00cc33',
                color: isLoading ? '#666' : '#00cc33',
                padding: '4px 8px',
                borderRadius: '2px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.7rem'
              }}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Balance'}
            </button>
          </div>
        </div>
      </FormGroup>
    </div>
  );
};

export default WalletInfoTab;
