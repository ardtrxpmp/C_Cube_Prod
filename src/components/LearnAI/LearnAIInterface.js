import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import GamifiedLearningHub from './GamifiedLearningHub';
import InteractiveDashboard from './InteractiveDashboard';
import StoryModeLearning from './StoryModeLearning';
import EnhancedChatInterface from './EnhancedChatInterface';
import WalletSetupPrompt from './WalletSetupPrompt';
import MigratePointDashboard from './MigratePointDashboard';
import { useWallet } from '../../context/WalletContext';

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
  top: 120px;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 1;
  padding-top: 110px; /* Moved up another 10px - fine-tuned positioning */
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

  const LearnAIInterface = ({ activeInterface = 'enhanced-chat' }) => {
  // Use global wallet context
  const {
    cCubeWalletConnected,
    cCubeWalletData,
    externalWalletConnected,
    externalWalletData,
    connectCCubeWallet,
    disconnectCCubeWallet,
    isAnyWalletConnected,
    getWalletDisplayName
  } = useWallet();
  const [walletSetup, setWalletSetup] = useState(false);
  const [showWalletSetup, setShowWalletSetup] = useState(false);
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

  // Component mapping for different interfaces
  const getComponent = (interfaceId) => {
    const componentMap = {
      'enhanced-chat': EnhancedChatInterface,
      'gamified-hub': GamifiedLearningHub,
      'story-mode': StoryModeLearning,
      'dashboard': InteractiveDashboard,
      'migrate-points': MigratePointDashboard
    };
    return componentMap[interfaceId] || EnhancedChatInterface;
  };

  const handleWalletClick = () => {
    if (cCubeWalletConnected) {
      // If connected, show confirmation before removing wallet
      setShowRemoveConfirmation(true);
    } else {
      // If not connected, always show wallet setup UI
      // This allows users to create new wallet, import wallet, or connect existing wallet
      setShowWalletSetup(true);
    }
  };

  const handleWalletDisconnect = async () => {
    // If user is currently viewing migrate-points, switch to assistant interface
    if (activeInterface === 'migrate-points') {
      setActiveInterface('enhanced-chat');
    }
    
    // Use global wallet context to disconnect
    try {
      await disconnectCCubeWallet();
      setWalletSetup(false);
      setShowRemoveConfirmation(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
    
    console.log('C-Cube Wallet completely removed from AI Tutor');
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirmation(false);
  };

  const handleWalletSetup = async (newWalletData) => {
    try {
      // Use global wallet context to connect C-Cube wallet
      await connectCCubeWallet(newWalletData);
      setWalletSetup(true);
      setShowWalletSetup(false); // Hide wallet setup after completion
      
      console.log('C-Cube wallet connected through global context in AI Tutor');
    } catch (error) {
      console.error('Error connecting C-Cube wallet:', error);
    }
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
      
      // Save to sessionStorage (persists until browser closes)
      console.log('Saving points to sessionStorage:', newProgress.points); // Debug log
      sessionStorage.setItem('ccube_user_points', JSON.stringify(newProgress.points));
      
      return newProgress;
    });
  };

  const resetPoints = () => {
    console.log('🗑️ Resetting all points and progress after migration');
    
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
    
    // Clear points and game progress but preserve story position
    sessionStorage.removeItem('ccube_user_points');
    sessionStorage.removeItem('ccube_game_progress');
    // DON'T clear story progress - user should retain their chapter/question position
    
    console.log('✅ All points and progress cleared');
  };

  // Complete application reset on new browser session
  useEffect(() => {
    const sessionActive = sessionStorage.getItem('ccube_session_active');
    
    if (!sessionActive) {
      // New browser session detected - clear ALL application data
      console.log('🆕 New browser session detected - performing complete application reset');
      
      // Clear all sessionStorage data
      sessionStorage.clear();
      
      // Reset userProgress state to initial values
      setUserProgress({
        completedNodes: [],
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
      
      console.log('✅ Complete application reset completed - fresh start');
    } else {
      console.log('🔄 Continuing existing browser session');
    }
    
    // Mark this session as active
    sessionStorage.setItem('ccube_session_active', 'true');
  }, []); // Empty dependency array - runs only on component mount

  // Clear all data on browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🚪 Browser closing - clearing all application data');
      // Clear all sessionStorage data completely
      sessionStorage.clear();
    };
    
    // Also handle page visibility changes for mobile browsers
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 Page hidden - preparing for potential session end');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Set wallet setup state based on global wallet connection
  useEffect(() => {
    if (cCubeWalletConnected) {
      setWalletSetup(true);
    } else {
      setWalletSetup(false);
    }
  }, [cCubeWalletConnected]);

  // Load points from sessionStorage on component mount
  useEffect(() => {
    console.log('LearnAIInterface mounting - checking sessionStorage for points...');
    const savedPoints = sessionStorage.getItem('ccube_user_points');
    console.log('Raw saved points from sessionStorage:', savedPoints);
    
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
        sessionStorage.removeItem('ccube_user_points');
      }
    } else {
      console.log('No saved points found in sessionStorage');
    }
  }, []);

  // Wallet connection state is now managed by global context

  const CurrentComponent = getComponent(activeInterface);
  console.log('Switching to interface:', activeInterface, 'with userProgress:', userProgress);
  
  // Show wallet setup prompt only if explicitly requested (not on first load)
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
    <LearnAIContainer>
      <ContentWrapper>
        <CurrentComponent 
          userProgress={userProgress}
          setUserProgress={setUserProgress}
          walletData={cCubeWalletConnected ? cCubeWalletData : externalWalletConnected ? externalWalletData : null}
          cCubeWalletData={cCubeWalletData}
          externalWalletData={externalWalletData}
          isWalletConnected={cCubeWalletConnected || externalWalletConnected}
          addPoints={addPoints}
          resetPoints={resetPoints}
          onWalletSetupRequest={() => setShowWalletSetup(true)}
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