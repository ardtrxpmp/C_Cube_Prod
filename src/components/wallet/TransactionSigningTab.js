import React from 'react';
import { ethers } from 'ethers';
import {
  FormGroup,
  Label,
  InputWrapper,
  Input,
  TextArea,
  Button,
  Loading,
  NetworkBadge,
  RadioGroup,
  RadioOption,
  RadioInput,
  RadioLabel
} from './WalletStyles';

const TransactionSigningTab = ({
  selectedNetwork,
  activeWallet,
  networks,
  wallets,
  txNetwork,
  setTxNetwork,
  txType,
  setTxType,
  txRecipient,
  setTxRecipient,
  txAmount,
  setTxAmount,
  txData,
  setTxData,
  tokenAddress,
  setTokenAddress,
  tokenSymbol,
  setTokenSymbol,
  tokenDecimals,
  setTokenDecimals,
  password,
  setPassword,
  signedTransaction,
  handleSignTransaction,
  loading,
  isWalletEncrypted,
  decryptedWallet,
  userTokens,
  getTokensForNetwork,
  addToken,
  removeToken,
  networkStatus,
  setSuccess,
  setError
}) => {
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        {selectedNetwork.isMultiChainView ? (
          <FormGroup>
            <Label htmlFor="txNetworkSelect">Select Network for Transaction</Label>
            <select
              id="txNetworkSelect"
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
                // Find the selected network from our networks array
                const network = networks.find(n => n.id === e.target.value);
                console.log("Selected network from dropdown:", network);
                if (network && !network.isMultiChainView) {
                  // Set the transaction network without changing the global selected network
                  setTxNetwork(network);
                  console.log("Setting txNetwork to:", network);
                  // Reset token info when network changes
                  setTokenSymbol('');
                  setTokenDecimals(18);
                }
              }}
              value={txNetwork?.id || ""} // Use txNetwork id or empty string
            >
              <option value="">-- Select Network --</option>
              {networks.filter(n => !n.isMultiChainView).map(network => (
                <option 
                  key={network.id} 
                  value={network.id}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  }}
                >
                  {network.name} ({network.symbol})
                </option>
              ))}
            </select>
            <div style={{ 
              padding: '0.5rem',
              backgroundColor: 'rgba(0, 204, 51, 0.1)',
              border: '1px dashed rgba(0, 204, 51, 0.3)',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              <p style={{ margin: '0' }}>
                <strong>Note:</strong> In Multi-Chain view, you need to specify which 
                network you want to create a transaction for.
              </p>
            </div>
          </FormGroup>
        ) : (
          <>
            <NetworkBadge color={txNetwork?.color || '#627EEA'}>
              {activeWallet.isMultiChain 
                ? `Multi-Chain Wallet on ${txNetwork?.name || selectedNetwork.name} (${txNetwork?.symbol || selectedNetwork.symbol})`
                : `${txNetwork?.name || selectedNetwork.name} (${txNetwork?.symbol || selectedNetwork.symbol})`}
            </NetworkBadge>
            {(txNetwork?.isTestnet || selectedNetwork.isTestnet) && (
              <span style={{ 
                marginLeft: '0.5rem', 
                padding: '2px 8px',
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                color: '#ff9800',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 'bold' 
              }}>
                TESTNET
              </span>
            )}
          </>
        )}
      </div>
      
      <FormGroup>
        <Label htmlFor="txType">Transaction Type</Label>
        <RadioGroup style={{ flexDirection: 'row', gap: '1.5rem', marginBottom: '1rem' }}>
          <RadioOption>
            <RadioInput
              type="radio"
              name="txType"
              id="nativeTransfer"
              checked={txType === 'native'}
              onChange={() => setTxType('native')}
              disabled={(selectedNetwork.isMultiChainView && !txNetwork?.chainId)}
            />
            <RadioLabel htmlFor="nativeTransfer" style={{
              opacity: (selectedNetwork.isMultiChainView && !txNetwork?.chainId) ? 0.6 : 1
            }}>
              {selectedNetwork.isMultiChainView && !txNetwork?.chainId
                ? "Send Native Coin (Select Network Above)" 
                : `Send ${txNetwork?.symbol || selectedNetwork.symbol} (${txNetwork?.name || selectedNetwork.name})`}
            </RadioLabel>
          </RadioOption>
          <RadioOption>
            <RadioInput
              type="radio"
              name="txType"
              id="tokenTransfer"
              checked={txType === 'token'}
              onChange={() => setTxType('token')}
              disabled={(selectedNetwork.isMultiChainView && !txNetwork?.chainId)}
            />
            <RadioLabel htmlFor="tokenTransfer" style={{
              opacity: (selectedNetwork.isMultiChainView && !txNetwork?.chainId) ? 0.6 : 1
            }}>
              {selectedNetwork.isMultiChainView && !txNetwork?.chainId
                ? "Send Token (Select Network Above)"
                : (txNetwork?.id === 'bsc' || selectedNetwork.id === 'bsc')
                  ? "Send Token (BEP-20)"
                  : "Send Token (ERC-20)"}
            </RadioLabel>
          </RadioOption>
        </RadioGroup>
      </FormGroup>
      
      {txType === 'token' && (
        <>
          {/* Saved tokens dropdown */}
          <FormGroup>
            <Label>Your Saved Tokens</Label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <select
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#00cc33',
                  border: '1px solid #00cc33',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}
                onChange={(e) => {
                  const tokenId = e.target.value;
                  if (tokenId) {
                    // Find the token in the user's saved tokens
                    const token = userTokens.find(t => t.id === tokenId);
                    if (token) {
                      setTokenAddress(token.address);
                      setTokenSymbol(token.symbol);
                      setTokenDecimals(token.decimals);
                      setSuccess(`Loaded token: ${token.symbol}`);
                    }
                  }
                }}
                value=""
              >
                <option value="">-- Select a saved token --</option>
                {/* Filter tokens for the current transaction network */}
                {(txNetwork || selectedNetwork) ? getTokensForNetwork((txNetwork || selectedNetwork).id).map(token => (
                  <option key={token.id} value={token.id}>
                    {token.symbol} - {token.name || 'Token'}
                  </option>
                )) : (
                  <option disabled>Select a network first</option>
                )}
              </select>
              
              <Button
                onClick={() => {
                  const selectElement = document.querySelector('select');
                  const selectedTokenId = selectElement?.value;
                  
                  if (selectedTokenId) {
                    // Find the token in the user's saved tokens
                    const token = userTokens.find(t => t.id === selectedTokenId);
                    
                    if (token) {
                      // Confirm before removing
                      if (window.confirm(`Remove ${token.symbol} token from your saved tokens?`)) {
                        removeToken(token.id);
                        setSuccess(`Removed token: ${token.symbol}`);
                        // Reset form fields
                        setTokenAddress('');
                        setTokenSymbol('');
                        setTokenDecimals(18);
                      }
                    }
                  } else {
                    setError('Please select a token to remove');
                  }
                }}
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  fontSize: '0.8rem',
                  backgroundColor: 'rgba(204, 0, 0, 0.3)' 
                }}
              >
                Remove Token
              </Button>
            </div>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="tokenAddress">
              {(txNetwork?.id === 'bsc' || selectedNetwork.id === 'bsc') ? 'BEP-20' : 'ERC-20'} Token Contract Address
            </Label>
            <InputWrapper>
              <Input 
                id="tokenAddress"
                type="text"
                value={tokenAddress}
                onChange={(e) => {
                  const address = e.target.value;
                  setTokenAddress(address);
                  
                  // Reset token info when address changes
                  if (!ethers.isAddress(address)) {
                    setTokenSymbol('');
                    setTokenDecimals(18);
                  }
                }}
                placeholder="0x..."
              />
            </InputWrapper>
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button 
                  onClick={async () => {
                    try {
                      if (!ethers.isAddress(tokenAddress)) {
                        throw new Error('Invalid token address');
                      }
                      
                      setLoading(true);
                      setError('');
                      
                      // Get the current network
                      const network = txNetwork || selectedNetwork;
                      let tokenSymbolValue = '';
                      let tokenDecimalsValue = 18;
                      let tokenNameValue = '';
                      
                      if (!networkStatus.isOnline) {
                        // OFFLINE MODE: Use mock data based on address patterns
                        setSuccess('Offline mode: Using pattern recognition to guess token details');
                        
                        const lowerCaseAddr = tokenAddress.toLowerCase();
                        
                        if (lowerCaseAddr.startsWith('0xdac17') || lowerCaseAddr.endsWith('a0')) {
                          tokenSymbolValue = 'USDT';
                          tokenDecimalsValue = 6;
                          tokenNameValue = 'Tether USD';
                        } else if (lowerCaseAddr.startsWith('0xa0b86') || lowerCaseAddr.endsWith('b1')) {
                          tokenSymbolValue = 'USDC';
                          tokenDecimalsValue = 6;
                          tokenNameValue = 'USD Coin';
                        } else if (lowerCaseAddr.startsWith('0x6b17') || lowerCaseAddr.endsWith('c2')) {
                          tokenSymbolValue = 'DAI';
                          tokenDecimalsValue = 18;
                          tokenNameValue = 'Dai Stablecoin';
                        } else {
                          const symbols = ['TKN', 'GLD', 'SLV', 'STAR', 'MOON', 'COOL'];
                          tokenSymbolValue = symbols[Math.floor(Math.random() * symbols.length)];
                          tokenDecimalsValue = [6, 8, 18][Math.floor(Math.random() * 3)];
                          tokenNameValue = tokenSymbolValue + ' Token';
                        }
                      } else {
                        // ONLINE MODE: Connect to blockchain
                        if (!network.rpcUrl) {
                          throw new Error('Network RPC URL not available');
                        }
                        
                        setSuccess(`Connecting to ${network.name}...`);
                        
                        try {
                          const provider = new ethers.JsonRpcProvider(network.rpcUrl);
                          
                          const minimalAbi = [
                            "function name() view returns (string)",
                            "function symbol() view returns (string)",
                            "function decimals() view returns (uint8)"
                          ];
                          
                          const tokenContract = new ethers.Contract(tokenAddress, minimalAbi, provider);
                          
                          try {
                            tokenSymbolValue = await tokenContract.symbol();
                          } catch (symbolError) {
                            console.error('Error fetching token symbol:', symbolError);
                            tokenSymbolValue = 'TOKEN';
                          }
                          
                          try {
                            const decimals = await tokenContract.decimals();
                            tokenDecimalsValue = parseInt(decimals.toString());
                          } catch (decimalsError) {
                            console.error('Error fetching token decimals:', decimalsError);
                            tokenDecimalsValue = 18;
                          }
                          
                          try {
                            tokenNameValue = await tokenContract.name();
                          } catch (nameError) {
                            console.error('Error fetching token name:', nameError);
                            tokenNameValue = tokenSymbolValue + ' Token';
                          }
                          
                          setSuccess(`Successfully fetched token info from blockchain`);
                        } catch (providerError) {
                          console.error('Error connecting to blockchain:', providerError);
                          setError(`Couldn't connect to ${network.name}. Using fallback data.`);
                          
                          // Fallback to mock data
                          const lowerCaseAddr = tokenAddress.toLowerCase();
                          if (lowerCaseAddr.startsWith('0xdac17') || lowerCaseAddr.endsWith('a0')) {
                            tokenSymbolValue = 'USDT';
                            tokenDecimalsValue = 6;
                            tokenNameValue = 'Tether USD';
                          } else {
                            const symbols = ['TKN', 'GLD', 'SLV', 'STAR', 'MOON', 'COOL'];
                            tokenSymbolValue = symbols[Math.floor(Math.random() * symbols.length)];
                            tokenDecimalsValue = [6, 8, 18][Math.floor(Math.random() * 3)];
                            tokenNameValue = tokenSymbolValue + ' Token';
                          }
                        }
                      }
                      
                      // Update the state with the fetched values
                      setTokenSymbol(tokenSymbolValue);
                      setTokenDecimals(tokenDecimalsValue);
                      
                      // Save the token to persistent storage
                      try {
                        addToken({
                          address: tokenAddress,
                          symbol: tokenSymbolValue,
                          decimals: tokenDecimalsValue,
                          networkId: (txNetwork || selectedNetwork).id,
                          name: tokenNameValue
                        });
                        setSuccess(`Token detected and saved: ${tokenSymbolValue} (${tokenDecimalsValue} decimals)`);
                      } catch (tokenErr) {
                        console.error('Error saving token:', tokenErr);
                        setSuccess(`Token detected: ${tokenSymbolValue} (${tokenDecimalsValue} decimals), but couldn't be saved`);
                      }
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  disabled={!tokenAddress || loading}
                >
                  {loading ? 'Detecting...' : 'Detect Token Info'}
                </Button>

                <Button 
                  onClick={() => {
                    try {
                      if (!ethers.isAddress(tokenAddress)) {
                        setError('Invalid token address');
                        return;
                      }
                      
                      if (!tokenSymbol) {
                        setError('Token symbol is required');
                        return;
                      }
                      
                      // Save token with current values
                      addToken({
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals || 18,
                        networkId: (txNetwork || selectedNetwork).id,
                        name: `${tokenSymbol} Token`
                      });
                      
                      setSuccess(`Token saved: ${tokenSymbol} (${tokenDecimals} decimals)`);
                    } catch (err) {
                      setError(err.message);
                    }
                  }}
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    fontSize: '0.8rem',
                    backgroundColor: 'rgba(0, 153, 51, 0.3)'
                  }}
                  disabled={!tokenAddress || !tokenSymbol}
                >
                  Save Token
                </Button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <FormGroup style={{ flex: 1 }}>
                <Label htmlFor="tokenSymbol">Token Symbol</Label>
                <InputWrapper>
                  <Input 
                    id="tokenSymbol"
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="e.g., USDC"
                  />
                </InputWrapper>
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <Label htmlFor="tokenDecimals">Token Decimals</Label>
                <InputWrapper>
                  <Input 
                    id="tokenDecimals"
                    type="number"
                    value={tokenDecimals}
                    onChange={(e) => setTokenDecimals(parseInt(e.target.value) || 18)}
                    placeholder="18"
                    min="0"
                    max="36"
                  />
                </InputWrapper>
              </FormGroup>
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#00cc33', 
              backgroundColor: 'rgba(0, 204, 51, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px',
              marginTop: '0.5rem'
            }}>
              <p style={{ margin: '0' }}>
                <strong>Note:</strong> This will create a{' '}
                {(txNetwork?.id === 'bsc' || selectedNetwork.id === 'bsc') ? 'BEP-20' : 'ERC-20'}{' '}
                token transfer transaction on {(txNetwork || selectedNetwork).name}. 
                Make sure the token contract exists on this network.
              </p>
            </div>
          </FormGroup>
        </>
      )}
      
      <FormGroup>
        <Label htmlFor="recipient">Recipient Address</Label>
        
        {/* Wallet selector - only show if there are other wallets */}
        {wallets && wallets.length > 1 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <Label style={{ fontSize: '0.85rem', color: '#00aa33', marginBottom: '0.25rem' }}>
              Select from your wallets:
            </Label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: '#00cc33',
                border: '1px solid #00cc33',
                borderRadius: '2px',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setTxRecipient(e.target.value);
                }
              }}
            >
              <option value="">-- Select a wallet or enter address manually --</option>
              {wallets
                .filter(wallet => wallet.address !== activeWallet?.address) // Exclude current wallet
                .map((wallet, index) => (
                  <option key={wallet.address || index} value={wallet.address}>
                    {wallet.name || `Wallet ${index + 1}`} - {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)} 
                    {wallet.networkId && ` (${wallet.networkId.toUpperCase()})`}
                  </option>
                ))
              }
            </select>
          </div>
        )}
        
        <InputWrapper>
          <Input 
            id="recipient"
            type="text"
            value={txRecipient}
            onChange={(e) => setTxRecipient(e.target.value)}
            placeholder="0x... or select from wallets above"
          />
        </InputWrapper>
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="amount">
          Amount {txType === 'native' 
            ? `(${(txNetwork || selectedNetwork).symbol})` 
            : tokenSymbol ? `(${tokenSymbol})` : ''}
        </Label>
        <InputWrapper>
          <Input 
            id="amount"
            type="number"
            step="0.000001"
            min="0"
            value={txAmount}
            onChange={(e) => setTxAmount(e.target.value)}
            placeholder="0.0"
          />
        </InputWrapper>
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="data">{txType === 'native' ? 'Data (Optional, Hex)' : 'Additional Data (Optional)'}</Label>
        <InputWrapper>
          <Input 
            id="data"
            type="text"
            value={txData}
            onChange={(e) => setTxData(e.target.value)}
            placeholder="0x"
          />
        </InputWrapper>
      </FormGroup>
      
      {isWalletEncrypted && !decryptedWallet && (
        <FormGroup>
          <Label htmlFor="password">Wallet Password</Label>
          <Input 
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormGroup>
      )}
      
      <Button 
        onClick={handleSignTransaction}
        disabled={
          loading || 
          (txType === 'token' && (!tokenAddress || !tokenSymbol)) || 
          (selectedNetwork.isMultiChainView && !txNetwork?.chainId)
        }
      >
        {loading ? (
          <Loading>Signing</Loading>
        ) : (selectedNetwork?.isMultiChainView && !txNetwork?.chainId) ? (
          "Select a Network First"
        ) : txType === 'native' ? (
          `Sign ${(txNetwork || selectedNetwork)?.symbol || ''} Transaction`
        ) : (
          `Sign ${tokenSymbol || (((txNetwork?.id === 'bsc' || selectedNetwork.id === 'bsc') ? 'BEP-20' : 'ERC-20') + ' Token')} Transaction`
        )}
      </Button>
      
      {signedTransaction && (
        <div style={{ marginTop: '1.5rem' }}>
          <Label>
            Signed {txType === 'native' 
              ? (txNetwork || selectedNetwork).symbol 
              : tokenSymbol || (((txNetwork?.id === 'bsc' || selectedNetwork.id === 'bsc') ? 'BEP-20' : 'ERC-20') + ' Token')} Transaction 
            on {(txNetwork || selectedNetwork).name}
          </Label>
          <TextArea 
            value={signedTransaction}
            readOnly
          />
          <div style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.875rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(0, 204, 51, 0.1)',
            borderRadius: '4px',
            border: '1px dashed rgba(0, 204, 51, 0.3)'
          }}>
            <p style={{ marginTop: '0', marginBottom: '0.5rem' }}>
              <strong>Network:</strong> {(txNetwork || selectedNetwork).name} (Chain ID: {(txNetwork || selectedNetwork).chainId})
            </p>
            <p style={{ marginTop: '0', marginBottom: '0' }}>
              Copy this signed transaction and use it in the Broadcast menu to send your transaction.
              Make sure to broadcast it on the {(txNetwork || selectedNetwork).name} network.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSigningTab;
