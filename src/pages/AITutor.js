import React, { useState, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import CCubeLogo from '../components/CyFoCubeLogo';
import LearnAIInterface from '../components/LearnAI/LearnAIInterface';
import WalletSetupPrompt from '../components/LearnAI/WalletSetupPrompt';
import { useWallet } from '../context/WalletContext';

// Main Container
const AITutorContainer = styled.div`
  height: 100vh;
  background: #000000;
  position: relative;
  overflow: hidden;
  color: #e0e0e0;
  padding-top: 180px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff10" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
`;

const AIContent = styled.div`
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: 100vh;
  }
`;

const MainContent = styled.div`
  flex: 1;
  width: 100%;
  height: calc(100vh - 100px);
  padding: 30px 0 0 0;
  margin: 0;
  background: transparent;
  position: relative;
  overflow: hidden;
  border-radius: 0;
  margin-top: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    height: calc(100vh - 100px);
    margin-top: 0;
    padding: 25px 0 0 0;
  }
`;

// Header Components (copied from TokenLaunch)
const SimpleHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
`;

const SimpleHeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const SimpleLogo = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  left: 0px;
  z-index: 10;

  a {
    text-decoration: none !important;
    border: none !important;
    outline: none !important;
    
    &:hover,
    &:focus,
    &:active,
    &:visited {
      text-decoration: none !important;
      border: none !important;
      outline: none !important;
      background: none !important;
    }
  }
`;

const CCubeWalletButton = styled.button`
  background: ${props => props.connected 
    ? 'linear-gradient(135deg, #10b981, #059669)' 
    : 'linear-gradient(135deg, #ff6b35, #f7931e)'};
  border: none;
  color: white;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.connected 
    ? '0 2px 8px rgba(16, 185, 129, 0.3)' 
    : '0 2px 8px rgba(255, 107, 53, 0.3)'};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  height: 32px;
  position: absolute;
  right: 40px;
  z-index: 10;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.connected 
      ? '0 4px 12px rgba(16, 185, 129, 0.4)' 
      : '0 4px 12px rgba(255, 107, 53, 0.4)'};
    background: ${props => props.connected 
      ? 'linear-gradient(135deg, #34d399, #10b981)' 
      : 'linear-gradient(135deg, #ff7849, #ffa726)'};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.connected 
      ? '0 2px 6px rgba(16, 185, 129, 0.3)' 
      : '0 2px 6px rgba(255, 107, 53, 0.3)'};
  }
`;

// Interface Navigation Styles
const InterfaceNavigation = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  position: absolute;
  right: 340px; /* Moved 150px more to the left (190px + 150px) */
  z-index: 10;
`;

const MenuSeparator = styled.div`
  width: 2px;
  height: 25px;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(156, 163, 175, 0.3) 10%, 
    rgba(156, 163, 175, 0.8) 50%, 
    rgba(156, 163, 175, 0.3) 90%, 
    transparent 100%);
  margin: 0 0.75rem;
`;

const InterfaceButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.active ? '#fbbf24' : 'white'};
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.8125rem; /* Increased by 1px (0.75rem + 1px ≈ 0.8125rem) */
  font-weight: bold; /* Made all text bold */
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
  min-width: fit-content;

  &:hover {
    color: #fbbf24;
    transform: translateY(-1px);
  }
`;

// Wallet Modal Styles
const WalletModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
`;

const WalletModal = styled.div`
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border: 1px solid rgba(0, 204, 51, 0.3);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  position: relative;
`;

const WalletModalTitle = styled.h2`
  color: #00cc33;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const WalletOption = styled.button`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &:hover {
    background: linear-gradient(135deg, #3a3a3a, #2f2f2f);
    border-color: rgba(0, 204, 51, 0.5);
    transform: translateY(-1px);
  }
`;

const WalletIcon = styled.span`
  font-size: 1.5rem;
`;

const CloseModalButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #999;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #fff;
  }
`;

// Confirmation Dialog Styles
const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
`;

const ConfirmationDialog = styled.div`
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 2px solid #dc2626;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 50px rgba(220, 38, 38, 0.3);
`;

const ConfirmationTitle = styled.h3`
  color: #dc2626;
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
`;

const ConfirmationText = styled.p`
  color: #fff;
  margin: 0 0 20px 0;
  text-align: center;
  line-height: 1.5;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    transform: translateY(-1px);
  }
`;

const CancelButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
`;

const AITutor = ({ onNavigate }) => {
  // Simplified: Direct rendering of Learn AI interface with header
  // Removed sidebar menu and complex navigation logic
  
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [activeInterface, setActiveInterface] = useState('enhanced-chat');
  
  const { 
    cCubeWalletConnected, 
    externalWalletConnected, 
    cCubeWalletData,
    externalWalletData,
    connectCCubeWallet, 
    connectExternalWallet, 
    disconnectCCubeWallet,
    disconnectExternalWallet,
    disconnectAllWallets,
    showWalletModal,
    setShowWalletModal
  } = useWallet();

  const isWalletConnected = cCubeWalletConnected || externalWalletConnected;

  // Interface options for the header menu
  const interfaces = useMemo(() => {
    const baseInterfaces = [
      { id: 'enhanced-chat', name: 'Assistant' },
      { id: 'gamified-hub', name: 'Gaming Hub' },
      { id: 'story-mode', name: 'Story Mode' },
      { id: 'dashboard', name: 'Dashboard' }
    ];

    // Conditionally add migrate points interface when any wallet is connected
    return (cCubeWalletConnected || externalWalletConnected) ? [
      ...baseInterfaces.slice(0, 3), // Assistant, Gaming Hub, Story Mode
      { id: 'migrate-points', name: 'Migrate Points' },
      ...baseInterfaces.slice(3) // Dashboard
    ] : baseInterfaces;
  }, [cCubeWalletConnected, externalWalletConnected]);

  const handleWalletClick = () => {
    if (cCubeWalletConnected) {
      // C-Cube wallet connected - show confirmation dialog
      handleCCubeWalletDisconnect();
    } else if (externalWalletConnected) {
      // External wallet connected - disconnect immediately
      handleExternalWalletDisconnect();
    } else {
      // Not connected - show wallet selection modal
      setShowWalletModal(true);
    }
  };

  const handleCCubeWalletDisconnect = () => {
    // Show confirmation dialog for C-Cube wallet
    setShowRemoveConfirmation(true);
  };

  const handleExternalWalletDisconnect = async () => {
    try {
      await disconnectExternalWallet();
    } catch (error) {
      console.error('Error disconnecting external wallet:', error);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      // Use global context to disconnect all wallets
      await disconnectAllWallets();
      setShowRemoveConfirmation(false);
    } catch (error) {
      console.error('Error disconnecting wallets:', error);
    }
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirmation(false);
  };

  const handleWalletSetup = async (newWalletData) => {
    try {
      // Use global context to connect C-Cube wallet
      await connectCCubeWallet(newWalletData);
      setShowWalletSetup(false);
      
      console.log('C-Cube wallet connected through global context');
    } catch (error) {
      console.error('Error connecting C-Cube wallet:', error);
    }
  };

  const handleCloseWalletSetup = () => {
    setShowWalletSetup(false);
  };

  // External Wallet Functions
  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // First disconnect any existing connections to force fresh connection
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (permissionError) {
          // If permission request fails, try direct account request
          console.log('Permission request failed, trying direct connection:', permissionError);
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request accounts - this should always show the MetaMask popup
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          const walletData = {
            address: address,
            provider: 'MetaMask',
            chainId: network.chainId.toString(),
            balance: await provider.getBalance(address)
          };
          
          // Use global context to connect external wallet
          await connectExternalWallet(walletData);
          setShowWalletModal(false);
          
          console.log('MetaMask connected successfully');
        }
      } else {
        alert('MetaMask not detected. Please install MetaMask extension.');
      }
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
      if (error.code === 4001) {
        console.log('User rejected the connection request');
      }
    }
  };

  const connectTrustWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
        // First request permissions to force fresh connection
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (permissionError) {
          // If permission request fails, try direct account request
          console.log('Permission request failed, trying direct connection:', permissionError);
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request accounts - this should always show the Trust Wallet popup
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          const walletData = {
            address: address,
            provider: 'Trust Wallet',
            chainId: network.chainId.toString(),
            balance: await provider.getBalance(address)
          };
          
          // Use global context to connect external wallet
          await connectExternalWallet(walletData);
          setShowWalletModal(false);
          
          console.log('Trust Wallet connected successfully');
        }
      } else {
        alert('Trust Wallet not detected. Please use Trust Wallet browser or install Trust Wallet.');
      }
    } catch (error) {
      console.error('Error connecting Trust Wallet:', error);
      if (error.code === 4001) {
        console.log('User rejected the connection request');
      }
    }
  };

  // Show wallet setup prompt when requested
  if (showWalletSetup) {
    return (
      <WalletSetupPrompt 
        onWalletSetup={handleWalletSetup}
        onClose={handleCloseWalletSetup}
        existingWallet={cCubeWalletConnected ? cCubeWalletData : null}
      />
    );
  }
  
  return (
    <>
      <SimpleHeader>
        <SimpleHeaderContent>
          <SimpleLogo>
            <Link to="/">
              <CCubeLogo />
            </Link>
          </SimpleLogo>
          
          <InterfaceNavigation>
            {interfaces.map((interfaceItem, index) => (
              <React.Fragment key={interfaceItem.id}>
                <InterfaceButton
                  active={activeInterface === interfaceItem.id}
                  onClick={() => setActiveInterface(interfaceItem.id)}
                >
                  {interfaceItem.name}
                </InterfaceButton>
                {index < interfaces.length - 1 && (
                  <MenuSeparator />
                )}
              </React.Fragment>
            ))}
          </InterfaceNavigation>

          <CCubeWalletButton 
            connected={cCubeWalletConnected || externalWalletConnected} 
            onClick={handleWalletClick}
          >
            {cCubeWalletConnected ? (
              <span style={{ fontWeight: 'bold' }}>
                🗑️ Disconnect C-Cube{' '}
                {cCubeWalletData && cCubeWalletData.address && (
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                    ({cCubeWalletData.address.slice(0, 4)}...{cCubeWalletData.address.slice(-3)})
                  </span>
                )}
              </span>
            ) : externalWalletConnected ? (
              <span style={{ fontWeight: 'bold' }}>
                🗑️ Disconnect {externalWalletData?.provider}{' '}
                {externalWalletData && externalWalletData.address && (
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                    ({externalWalletData.address.slice(0, 4)}...{externalWalletData.address.slice(-3)})
                  </span>
                )}
              </span>
            ) : <span style={{ fontWeight: 'bold' }}>💳 Connect Wallet</span>}
          </CCubeWalletButton>
        </SimpleHeaderContent>
      </SimpleHeader>
      
      <AITutorContainer>
        <AIContent>
          <MainContent>
            <LearnAIInterface activeInterface={activeInterface} />
          </MainContent>
        </AIContent>
      </AITutorContainer>

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <WalletModalOverlay onClick={() => setShowWalletModal(false)}>
          <WalletModal onClick={(e) => e.stopPropagation()}>
            <CloseModalButton onClick={() => setShowWalletModal(false)}>×</CloseModalButton>
            <WalletModalTitle>Connect Wallet</WalletModalTitle>
            
            <WalletOption onClick={() => {
              setShowWalletModal(false);
              setShowWalletSetup(true);
            }}>
              <WalletIcon>🔷</WalletIcon>
              <div>
                <div style={{ fontWeight: 'bold' }}>C-Cube Wallet</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Create or import C-Cube wallet</div>
              </div>
            </WalletOption>
            
            <WalletOption onClick={connectMetaMask}>
              <WalletIcon>🦊</WalletIcon>
              <div>
                <div style={{ fontWeight: 'bold' }}>MetaMask</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Connect using MetaMask extension</div>
              </div>
            </WalletOption>
            
            <WalletOption onClick={connectTrustWallet}>
              <WalletIcon>🛡️</WalletIcon>
              <div>
                <div style={{ fontWeight: 'bold' }}>Trust Wallet</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Connect using Trust Wallet</div>
              </div>
            </WalletOption>
          </WalletModal>
        </WalletModalOverlay>
      )}

      {/* Confirmation Dialog */}
      {showRemoveConfirmation && (
        <ConfirmationOverlay>
          <ConfirmationDialog>
            <ConfirmationTitle>🗑️ Remove C-Cube Wallet</ConfirmationTitle>
            <ConfirmationText>
              Are you sure you want to remove your C-Cube wallet? This will clear:
              <br />• Your wallet connection
              <br />• Stored wallet data
              <br />• Learning progress tied to this wallet
              <br /><br />
              Make sure you have your seed phrase/private key saved if you want to import this wallet again later.
            </ConfirmationText>
            <ConfirmationButtons>
              <ConfirmButton onClick={handleWalletDisconnect}>
                🗑️ Yes, Remove Wallet
              </ConfirmButton>
              <CancelButton onClick={handleCancelRemove}>
                ✕ Cancel
              </CancelButton>
            </ConfirmationButtons>
          </ConfirmationDialog>
        </ConfirmationOverlay>
      )}
    </>
  );
};

export default AITutor;