import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useWallet } from '../../context/WalletContext';

// Animation keyframes
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
  100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
`;

// Main container for the migrate points dashboard
const MigrateMainContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f0f23, #1a1a2e);
  position: relative;
  overflow: auto;
  padding: 55px 20px 20px; /* Increased top padding by 15px */
`;

const DashboardHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  animation: ${fadeIn} 1s ease-out;
`;

const DashboardTitle = styled.h1`
  color: #10b981;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
`;

const DashboardSubtitle = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.8s ease-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: rgba(16, 185, 129, 0.3);
  }
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #10b981;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
`;

const StatLabel = styled.div`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatDescription = styled.div`
  color: #64748b;
  font-size: 0.9rem;
`;

const BlockchainStatusCard = styled.div`
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: ${props => {
    switch (props.type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const StatusMessage = styled.div`
  color: #e2e8f0;
  font-size: 0.9rem;
  margin-bottom: 12px;
`;

const BlockchainInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const InfoItem = styled.div`
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
`;

const InfoLabel = styled.div`
  color: #9ca3af;
  font-size: 0.8rem;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
`;

const TokenInfoCard = styled.div`
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05));
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SuccessModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const SuccessModalBox = styled.div`
  background: rgba(30, 41, 59, 0.95);
  border: 2px solid rgba(16, 185, 129, 0.5);
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
`;

const SuccessModalClose = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #10b981;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(16, 185, 129, 0.1);
    transform: scale(1.1);
  }
`;

const SuccessModalContent = styled.div`
  text-align: center;
  color: #e2e8f0;
`;

const SuccessModalTitle = styled.h3`
  color: #10b981;
  font-size: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const SuccessModalMessage = styled.p`
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 0;
  white-space: pre-line;
`;

const TokenInfoTitle = styled.h3`
  color: #fbbf24;
  font-size: 1.1rem;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContractAddress = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 8px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #10b981;
  word-break: break-all;
  margin: 8px 0;
  position: relative;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(245, 158, 11, 0.3);
  }
`;

const TokenInstructions = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
`;

const InstructionStep = styled.div`
  color: #e2e8f0;
  font-size: 0.9rem;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const StepNumber = styled.span`
  background: #3b82f6;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
`;

const MigrateButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const MigrateButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
  padding: 16px 48px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  animation: ${glowPulse} 3s infinite;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, #34d399, #10b981);
  }
  
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: rgba(156, 163, 175, 0.3);
    color: #9ca3af;
    cursor: not-allowed;
    animation: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

// Calculate Gaming Hub points using the same method as Gaming Hub component
const calculateGamingHubPoints = () => {
  try {
    const savedPoints = sessionStorage.getItem('ccube_user_points');
    if (!savedPoints) return 0;
    
    const pointsData = JSON.parse(savedPoints);
    if (!pointsData.gamingHub) return 0;
    
    return Object.values(pointsData.gamingHub).reduce((sum, val) => sum + val, 0);
  } catch (error) {
    console.error('Error calculating Gaming Hub points:', error);
    return 0;
  }
};

// Calculate Story Mode points using the same method as Story Mode component
const calculateStoryModePoints = () => {
  try {
    const savedPoints = sessionStorage.getItem('ccube_user_points');
    if (!savedPoints) return 0;
    
    const pointsData = JSON.parse(savedPoints);
    if (!pointsData.storyMode) return 0;
    
    return Object.values(pointsData.storyMode).reduce((sum, val) => sum + val, 0);
  } catch (error) {
    console.error('Error calculating Story Mode points:', error);
    return 0;
  }
};

// Get individual Gaming Hub category points
const getGamingHubCategoryPoints = () => {
  try {
    const savedPoints = sessionStorage.getItem('ccube_user_points');
    if (!savedPoints) return {};
    
    const pointsData = JSON.parse(savedPoints);
    return pointsData.gamingHub || {};
  } catch (error) {
    console.error('Error getting Gaming Hub category points:', error);
    return {};
  }
};

// Get individual Story Mode chapter points
const getStoryModeChapterPoints = () => {
  try {
    const savedPoints = sessionStorage.getItem('ccube_user_points');
    if (!savedPoints) return {};
    
    const pointsData = JSON.parse(savedPoints);
    return pointsData.storyMode || {};
  } catch (error) {
    console.error('Error getting Story Mode chapter points:', error);
    return {};
  }
};

// Live calculation helpers for success messages
const calculateLiveGamingHubTotal = (walletScores) => {
  const databaseGaming = walletScores?.points?.gamingHub ? Object.values(walletScores.points.gamingHub).reduce((sum, val) => sum + val, 0) : 0;
  const sessionGaming = (() => {
    const saved = sessionStorage.getItem('ccube_user_points');
    if (saved) {
      const data = JSON.parse(saved);
      return data.gamingHub ? Object.values(data.gamingHub).reduce((sum, val) => sum + val, 0) : 0;
    }
    return 0;
  })();
  return databaseGaming + sessionGaming;
};

const calculateLiveStoryModeTotal = (walletScores) => {
  const databaseStory = walletScores?.points?.storyMode?.totalScore || 0;
  const sessionStory = (() => {
    const saved = sessionStorage.getItem('ccube_user_points');
    if (saved) {
      const data = JSON.parse(saved);
      return data.storyMode ? Object.values(data.storyMode).reduce((sum, val) => sum + val, 0) : 0;
    }
    return 0;
  })();
  return databaseStory + sessionStory;
};

const calculateLiveTotal = (walletScores) => {
  return calculateLiveGamingHubTotal(walletScores) + calculateLiveStoryModeTotal(walletScores);
};

const MigratePointDashboard = ({ userProgress, setUserProgress, walletData, cCubeWalletData, externalWalletData, isWalletConnected, addPoints, resetPoints }) => {
  // Get fresh wallet data directly from context (not from stale props)
  const { walletScores, fetchWalletScores, walletScoresLoading } = useWallet();
  
  // Enhanced debugging and fallback system
  const [debugInfo, setDebugInfo] = useState({});
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Debug wallet connection props
  useEffect(() => {
    console.log('🔍 MigratePointDashboard wallet props:', {
      walletData: walletData ? `${walletData.address?.slice(0, 6)}...${walletData.address?.slice(-4)}` : 'null',
      cCubeWalletData: cCubeWalletData ? `${cCubeWalletData.address?.slice(0, 6)}...${cCubeWalletData.address?.slice(-4)}` : 'null',
      externalWalletData: externalWalletData ? `${externalWalletData.address?.slice(0, 6)}...${externalWalletData.address?.slice(-4)}` : 'null',
      isWalletConnected: isWalletConnected
    });
  }, [walletData, cCubeWalletData, externalWalletData, isWalletConnected]);
  
  // Migration state - MOVED UP to be declared before useMemo
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [userTokenBalance, setUserTokenBalance] = useState('0');
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Simple: Just copy the points from Gaming Hub and Story Mode sections
  const points = useMemo(() => {
    console.log('🔍 MigratePointDashboard - isWalletConnected:', isWalletConnected);
    console.log('🔍 MigratePointDashboard - walletScores:', walletScores);
    console.log('🔍 MigratePointDashboard - walletScores?.points?.total:', walletScores?.points?.total);
    
    // No wallet = zeros
    if (!isWalletConnected) {
      console.log('❌ Wallet disconnected - showing zeros');
      return {
        total: 0,
        gamingHub: { blockchainBasics: 0, smartContracts: 0, defiProtocols: 0, nftsWeb3: 0 },
        storyMode: { chapter1: 0, chapter2: 0, chapter3: 0, chapter4: 0, chapter5: 0, chapter6: 0, chapter7: 0, chapter8: 0, totalScore: 0 },
        achievements: 0
      };
    }
    
    console.log('✅ Wallet connected - calculating points');

    // Priority: Database first (when wallet connected), then session storage
    if (walletScores?.points) {
      console.log('🎮 Using DATABASE scores (wallet connected):', walletScores.points);
      // Get session storage once
      const savedPoints = sessionStorage.getItem('ccube_user_points');
      
      const databaseGamingPoints = walletScores.points.gamingHub ? 
        Object.values(walletScores.points.gamingHub).reduce((sum, val) => sum + val, 0) : 0;
      
      // Add current session gaming points to database points
      let sessionGamingPoints = 0;
      if (savedPoints) {
        const sessionData = JSON.parse(savedPoints);
        if (sessionData.gamingHub) {
          sessionGamingPoints = Object.values(sessionData.gamingHub).reduce((sum, val) => sum + val, 0);
        }
      }
      
      const gamingTotal = databaseGamingPoints + sessionGamingPoints;
      
      const databaseStoryPoints = walletScores.points.storyMode?.totalScore || 0;
      let sessionStoryPoints = 0;
      if (savedPoints) {
        const sessionData = JSON.parse(savedPoints);
        if (sessionData.storyMode) {
          sessionStoryPoints = Object.values(sessionData.storyMode).filter(val => typeof val === 'number').reduce((sum, val) => sum + val, 0);
        }
      }
      
      const storyTotal = databaseStoryPoints + sessionStoryPoints;
      
      // Achievement points always 0 for now
      const achievementsTotal = 0;
      
      const totalPoints = gamingTotal + storyTotal + achievementsTotal;
      console.log('🎯 DATABASE CALCULATION:', { gamingTotal, storyTotal, achievementsTotal, totalPoints });
      
      return {
        total: totalPoints,
        gamingHub: walletScores.points.gamingHub || { blockchainBasics: 0, smartContracts: 0, defiProtocols: 0, nftsWeb3: 0 },
        storyMode: { ...walletScores.points.storyMode, totalScore: storyTotal },
        achievements: achievementsTotal
      };
    }
    
    // No database scores for connected wallet = show zeros
    console.log('❌ Wallet connected but no database scores - showing zeros');

    // Default zeros
    return {
      total: 0,
      gamingHub: { blockchainBasics: 0, smartContracts: 0, defiProtocols: 0, nftsWeb3: 0 },
      storyMode: { chapter1: 0, chapter2: 0, chapter3: 0, chapter4: 0, chapter5: 0, chapter6: 0, chapter7: 0, chapter8: 0, totalScore: 0 },
      achievements: 0
    };
  }, [walletScores, isWalletConnected, forceRefresh]);  // Enhanced refresh points function with loading state
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshPointsFromSource = async () => {
    setIsRefreshing(true);
    console.log('🔄 MigratePointDashboard - Comprehensive points refresh...');
    
    try {
      // Step 1: Force re-read from sessionStorage (latest from Gaming Hub/Story Mode)
      const freshSessionData = sessionStorage.getItem('ccube_user_points');
      console.log('📊 Current sessionStorage data:', freshSessionData);
      
      if (freshSessionData) {
        const freshPoints = JSON.parse(freshSessionData);
        console.log('📊 Parsed fresh points:', freshPoints);
        
        // Recalculate totals to ensure accuracy
        const gamingTotal = freshPoints.gamingHub ? Object.values(freshPoints.gamingHub).reduce((sum, val) => sum + val, 0) : 0;
        const storyTotal = freshPoints.storyMode ? Object.values(freshPoints.storyMode).reduce((sum, val) => sum + val, 0) : 0;
        const achievementsTotal = freshPoints.achievements || 0;
        
        const recalculatedPoints = {
          ...freshPoints,
          total: gamingTotal + storyTotal + achievementsTotal
        };
        
        console.log('🧮 Recalculated totals:', {
          gaming: gamingTotal,
          story: storyTotal,
          achievements: achievementsTotal,
          total: recalculatedPoints.total
        });
        
        // Step 2: Update userProgress with fresh sessionStorage data
        if (setUserProgress) {
          setUserProgress(prev => ({
            ...prev,
            points: recalculatedPoints
          }));
          console.log('✅ Updated userProgress with fresh points');
        }
        
        // Step 3: Update sessionStorage with recalculated data
        sessionStorage.setItem('ccube_user_points', JSON.stringify(recalculatedPoints));
        
      } else {
        console.log('⚠️ No sessionStorage data found');
      }
      
      // Step 4: Force component re-render
      setForceRefresh(prev => prev + 1);
      
      console.log('🎯 Manual refresh completed successfully');
      
    } catch (error) {
      console.error('❌ Error during refresh:', error);
    } finally {
      // Add a small delay for better user feedback
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Auto-refresh points when component is viewed
  useEffect(() => {
    const autoRefreshPoints = () => {
      console.log('🔄 MigratePointDashboard - Auto-refreshing points...');
      setForceRefresh(prev => prev + 1);
    };

    // Refresh immediately when component mounts
    autoRefreshPoints();

    // Refresh when window gains focus (user switches back from another tab/app)
    window.addEventListener('focus', autoRefreshPoints);
    
    // Refresh when user clicks on this tab/section  
    const interval = setInterval(autoRefreshPoints, 3000); // Every 3 seconds for real-time sync

    return () => {
      window.removeEventListener('focus', autoRefreshPoints);
      clearInterval(interval);
    };
  }, []);

  // Debug logging
  useEffect(() => {
    const info = {
      userProgressExists: !!userProgress,
      userProgressPointsExists: !!(userProgress?.points),
      sessionStoragePoints: sessionStorage.getItem('ccube_user_points'),
      computedPointsTotal: points.total,
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
    console.log('🐛 MigratePointDashboard Debug Info:', info);
  }, [userProgress, points]);

  // Contract address (from deployment results)
  const CONTRACT_ADDRESS = "0x4b35C661652700953A8E23704AE6211D447C412A";

  const checkTokenBalance = async (address) => {
    try {
      const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001';
      const response = await fetch(`${apiEndpoint}/user/${address}/balance`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserTokenBalance(result.data.balance);
          return result.data.balance;
        }
      }
    } catch (error) {
      console.error('Failed to check token balance:', error);
    }
    return '0';
  };

  // Initialize migration system when any wallet is connected
  useEffect(() => {
    const initializeMigration = async () => {
      const connectedAddress = cCubeWalletData?.address || externalWalletData?.address || walletData?.address;
      if (connectedAddress) {
        setIsConnecting(true);
        await checkTokenBalance(connectedAddress);
        setTimeout(() => setIsConnecting(false), 1000);
      }
    };

    initializeMigration();
  }, [walletData, cCubeWalletData, externalWalletData, isWalletConnected]);

  const handleMigrate = async () => {
    const connectedWallet = cCubeWalletData || externalWalletData || walletData;
    const connectedAddress = connectedWallet?.address;
    
    if (!connectedWallet || !connectedAddress) {
      alert("Please connect your wallet first to migrate points!\n\nSupported wallets:\n• C-Cube Wallet\n• MetaMask\n• Other Web3 wallets");
      return;
    }
    
    if (points.total === 0) {
      alert("No points available to migrate! Answer some questions to earn points first.");
      return;
    }

    try {
      setIsMigrating(true);
      setMigrationStatus({ type: 'info', message: 'Preparing migration...' });

      const estimatedTokenAmount = points.total / 1000;

      const confirmed = window.confirm(
        `🚀 Point Migration to C-Cube Wallet\n\n` +
        `Points to migrate: ${points.total.toLocaleString()}\n` +
        `Estimated tokens: ${estimatedTokenAmount.toFixed(6)} LCUBE\n` +
        `Your connected wallet: ${connectedAddress?.slice(0, 6)}...${connectedAddress?.slice(-4)}\n\n` +
        `⚠️ This will:\n` +
        `• Send LCUBE tokens to your connected C-Cube wallet\n` +
        `• Reset your session points to 0\n` +
        `• Process transaction on the blockchain\n\n` +
        `Continue with migration?`
      );

      if (!confirmed) {
        setMigrationStatus(null);
        setIsMigrating(false);
        return;
      }

      setMigrationStatus({ type: 'info', message: 'Sending to blockchain...' });

      const migrationSession = {
        sessionId: `ccube_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        points: points.total,
        userAddress: connectedAddress,
        walletType: cCubeWalletData ? 'ccube' : 'external'
      };

      const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001';
      
      setMigrationStatus({ type: 'info', message: 'Processing migration request...' });

      const response = await fetch(`${apiEndpoint}/migrate-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: connectedAddress,
          points: points.total,
          sessionData: migrationSession,
          walletType: cCubeWalletData ? 'ccube' : 'external',
          walletData: {
            address: connectedAddress,
            privateKey: connectedWallet.privateKey // Use connected wallet's private key for minting (C-Cube only)
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Migration request failed');
      }

      const result = await response.json();

      if (result.success) {
        const tokensReceived = result.data.tokensReceived || (points.total / 1000).toFixed(6);
        const contractAddress = result.data.contractAddress || CONTRACT_ADDRESS;
        
        setMigrationStatus({ 
          type: 'success', 
          message: `✅ Migration successful! ${tokensReceived} LCUBE sent to your C-Cube wallet`,
          txHash: result.data.txHash
        });

        setUserTokenBalance(tokensReceived);

        const successMessage = `🎉 Migration Complete!\n\n` +
          `✅ ${tokensReceived} LCUBE tokens minted to your wallet\n` +
          `📍 Wallet: ${connectedAddress}\n` +
          `🔗 Contract: ${contractAddress}\n` +
          `⛽ Transaction: ${result.data.txHash || 'Pending'}\n\n` +
          `� IMPORTANT: To see your tokens in wallet apps:\n` +
          `Your tokens are already in your wallet on the blockchain,\n` +
          `but you need to ADD THE TOKEN manually to see them!\n\n` +
          `📱 Steps to add LCUBE token:\n` +
          `1. Open your wallet app (MetaMask, Trust Wallet, etc.)\n` +
          `2. Look for "Add Token" or "Custom Token"\n` +
          `3. Paste contract address: ${contractAddress}\n` +
          `4. Token Symbol: LCUBE (should auto-fill)\n` +
          `5. Decimals: 18 (should auto-fill)\n` +
          `6. Confirm to add the token\n\n` +
          `💡 The tokens are safely stored on BSC Testnet blockchain!`;

        if (resetPoints) {
          setTimeout(() => {
            resetPoints();
            alert(successMessage);
            setMigrationStatus({ 
              type: 'success', 
              message: `🎉 ${tokensReceived} LCUBE tokens in your wallet! Add token contract to view in wallet app.`
            });
          }, 2000);
        } else {
          alert(successMessage);
        }
      } else {
        throw new Error(result.error || 'Migration failed');
      }

    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus({ 
        type: 'error', 
        message: `❌ Migration failed: ${error.message}`
      });
    } finally {
      setIsMigrating(false);
    }
  };



  return (
    <MigrateMainContainer>
      <DashboardHeader>
        <DashboardTitle>🔄 Migrate Points Dashboard</DashboardTitle>
        <DashboardSubtitle>
          View all your earned points and migrate them to your C-Cube wallet as LCUBE tokens
        </DashboardSubtitle>
      </DashboardHeader>

      {/* Debug Panel - Remove this after fixing */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          background: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          margin: '12px 0',
          fontSize: '12px',
          color: '#ff6b6b'
        }}>
          <strong>🐛 Debug Info (Development Only):</strong><br/>
          UserProgress exists: {debugInfo.userProgressExists ? '✅' : '❌'}<br/>
          UserProgress.points exists: {debugInfo.userProgressPointsExists ? '✅' : '❌'}<br/>
          SessionStorage has points: {debugInfo.sessionStoragePoints ? '✅' : '❌'}<br/>
          Computed points total: {debugInfo.computedPointsTotal}<br/>
          <strong>📊 Points Breakdown:</strong><br/>
          • Gaming Hub Total: {(() => {
            const databaseGaming = walletScores?.points?.gamingHub ? Object.values(walletScores.points.gamingHub).reduce((sum, val) => sum + val, 0) : 0;
            const sessionGaming = (() => {
              const saved = sessionStorage.getItem('ccube_user_points');
              if (saved) {
                const data = JSON.parse(saved);
                return data.gamingHub ? Object.values(data.gamingHub).reduce((sum, val) => sum + val, 0) : 0;
              }
              return 0;
            })();
            return databaseGaming + sessionGaming;
          })()}<br/>
          • Story Mode Total: {(() => {
            const databaseStory = walletScores?.points?.storyMode?.totalScore || 0;
            const sessionStory = (() => {
              const saved = sessionStorage.getItem('ccube_user_points');
              if (saved) {
                const data = JSON.parse(saved);
                return data.storyMode ? Object.values(data.storyMode).filter(val => typeof val === 'number').reduce((sum, val) => sum + val, 0) : 0;
              }
              return 0;
            })();
            return databaseStory + sessionStory;
          })()}<br/>
          • Achievements: {points.achievements || 0}<br/>
          <strong>🎮 Gaming Hub Details:</strong><br/>
          {(() => {
            let categories;
            if (isWalletConnected && walletScores?.points?.gamingHub) {
              categories = walletScores.points.gamingHub;
            } else {
              categories = getGamingHubCategoryPoints();
            }
            const entries = Object.entries(categories);
            if (entries.length === 0) return '• No Gaming Hub points yet';
            return entries.map(([key, value], index) => (
              <span key={key}>
                • {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                {index < entries.length - 1 && <br/>}
              </span>
            ));
          })()}<br/>
          <strong>📖 Story Mode Details:</strong><br/>
          {(() => {
            if (isWalletConnected && walletScores?.points?.storyMode) {
              return `• Chapters Completed: ${walletScores.points.storyMode.chaptersCompleted || 0}<br/>• Total Score: ${walletScores.points.storyMode.totalScore || 0} pts`;
            }
            const chapters = getStoryModeChapterPoints();
            const entries = Object.entries(chapters);
            if (entries.length === 0) return '• No Story Mode points yet';
            return entries.map(([key, value], index) => (
              <span key={key}>
                • {key.replace(/-/g, ' ').replace(/^./, str => str.toUpperCase())}: {value} pts
                {index < entries.length - 1 && <br/>}
              </span>
            ));
          })()}<br/>
          Timestamp: {debugInfo.timestamp}
        </div>
      )}

      {/* Wallet Status - Show any connected wallet */}
      {(isWalletConnected || walletData) && (
        <BlockchainStatusCard>
          <StatusIndicator type={isConnecting ? 'info' : (isWalletConnected || walletData) ? 'success' : 'error'}>
            {isConnecting ? '🔄' : (isWalletConnected || walletData) ? '✅' : '❌'}
            {isConnecting ? 'Initializing Migration System...' : 
             cCubeWalletData ? 'C-Cube Wallet Ready for Migration' : 
             externalWalletData ? 'External Wallet Ready for Migration' :
             walletData ? 'Wallet Ready for Migration' : 
             'Wallet Connection Required'}
          </StatusIndicator>
          
          {migrationStatus && (
            <StatusMessage>
              {migrationStatus.message}
              {migrationStatus.txHash && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                  Transaction: {migrationStatus.txHash}
                </div>
              )}
            </StatusMessage>
          )}

          <BlockchainInfo>
            <InfoItem>
              <InfoLabel>Connected Wallet</InfoLabel>
              <InfoValue>
                {(() => {
                  const address = cCubeWalletData?.address || externalWalletData?.address || walletData?.address;
                  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected';
                })()}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>LCUBE Balance</InfoLabel>
              <InfoValue>{parseFloat(userTokenBalance).toFixed(6)} LCUBE</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Points → Tokens</InfoLabel>
              <InfoValue>{points.total.toLocaleString()} → {(points.total / 1000).toFixed(6)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Network</InfoLabel>
              <InfoValue>BSC Testnet</InfoValue>
            </InfoItem>
          </BlockchainInfo>
        </BlockchainStatusCard>
      )}

      {/* Token Contract Information */}
      <TokenInfoCard>
        <TokenInfoTitle>
          🪙 LCUBE Token Information
        </TokenInfoTitle>
        
        <div style={{ marginBottom: '12px' }}>
          <InfoLabel>Contract Address:</InfoLabel>
          <ContractAddress>
            {CONTRACT_ADDRESS}
            <CopyButton 
              onClick={() => {
                navigator.clipboard.writeText(CONTRACT_ADDRESS);
                alert('Contract address copied to clipboard!');
              }}
            >
              Copy
            </CopyButton>
          </ContractAddress>
        </div>

        <BlockchainInfo>
          <InfoItem>
            <InfoLabel>Token Name</InfoLabel>
            <InfoValue>LearnCube Token</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Symbol</InfoLabel>
            <InfoValue>LCUBE</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Decimals</InfoLabel>
            <InfoValue>18</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Network</InfoLabel>
            <InfoValue>BSC Testnet (97)</InfoValue>
          </InfoItem>
        </BlockchainInfo>

        <TokenInstructions>
          <div style={{ color: '#ef4444', fontWeight: '700', marginBottom: '12px', fontSize: '1rem' }}>
            🚨 IMPORTANT: Tokens won't show automatically in wallet apps!
          </div>
          <div style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '12px' }}>
            📱 You must manually add LCUBE token to see your balance:
          </div>
          <InstructionStep>
            <StepNumber>1</StepNumber>
            <span>Open your wallet app (MetaMask, Trust Wallet, etc.)</span>
          </InstructionStep>
          <InstructionStep>
            <StepNumber>2</StepNumber>
            <span>Go to "Add Token" or "Custom Token" section</span>
          </InstructionStep>
          <InstructionStep>
            <StepNumber>3</StepNumber>
            <span>Paste the contract address above</span>
          </InstructionStep>
          <InstructionStep>
            <StepNumber>4</StepNumber>
            <span>Token details should auto-fill (LCUBE, 18 decimals)</span>
          </InstructionStep>
          <InstructionStep>
            <StepNumber>5</StepNumber>
            <span>Confirm to add the token to your wallet</span>
          </InstructionStep>
          <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '8px', fontStyle: 'italic' }}>
            💡 Your tokens are already in your wallet on the blockchain - adding the token just makes them visible!
          </div>
        </TokenInstructions>
      </TokenInfoCard>

      {/* Enhanced Refresh Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => {
            console.log('🔄 Manual comprehensive refresh triggered');
            refreshPointsFromSource();
          }}
          disabled={isRefreshing}
          style={{
            background: isRefreshing 
              ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            opacity: isRefreshing ? 0.7 : 1
          }}
        >
          {isRefreshing ? (
            <>⏳ Refreshing Points...</>
          ) : (
            <>🔄 Sync Latest Points from Gaming Hub & Story Mode</>
          )}
        </button>
        <div style={{ 
          fontSize: '12px', 
          color: '#64748b', 
          marginTop: '5px' 
        }}>
          Click to get the most recent scores from all sections
        </div>
      </div>

      {/* Total Stats Overview */}
      <StatsGrid>
        <StatCard>
          <StatValue>{points.total.toLocaleString()}</StatValue>
          <StatLabel>Total Points</StatLabel>
          <StatDescription>Ready for migration</StatDescription>
        </StatCard>
        <StatCard>
          <StatValue>{(() => {
            const databaseGaming = walletScores?.points?.gamingHub ? Object.values(walletScores.points.gamingHub).reduce((sum, val) => sum + val, 0) : 0;
            const sessionGaming = (() => {
              const saved = sessionStorage.getItem('ccube_user_points');
              if (saved) {
                const data = JSON.parse(saved);
                return data.gamingHub ? Object.values(data.gamingHub).reduce((sum, val) => sum + val, 0) : 0;
              }
              return 0;
            })();
            return (databaseGaming + sessionGaming).toLocaleString();
          })()}</StatValue>
          <StatLabel>Gaming Hub Points</StatLabel>
          <StatDescription>From all game categories</StatDescription>
        </StatCard>
        <StatCard>
          <StatValue>{points.storyMode.totalScore.toLocaleString()}</StatValue>
          <StatLabel>Story Mode Points</StatLabel>
          <StatDescription>From completed chapters</StatDescription>
        </StatCard>
        <StatCard>
          <StatValue>{points.achievements.toLocaleString()}</StatValue>
          <StatLabel>Achievement Points</StatLabel>
          <StatDescription>From special accomplishments</StatDescription>
        </StatCard>
      </StatsGrid>

      {/* Demo and Migrate Buttons */}
      <MigrateButtonContainer>
        
        {/* Refresh Points Button - Always visible for debugging */}
        <MigrateButton 
          onClick={() => {
            console.log('🔄 Manual refresh triggered');
            setForceRefresh(prev => prev + 1);
          }}
          style={{ 
            background: 'linear-gradient(135deg, #10b981, #059669)',
            marginRight: '20px'
          }}
        >
          🔄 Refresh Points
        </MigrateButton>

        {/* Save Points to Database Button */}
        <MigrateButton 
          onClick={async () => {
            try {
              console.log('💾 === SAVE BUTTON CLICKED ===');
              console.log('🔍 Debug wallet props:');
              console.log('  - cCubeWalletData:', cCubeWalletData);
              console.log('  - externalWalletData:', externalWalletData);
              console.log('  - walletData:', walletData);
              console.log('  - isWalletConnected:', isWalletConnected);
              
              // Get current wallet address from any connected wallet
              let currentWallet = null;
              
              if (cCubeWalletData?.address) {
                currentWallet = cCubeWalletData.address;
                console.log('📱 Using C-Cube wallet:', currentWallet);
              } else if (externalWalletData?.address) {
                currentWallet = externalWalletData.address;
                console.log('🌐 Using external wallet (MetaMask):', currentWallet);
              } else if (walletData?.address) {
                currentWallet = walletData.address;
                console.log('💼 Using wallet data:', currentWallet);
              }
              
              console.log('🎯 Final wallet address:', currentWallet);
              
              if (!currentWallet) {
                setSuccessMessage('No Wallet Connected\n\nPlease connect your wallet first to save points.\n\nSupported wallets:\n• C-Cube Wallet\n• MetaMask\n• Other Web3 wallets');
                setShowSuccessModal(true);
                return;
              }
              
              console.log('✅ Wallet detected for saving:', currentWallet);
              
              // Get current points from session
              const currentPoints = sessionStorage.getItem('ccube_user_points');
              console.log('📊 Raw points from sessionStorage:', currentPoints);
              
              if (!currentPoints) {
                console.log('❌ No points found in sessionStorage');
                setSuccessMessage('No Points to Save\n\nYou don\'t have any points to save yet.\n\nComplete some activities to earn points first:\n• Gaming Hub challenges\n• Story Mode chapters\n• Learning activities');
                setShowSuccessModal(true);
                return;
              }
              
              const pointsData = JSON.parse(currentPoints);
              console.log('📊 Parsed points data:', pointsData);
              
              if (pointsData.total === 0) {
                console.log('❌ Points total is 0');
                setSuccessMessage('No Points to Save\n\nYour total points is 0.\n\nComplete some activities to earn points first:\n• Gaming Hub challenges\n• Story Mode chapters\n• Learning activities');
                setShowSuccessModal(true);
                return;
              }
              
              // Create user data following Users_Scores schema
              // Calculate the live totals to save to database (with safety check)
              console.log('🔍 walletScores before calculation:', walletScores);
              const liveGamingTotal = walletScores ? calculateLiveGamingHubTotal(walletScores) : (pointsData.gamingHub ? Object.values(pointsData.gamingHub).reduce((sum, val) => sum + val, 0) : 0);
              const liveStoryTotal = walletScores ? calculateLiveStoryModeTotal(walletScores) : (pointsData.storyMode ? Object.values(pointsData.storyMode).reduce((sum, val) => sum + val, 0) : 0);
              const liveTotalPoints = liveGamingTotal + liveStoryTotal;
              
              // For database storage, we need to save the combined totals (existing database + new session points)
              const combinedGamingHub = {
                blockchainBasics: (walletScores?.points?.gamingHub?.blockchainBasics || 0) + (pointsData.gamingHub?.blockchainBasics || 0),
                smartContracts: (walletScores?.points?.gamingHub?.smartContracts || 0) + (pointsData.gamingHub?.smartContracts || 0),
                defiProtocols: (walletScores?.points?.gamingHub?.defiProtocols || 0) + (pointsData.gamingHub?.defiProtocols || 0),
                nftsWeb3: (walletScores?.points?.gamingHub?.nftsWeb3 || 0) + (pointsData.gamingHub?.nftsWeb3 || 0)
              };
              
              const combinedStoryModeTotal = (walletScores?.points?.storyMode?.totalScore || 0) + (Object.values(pointsData.storyMode || {}).reduce((sum, val) => sum + val, 0));
              
              const userData = {
                walletAddress: currentWallet,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                points: {
                  gamingHub: combinedGamingHub,
                  storyMode: {
                    chaptersCompleted: Object.values(pointsData.storyMode || {}).filter(score => score > 0).length + (walletScores?.points?.storyMode?.chaptersCompleted || 0),
                    totalScore: combinedStoryModeTotal
                  },
                  achievements: {
                    firstQuest: liveTotalPoints > 0,
                    cryptoNovice: liveTotalPoints >= 5,
                    blockchainExplorer: liveTotalPoints >= 20,
                    defiMaster: liveTotalPoints >= 50,
                    speedLearner: false,
                    perfectionist: false
                  },
                  total: liveTotalPoints
                },
                progress: {
                  completedNodes: userProgress?.completedNodes || [],
                  currentQuest: userProgress?.currentQuest || null,
                  level: Math.floor(liveTotalPoints / 10) + 1,
                  xp: liveTotalPoints * 10
                },
                settings: {
                  autoSync: true,
                  notifications: true
                }
              };
              
              // Try to use the automatic database integration service first
              let saveSuccess = false;
              
              // Method 1: Try using existing wallet-database integration
              if (typeof window !== 'undefined' && window.walletDatabaseIntegration) {
                try {
                  await window.walletDatabaseIntegration.updateUserPoints({
                    walletAddress: currentWallet,
                    points: userData.points
                  });
                  saveSuccess = true;
                } catch (integrationError) {
                  // Integration failed, will try GitHub API
                }
              }
              
              // Method 2: Use Server API Endpoint
              if (!saveSuccess) {
                try {
                  console.log('💾 Saving to database via server API...');
                  console.log('🌐 API Endpoint:', window.location.hostname);
                  
                  // Use relative URL when in development (proxy handles routing to :3334)
                  // Use absolute URL in production
                  const apiEndpoint = window.location.hostname === 'localhost' 
                    ? '' // Use proxy - requests go to same origin and proxy routes to :3334
                    : '';
                  
                  const fullUrl = `${apiEndpoint}/api/save-user-scores`;
                  console.log('📡 Making request to:', fullUrl);
                  console.log('📦 Request data:', { walletAddress: currentWallet, userData });
                  
                  const response = await fetch(fullUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      walletAddress: currentWallet,
                      userData: userData
                    })
                  });
                  
                  console.log('📨 Response status:', response.status);
                  console.log('📨 Response ok:', response.ok);
                  
                  if (response.ok) {
                    const result = await response.json();
                    
                    console.log('✅ Server save successful:', result);
                    
                    // Use the actual userData values that were saved to the database
                    const savedGamingTotal = Object.values(userData.points.gamingHub).reduce((sum, val) => sum + val, 0);
                    const savedStoryTotal = userData.points.storyMode.totalScore;
                    const savedTotalPoints = userData.points.total;
                    
                    setSuccessMessage(`Points Migration Successful!\n\nTotal Points: ${savedTotalPoints}\nGaming Hub: ${savedGamingTotal}\nStory Mode: ${savedStoryTotal}\n\nYour wallet data has been successfully saved to the database.\nMethod: ${result.data.saveMethod}\nAction: ${result.data.action}\n\nFuture points will automatically sync!`);
                    setShowSuccessModal(true);
                    
                    saveSuccess = true;
                    
                    // Clear ALL session storage immediately after successful save (fresh slate)
                    sessionStorage.removeItem('ccube_user_points');
                    sessionStorage.removeItem('ccube_user_wallet');
                    sessionStorage.removeItem('ccube_game_progress'); 
                    sessionStorage.removeItem('ccube_story_progress');
                    sessionStorage.removeItem('ccube_story_shuffle_seed');
                    sessionStorage.removeItem('ccube_session_active');
                    console.log('🧹 ALL session storage cleared immediately after save - fresh slate');
                    
                    // Refresh wallet scores to get the new database values
                    if (fetchWalletScores) {
                      console.log('🔄 Refreshing wallet scores to show current database state...');
                      await fetchWalletScores(currentWallet);
                      console.log('✅ Wallet scores refreshed - UI now shows current database values');
                    }
                    
                  } else {
                    const errorData = await response.json();
                    throw new Error(`Server save failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
                  }
                  
                } catch (serverError) {
                  console.error('❌ Server save failed with detailed error:', serverError);
                  console.error('❌ Error name:', serverError.name);
                  console.error('❌ Error message:', serverError.message);
                  console.error('❌ Error stack:', serverError.stack);
                  alert(`API Save Failed!\n\nError: ${serverError.message}\n\nCheck console for details. Falling back to manual save.`);
                  // Will fall through to Method 3 (manual download)
                }
              }
              
              // Method 3: Manual file creation instructions
              if (saveSuccess) {
                // Use the actual userData values that were saved to the database
                const savedGamingTotal = Object.values(userData.points.gamingHub).reduce((sum, val) => sum + val, 0);
                const savedStoryTotal = userData.points.storyMode.totalScore;
                const savedTotalPoints = userData.points.total;
                
                // Clear ALL session storage immediately after successful save (fresh slate)
                sessionStorage.removeItem('ccube_user_points');
                sessionStorage.removeItem('ccube_user_wallet');
                sessionStorage.removeItem('ccube_game_progress'); 
                sessionStorage.removeItem('ccube_story_progress');
                sessionStorage.removeItem('ccube_story_shuffle_seed');
                sessionStorage.removeItem('ccube_session_active');
                console.log('🧹 ALL session storage cleared immediately after save - fresh slate (Method 3)');
                
                // Refresh wallet scores to get the new database values
                if (fetchWalletScores) {
                  console.log('🔄 Refreshing wallet scores to show current database state (Method 3)...');
                  fetchWalletScores(currentWallet).then(() => {
                    console.log('✅ Wallet scores refreshed - UI now shows current database values (Method 3)');
                  }).catch((error) => {
                    console.error('❌ Error refreshing wallet scores (Method 3):', error);
                  });
                }
                
                setSuccessMessage(`Points Migration Successful!\n\nTotal Points: ${savedTotalPoints}\nGaming Hub: ${savedGamingTotal}\nStory Mode: ${savedStoryTotal}\n\nYour wallet data has been successfully saved.\nThe app will now sync automatically when you earn more points!`);
                setShowSuccessModal(true);
              } else {
                // Manual fallback with detailed instructions
                const fileContent = JSON.stringify(userData, null, 2);
                
                // No file download - only log to console
                
                // Use the actual userData values that were prepared for saving
                const savedGamingTotal = Object.values(userData.points.gamingHub).reduce((sum, val) => sum + val, 0);
                const savedStoryTotal = userData.points.storyMode.totalScore;
                const savedTotalPoints = userData.points.total;
                
                setSuccessMessage(`Manual Save Required\n\n📊 Total Points: ${savedTotalPoints}\n🎮 Gaming Hub: ${savedGamingTotal}\n📚 Story Mode: ${savedStoryTotal}\n\n� Manual Steps:\n1. A file "${currentWallet}.json" was downloaded\n2. Move it to: C_DataBase/users/Users_Scores/\n3. Your wallet will be recognized on next app restart!\n\n💡 Alternative: Copy data from browser console and create the file manually.`);
                setShowSuccessModal(true);
              }
              
            } catch (error) {
              console.error('❌ Error saving points to database:', error);
              setSuccessMessage(`Error Saving Points\n\nAn error occurred while saving your points to the database.\n\nError: ${error.message}\n\nPlease try again later or contact support if the issue persists.`);
              setShowSuccessModal(true);
            }
          }}
          style={{ 
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            marginRight: '20px'
          }}
        >
          💾 Save Points to Database
        </MigrateButton>

        {/* Clear All Points Button - For debugging */}
        <MigrateButton 
          onClick={() => {
            console.log('🗑️ Clearing all points and localStorage...');
            
            // Clear points and game progress but preserve story position
            sessionStorage.removeItem('ccube_user_points');
            sessionStorage.removeItem('ccube_game_progress');
            // DON'T clear story progress - user should retain their chapter/question position
            
            // Reset points using the reset function
            if (resetPoints) {
              resetPoints();
            }
            
            // Force page refresh to ensure clean state
            setTimeout(() => {
              window.location.reload();
            }, 500);
            
            alert('All points cleared! Page will refresh in 0.5 seconds to ensure clean state.');
          }}
          style={{ 
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            marginRight: '20px'
          }}
        >
          🗑️ Clear All Points & Refresh
        </MigrateButton>
        
        {(isWalletConnected || walletData) && (
          <>
            <MigrateButton 
              onClick={() => {
                const address = cCubeWalletData?.address || externalWalletData?.address || walletData?.address;
                if (address) {
                  checkTokenBalance(address);
                }
              }}
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                padding: '12px 24px',
                fontSize: '1rem'
              }}
            >
              🔄 Refresh Token Balance
            </MigrateButton>
            
            <MigrateButton 
              onClick={() => {
                const instructions = `🪙 Add LCUBE Token to Your Wallet\n\n` +
                  `📱 Copy this contract address:\n` +
                  `${CONTRACT_ADDRESS}\n\n` +
                  `🔧 Steps:\n` +
                  `1. Open your wallet app\n` +
                  `2. Find "Add Token" or "Custom Token"\n` +
                  `3. Paste the contract address above\n` +
                  `4. Symbol: LCUBE (auto-fills)\n` +
                  `5. Decimals: 18 (auto-fills)\n` +
                  `6. Confirm to add token\n\n` +
                  `✅ Your tokens will then be visible!`;
                
                navigator.clipboard.writeText(CONTRACT_ADDRESS);
                alert(instructions);
              }}
              style={{ 
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                padding: '12px 24px',
                fontSize: '1rem'
              }}
            >
              📋 How to Add LCUBE Token
            </MigrateButton>
          </>
        )}
        
        <MigrateButton 
          onClick={handleMigrate}
          disabled={!(isWalletConnected || walletData) || points.total === 0 || isMigrating}
        >
          {!(isWalletConnected || walletData) ? '🔒 Connect Wallet First (C-Cube or MetaMask)' : 
           isMigrating ? '🔄 Migrating to Your Wallet...' :
           points.total === 0 ? '🎯 No Points to Migrate' :
           'Migrate ' + points.total.toLocaleString() + ' Points to Wallet'}
        </MigrateButton>
      </MigrateButtonContainer>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModalOverlay onClick={() => setShowSuccessModal(false)}>
          <SuccessModalBox onClick={(e) => e.stopPropagation()}>
            <SuccessModalClose onClick={() => setShowSuccessModal(false)}>
              ×
            </SuccessModalClose>
            <SuccessModalContent>
              <SuccessModalTitle>
                {successMessage.includes('Successful') ? '🎉' : 
                 successMessage.includes('Failed') || successMessage.includes('Error') ? '❌' : 'ℹ️'}
                Points Migration
              </SuccessModalTitle>
              <SuccessModalMessage>{successMessage}</SuccessModalMessage>
            </SuccessModalContent>
          </SuccessModalBox>
        </SuccessModalOverlay>
      )}
    </MigrateMainContainer>
  );
};

export default MigratePointDashboard;