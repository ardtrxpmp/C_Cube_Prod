import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import GamifiedLearningHub from './GamifiedLearningHub';
import InteractiveDashboard from './InteractiveDashboard';
import StoryModeLearning from './StoryModeLearning';
import EnhancedChatInterface from './EnhancedChatInterface';
import WalletSetupPrompt from './WalletSetupPrompt';
import MigratePointDashboard from './MigratePointDashboard';
import { useWallet } from '../../context/WalletContext';

// All spacing components removed for direct menu-to-content connection

  const LearnAIInterface = ({ activeInterface = 'enhanced-chat' }) => {
  // Use wallet context
  const { 
    cCubeWalletConnected, 
    cCubeWalletData, 
    externalWalletConnected, 
    externalWalletData,
    connectCCubeWallet,
    disconnectCCubeWallet,
    connectExternalWallet,
    disconnectExternalWallet,
    showWalletModal,
    setShowWalletModal,
    currentWalletType,
    walletScores,
    fetchWalletScores,
    isAnyWalletConnected
  } = useWallet();
  const [walletSetup, setWalletSetup] = useState(false);
  const [showWalletSetup, setShowWalletSetup] = useState(false);
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

  // Load points from sessionStorage on component mount - ONLY when no wallet is connected
  useEffect(() => {
    console.log('LearnAIInterface mounting - checking sessionStorage for points...');
    const walletConnected = isAnyWalletConnected();
    console.log('Wallet connected status:', walletConnected);
    
    // Don't restore session storage if wallet is connected - let database scores take precedence
    if (walletConnected) {
      console.log('Wallet connected - skipping session storage restoration to allow database scores');
      return;
    }
    
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
  }, [cCubeWalletConnected, externalWalletConnected, isAnyWalletConnected]);

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
    <CurrentComponent 
      userProgress={userProgress}
      setUserProgress={setUserProgress}
      walletData={cCubeWalletConnected ? cCubeWalletData : externalWalletConnected ? externalWalletData : null}
      cCubeWalletData={cCubeWalletData}
      externalWalletData={externalWalletData}
      isWalletConnected={cCubeWalletConnected || externalWalletConnected}
      addPoints={addPoints}
      resetPoints={resetPoints}
      walletScores={walletScores}
      fetchWalletScores={fetchWalletScores}
      onWalletSetupRequest={() => setShowWalletSetup(true)}
    />
  );
};

export default LearnAIInterface;