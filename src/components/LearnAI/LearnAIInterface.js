import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import GamifiedLearningHub from './GamifiedLearningHub';
import ARVRInterface from './ARVRInterface';
import InteractiveDashboard from './InteractiveDashboard';
import StoryModeLearning from './StoryModeLearning';
import HandsOnPlayground from './HandsOnPlayground';
import EnhancedChatInterface from './EnhancedChatInterface';
import WalletSetupPrompt from './WalletSetupPrompt';
import MigratePointDashboard from './MigratePointDashboard';

const LearnAIContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
  color: white;
  overflow: hidden;
  position: relative;
`;

const HeaderContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
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

const InterfaceTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
`;

const InterfaceSelector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const SelectorTitle = styled.h3`
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  opacity: 0.9;
`;

const ButtonGrid = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 3px;
  overflow-x: auto;
  max-width: 700px;
  padding-bottom: 4px;
  
  &::-webkit-scrollbar {
    height: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const DecorativeLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(79, 70, 229, 0.5) 25%, 
    rgba(124, 58, 237, 0.5) 75%, 
    transparent 100%
  );
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.3);
`;

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
  z-index: 2000;
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
`;;

const ContentWrapper = styled.div`
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 1;
`;

const SelectorButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? 'rgba(79, 70, 229, 0.5)' : 'rgba(255, 255, 255, 0.3)'};
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }
`;

  const LearnAIInterface = () => {
  const [activeInterface, setActiveInterface] = useState('enhanced-chat');
  const [walletSetup, setWalletSetup] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [userProgress, setUserProgress] = useState({
    completedNodes: [],
    currentLevel: 1,
    achievements: [],
    totalTime: 0,
    points: {
      total: 0,
      gamingHub: {
        blockchainBasics: 0,
        smartContracts: 0,
        defiProtocols: 0,
        nftsWeb3: 0
      },
      storyMode: {
        chapter1: 0,
        chapter2: 0,
        chapter3: 0,
        chapter4: 0,
        chapter5: 0,
        chapter6: 0,
        chapter7: 0,
        chapter8: 0
      },
      achievements: 0
    }
  });

  // Base interfaces that are always available
  // Memoize interfaces to prevent unnecessary recreations
  const interfaces = useMemo(() => {
    const baseInterfaces = [
      { id: 'enhanced-chat', name: 'Assistant', component: EnhancedChatInterface },
      { id: 'gamified-hub', name: 'Gaming Hub', component: GamifiedLearningHub },
      { id: 'story-mode', name: 'Story Mode', component: StoryModeLearning },
      { id: 'dashboard', name: 'Dashboard', component: InteractiveDashboard },
      { id: 'playground', name: 'Playground', component: HandsOnPlayground },
      { id: 'ar-vr', name: 'AR/VR Style', component: ARVRInterface }
    ];

    // Conditionally add migrate points interface only when wallet is connected
    return walletConnected ? [
      ...baseInterfaces.slice(0, 3), // Assistant, Gaming Hub, Story Mode
      { id: 'migrate-points', name: 'Migrate Points', component: MigratePointDashboard },
      ...baseInterfaces.slice(3) // Dashboard, Playground, AR/VR Style
    ] : baseInterfaces;
  }, [walletConnected]);

  const handleWalletClick = () => {
    if (walletConnected) {
      // If connected, show confirmation before removing wallet
      setShowRemoveConfirmation(true);
    } else {
      // If not connected, always show wallet setup UI
      // This allows users to create new wallet, import wallet, or connect existing wallet
      setShowWalletSetup(true);
    }
  };

  const handleWalletDisconnect = () => {
    // If user is currently viewing migrate-points, switch to assistant interface
    if (activeInterface === 'migrate-points') {
      setActiveInterface('enhanced-chat');
    }
    
    // Completely remove wallet - clear all data and states
    setWalletConnected(false);
    setWalletSetup(false);
    setWalletData(null);
    setShowRemoveConfirmation(false);
    
    // Remove all wallet data from localStorage
    localStorage.removeItem('ccube_ai_wallet');
    localStorage.removeItem('ccube_ai_wallet_connected');
    
    console.log('C-Cube Wallet completely removed from AI Tutor');
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirmation(false);
  };

  const handleWalletSetup = (newWalletData) => {
    setWalletData(newWalletData);
    setWalletSetup(true);
    setWalletConnected(true); // Auto-connect after setup
    setShowWalletSetup(false); // Hide wallet setup after completion
    // Optionally save to localStorage for persistence
    localStorage.setItem('ccube_ai_wallet', JSON.stringify(newWalletData));
  };

  const handleCloseWalletSetup = () => {
    setShowWalletSetup(false);
  };

  // Points management functions
  const addPoints = (category, subcategory, points) => {
    console.log(`🎯 addPoints called: ${category}.${subcategory} = ${points}`);
    
    setUserProgress(prev => {
      const newProgress = { ...prev };
      
      // Ensure points structure exists
      if (!newProgress.points) {
        console.log('⚠️ Creating missing points structure');
        newProgress.points = {
          total: 0,
          gamingHub: {
            blockchainBasics: 0,
            smartContracts: 0,
            defiProtocols: 0,
            nftsWeb3: 0
          },
          storyMode: {
            chapter1: 0,
            chapter2: 0,
            chapter3: 0,
            chapter4: 0,
            chapter5: 0,
            chapter6: 0,
            chapter7: 0,
            chapter8: 0
          },
          achievements: 0
        };
      }
      
      // Ensure nested structures exist
      if (!newProgress.points.gamingHub) {
        newProgress.points.gamingHub = {
          blockchainBasics: 0,
          smartContracts: 0,
          defiProtocols: 0,
          nftsWeb3: 0
        };
      }
      
      if (!newProgress.points.storyMode) {
        newProgress.points.storyMode = {
          chapter1: 0,
          chapter2: 0,
          chapter3: 0,
          chapter4: 0,
          chapter5: 0,
          chapter6: 0,
          chapter7: 0,
          chapter8: 0
        };
      }
      
      if (typeof newProgress.points.achievements !== 'number') {
        newProgress.points.achievements = 0;
      }
      
      // Add to specific category
      if (category === 'gamingHub' && newProgress.points.gamingHub[subcategory] !== undefined) {
        newProgress.points.gamingHub[subcategory] += points;
        console.log(`✅ Added ${points} points to ${category}.${subcategory}`);
      } else if (category === 'storyMode' && newProgress.points.storyMode[subcategory] !== undefined) {
        newProgress.points.storyMode[subcategory] += points;
        console.log(`✅ Added ${points} points to ${category}.${subcategory}`);
      } else if (category === 'achievements') {
        newProgress.points.achievements += points;
        console.log(`✅ Added ${points} points to achievements`);
      } else {
        console.error(`❌ Invalid category/subcategory: ${category}.${subcategory}`);
        return prev; // Return previous state unchanged if invalid
      }
      
      // Recalculate total
      const gamingTotal = Object.values(newProgress.points.gamingHub).reduce((sum, val) => sum + val, 0);
      const storyTotal = Object.values(newProgress.points.storyMode).reduce((sum, val) => sum + val, 0);
      newProgress.points.total = gamingTotal + storyTotal + newProgress.points.achievements;
      
      console.log('📊 New totals:', {
        gaming: gamingTotal,
        story: storyTotal,
        achievements: newProgress.points.achievements,
        total: newProgress.points.total
      });
      
      // Save to localStorage (persists across browser sessions)
      console.log('Saving points to localStorage:', newProgress.points); // Debug log
      localStorage.setItem('ccube_user_points', JSON.stringify(newProgress.points));
      
      return newProgress;
    });
  };

  const resetPoints = () => {
    setUserProgress(prev => ({
      ...prev,
      points: {
        total: 0,
        gamingHub: {
          blockchainBasics: 0,
          smartContracts: 0,
          defiProtocols: 0,
          nftsWeb3: 0
        },
        storyMode: {
          chapter1: 0,
          chapter2: 0,
          chapter3: 0,
          chapter4: 0,
          chapter5: 0,
          chapter6: 0,
          chapter7: 0,
          chapter8: 0
        },
        achievements: 0
      }
    }));
    localStorage.removeItem('ccube_user_points');
  };

  // Check for existing wallet and points on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('ccube_ai_wallet');
    const savedConnectionState = localStorage.getItem('ccube_ai_wallet_connected');
    
    if (savedWallet) {
      try {
        const walletInfo = JSON.parse(savedWallet);
        setWalletData(walletInfo);
        setWalletSetup(true);
        
        // Restore connection state (default to true if wallet exists)
        const isConnected = savedConnectionState ? JSON.parse(savedConnectionState) : false;
        setWalletConnected(isConnected);
      } catch (err) {
        console.error('Error loading saved wallet:', err);
        localStorage.removeItem('ccube_ai_wallet');
        localStorage.removeItem('ccube_ai_wallet_connected');
      }
    }

    // Load points from localStorage
    console.log('LearnAIInterface mounting - checking localStorage for points...');
    const savedPoints = localStorage.getItem('ccube_user_points');
    console.log('Raw saved points from localStorage:', savedPoints);
    
    if (savedPoints) {
      try {
        const pointsData = JSON.parse(savedPoints);
        console.log('Parsed saved points:', pointsData);
        
        // Validate the structure of saved points
        if (!pointsData || typeof pointsData !== 'object') {
          throw new Error('Invalid points data structure');
        }
        setUserProgress(prev => {
          const newProgress = {
            ...prev,
            points: {
              ...prev.points, // Preserve the default structure
              total: pointsData.total || prev.points.total,
              gamingHub: {
                ...prev.points.gamingHub,
                ...(pointsData.gamingHub || {})
              },
              storyMode: {
                ...prev.points.storyMode,
                ...(pointsData.storyMode || {})
              },
              achievements: pointsData.achievements || prev.points.achievements
            }
          };
          console.log('Setting userProgress with loaded points:', newProgress);
          return newProgress;
        });
      } catch (err) {
        console.error('Error loading saved points:', err);
        localStorage.removeItem('ccube_user_points');
      }
    } else {
      console.log('No saved points found in localStorage');
    }
  }, []);

  // Save connection state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ccube_ai_wallet_connected', JSON.stringify(walletConnected));
  }, [walletConnected]);

  const getCurrentInterface = () => {
    const selectedInterface = interfaces.find(i => i.id === activeInterface);
    console.log('Switching to interface:', activeInterface, 'with userProgress:', userProgress);
    return selectedInterface ? selectedInterface.component : EnhancedChatInterface;
  };

  const CurrentComponent = getCurrentInterface();
  
  // Show wallet setup prompt only if explicitly requested (not on first load)
  if (showWalletSetup) {
    return (
      <WalletSetupPrompt 
        onWalletSetup={handleWalletSetup}
        onClose={handleCloseWalletSetup}
        existingWallet={walletSetup ? walletData : null}
      />
    );
  }

  return (
    <LearnAIContainer>
      <HeaderContainer>
        <LeftSection>
          <CCubeWalletButton connected={walletConnected} onClick={handleWalletClick}>
            {walletConnected ? '�️ Remove C-Cube Wallet' : '💳 Connect C-Cube Wallet'}
          </CCubeWalletButton>
          <InterfaceTitle>
            🧠 Learn AI - Blockchain Fundamentals
            {walletConnected && walletData && (
              <span style={{ 
                fontSize: '0.7rem', 
                color: '#10b981', 
                marginLeft: '8px',
                opacity: 0.8 
              }}>
                • Wallet Connected ({walletData.address ? `${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}` : 'Ready'})
              </span>
            )}
          </InterfaceTitle>
        </LeftSection>
        
        <InterfaceSelector>
          <SelectorTitle>Choose Learning Interface:</SelectorTitle>
          <ButtonGrid>
            {interfaces.map(interfaceItem => (
              <SelectorButton
                key={interfaceItem.id}
                active={activeInterface === interfaceItem.id}
                onClick={() => setActiveInterface(interfaceItem.id)}
              >
                {interfaceItem.name}
              </SelectorButton>
            ))}
          </ButtonGrid>
        </InterfaceSelector>
      </HeaderContainer>

      <DecorativeLine />

      <ContentWrapper>
        <CurrentComponent 
          userProgress={userProgress}
          setUserProgress={setUserProgress}
          walletData={walletData}
          addPoints={addPoints}
          resetPoints={resetPoints}
        />
      </ContentWrapper>

      {/* Wallet Removal Confirmation Dialog */}
      {showRemoveConfirmation && (
        <ConfirmationOverlay>
          <ConfirmationDialog>
            <ConfirmationTitle>⚠️ Remove Wallet</ConfirmationTitle>
            <ConfirmationText>
              Are you sure you want to remove your C-Cube wallet from the AI Tutor? 
              <br /><br />
              <strong>This will permanently delete:</strong>
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
    </LearnAIContainer>
  );
};

export default LearnAIInterface;