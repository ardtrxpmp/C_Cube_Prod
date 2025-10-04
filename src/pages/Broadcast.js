import React, { useState, useContext } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import AppContext from '../context/AppContext';
import { ethers } from 'ethers';

// Black background global style for Broadcast page
const BroadcastGlobalStyle = createGlobalStyle`
  html, body {
    background: #000000 !important;
    background-image: none !important;
    background-attachment: initial !important;
    background-size: initial !important;
    background-position: initial !important;
    background-repeat: initial !important;
  }
  
  html::before,
  body::before,
  *::before {
    display: none !important;
  }
  
  #root {
    background: #000000 !important;
    background-image: none !important;
  }
`;

// Black PageBackground replacement
const BlackPageBackground = styled.div`
  min-height: 100vh;
  background: #000000 !important;
  background-image: none !important;
  position: relative;
  overflow-x: hidden;
  color: #e0e0e0;
  
  &::before {
    display: none !important;
  }
`;

// Black PageContent replacement  
const BlackPageContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 80px 20px 40px;
  background: #000000 !important;
  background-image: none !important;
`;

const BroadcastContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  font-family: ${({ theme }) => theme.fonts.code};
  letter-spacing: 1px;
`;

const Subtitle = styled.h3`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.code};
  letter-spacing: 1px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts.code};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 1px;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid ${({ theme, error }) => error ? theme.colors.danger : theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 120px;
  font-family: ${({ theme }) => theme.fonts.code};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const Button = styled.button`
  background-color: ${({ theme, secondary }) => secondary ? theme.colors.secondary : theme.colors.primary};
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  margin-right: 1rem;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.colors.danger}20;
`;

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.success};
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.colors.success}20;
`;

const InfoMessage = styled.div`
  color: ${({ theme }) => theme.colors.info};
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.info};
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.colors.info}20;
`;

const TransactionDetails = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-weight: bold;
  width: 120px;
  margin-right: 1rem;
`;

const DetailValue = styled.div`
  word-break: break-all;
  font-family: ${({ theme }) => theme.fonts.code};
`;

const NetworkOption = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Ethereum nodes
const ethereumNodes = [
  { id: 'infura', name: 'Infura', url: 'https://mainnet.infura.io/v3/your-infura-key' },
  { id: 'alchemy', name: 'Alchemy', url: 'https://eth-mainnet.g.alchemy.com/v2/your-alchemy-key' },
  { id: 'etherscan', name: 'Etherscan', url: 'https://api.etherscan.io/api' },
  { id: 'custom', name: 'Custom Node', url: '' },
];

const Broadcast = () => {
  const { networkStatus } = useContext(AppContext);
  const [signedTransaction, setSignedTransaction] = useState('');
  const [selectedNode, setSelectedNode] = useState(ethereumNodes[0]);
  const [customNodeUrl, setCustomNodeUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [txDetails, setTxDetails] = useState(null);

  const parseTransaction = () => {
    setError('');
    setTxDetails(null);
    
    if (!signedTransaction) {
      setError('Please enter a signed transaction');
      return;
    }
    
    try {
      // Parse the transaction
      const tx = ethers.Transaction.from(signedTransaction);
      
      setTxDetails({
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value) + ' ETH',
        gasLimit: tx.gasLimit.toString(),
        gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') + ' Gwei' : 'N/A',
        nonce: tx.nonce,
        data: tx.data,
        chainId: tx.chainId,
      });
      
      setInfo('Transaction parsed successfully. Please verify the details before broadcasting.');
    } catch (err) {
      setError(`Failed to parse transaction: ${err.message}`);
    }
  };

  const broadcastTransaction = async () => {
    if (!networkStatus.isOnline) {
      setError('You are currently offline. Please connect to the internet to broadcast transactions.');
      return;
    }
    
    if (!signedTransaction) {
      setError('Please enter a signed transaction');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // In a real application, we would send the transaction to the selected Ethereum node
      // But for this demo, we'll simulate it
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would normally be returned from the network
      const txHash = ethers.keccak256(signedTransaction);
      
      setSuccess(`Transaction broadcast successfully! Transaction hash: ${txHash}`);
      setInfo('Your transaction has been submitted to the network. It may take a few minutes to be included in a block.');
    } catch (err) {
      setError(`Failed to broadcast transaction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlackPageBackground>
      <BroadcastGlobalStyle />
      <BlackPageContent>
        <BroadcastContainer>
      <Card>
        <Title>Broadcast Transaction</Title>
        
        {!networkStatus.isOnline && (
          <InfoMessage>
            ⚠️ You are currently offline. You can parse transaction details, but broadcasting will require an internet connection.
          </InfoMessage>
        )}
        
        <FormGroup>
          <Label htmlFor="signedTx">Signed Transaction</Label>
          <TextArea 
            id="signedTx"
            value={signedTransaction}
            onChange={(e) => setSignedTransaction(e.target.value)}
            placeholder="Enter your signed transaction data here..."
          />
        </FormGroup>
        
        <Button onClick={parseTransaction}>
          Verify Transaction
        </Button>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {info && <InfoMessage>{info}</InfoMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        {txDetails && (
          <div style={{ marginTop: '1.5rem' }}>
            <Subtitle>Transaction Details</Subtitle>
            <TransactionDetails>
              <DetailRow>
                <DetailLabel>From:</DetailLabel>
                <DetailValue>{txDetails.from}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>To:</DetailLabel>
                <DetailValue>{txDetails.to}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Value:</DetailLabel>
                <DetailValue>{txDetails.value}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Gas Limit:</DetailLabel>
                <DetailValue>{txDetails.gasLimit}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Gas Price:</DetailLabel>
                <DetailValue>{txDetails.gasPrice}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Nonce:</DetailLabel>
                <DetailValue>{txDetails.nonce}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Chain ID:</DetailLabel>
                <DetailValue>{txDetails.chainId}</DetailValue>
              </DetailRow>
              {txDetails.data && txDetails.data !== '0x' && (
                <DetailRow>
                  <DetailLabel>Data:</DetailLabel>
                  <DetailValue>{txDetails.data}</DetailValue>
                </DetailRow>
              )}
            </TransactionDetails>
            
            <FormGroup>
              <Label>Select Ethereum Node</Label>
              {ethereumNodes.map(node => (
                <NetworkOption key={node.id}>
                  <input 
                    type="radio" 
                    id={node.id} 
                    name="ethNode" 
                    checked={selectedNode.id === node.id}
                    onChange={() => setSelectedNode(node)}
                  />
                  <label htmlFor={node.id}>{node.name}</label>
                </NetworkOption>
              ))}
            </FormGroup>
            
            {selectedNode.id === 'custom' && (
              <FormGroup>
                <Label htmlFor="customNode">Custom Node URL</Label>
                <TextArea 
                  id="customNode"
                  value={customNodeUrl}
                  onChange={(e) => setCustomNodeUrl(e.target.value)}
                  placeholder="https://..."
                  style={{ minHeight: '60px' }}
                />
              </FormGroup>
            )}
            
            <Button 
              onClick={broadcastTransaction} 
              disabled={loading || !networkStatus.isOnline}
            >
              {loading ? 'Broadcasting...' : 'Broadcast Transaction'}
            </Button>
          </div>
        )}
      </Card>
        </BroadcastContainer>
      </BlackPageContent>
    </BlackPageBackground>
  );
};

export default Broadcast;
