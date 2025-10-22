import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useWallet } from '../../context/WalletContext';
import progressTracker from '../../services/progressTracker';
import { validateAnswer, obfuscateDataForLogging } from '../../utils/answerSecurity';
import walletDatabaseIntegration from '../../services/walletDatabaseIntegration';

// Secure database service for fetching gaming hub questions
const fetchGamingHubData = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/cyfocube/C_DataBase/main/gaming-hub/questions.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const rawData = await response.json();
    
    // Transform the database structure to secure format with hashed answers
    const transformedData = {
      blockchain_fundamentals: [],
      cryptography_master: [],
      defi_adventure: [],
      smart_contract_creator: []
    };
    
    // Map database categories to our component's expected categories
    const categoryMapping = {
      'blockchain-basics': 'blockchain_fundamentals',
      'crypto-security': 'cryptography_master', 
      'defi-explorer': 'defi_adventure',
      'smart-contracts': 'smart_contract_creator'
    };
    
    if (rawData.gamingHub && rawData.gamingHub.categories) {
      rawData.gamingHub.categories.forEach(category => {
        const mappedCategory = categoryMapping[category.id];
        if (mappedCategory && category.questionSets) {
          // Transform question sets into secure format
          category.questionSets.forEach(questionSet => {
            const secureQuestion = {
              id: questionSet.id || `${category.id}_${Math.random().toString(36).substr(2, 9)}`,
              question: questionSet.question || questionSet.correctAnswers?.coreQuestion || 'Categorize blockchain concepts',
              dragItems: questionSet.dragItems || [
                ...(questionSet.correctAnswers?.coreItems || []),
                ...(questionSet.correctAnswers?.featuresItems || []),
                ...(questionSet.wrongAnswers || [])
              ],
              dropZones: questionSet.dropZones || [
                { id: 'core', label: 'Core Concepts', acceptedAnswerHashes: [] },
                { id: 'features', label: 'Key Features', acceptedAnswerHashes: [] }
              ],
              explanation: questionSet.explanation?.details || `Learn about ${category.title}`
            };
            transformedData[mappedCategory].push(secureQuestion);
          });
        }
      });
    }
    
    // Use obfuscated logging for security
    const logData = obfuscateDataForLogging(transformedData);
    console.log('📊 Secure database loaded:', logData);
    console.log('✅ SECURE DATABASE DATA LOADED SUCCESSFULLY FROM GITHUB!');
    return transformedData;
  } catch (error) {
    console.error('Error fetching secure gaming hub data:', error);
    // Fallback to local secure data
    try {
      const fallbackData = await import('../../data/secureQuestions.json');
      console.log('📦 Using local secure fallback data');
      return fallbackData.default?.gamingHub ? transformSecureData(fallbackData.default) : null;
    } catch (fallbackError) {
      console.error('Fallback data also failed:', fallbackError);
      return null;
    }
  }
};

// Transform secure database format to component format
const transformSecureData = (secureData) => {
  const transformedData = {
    blockchain_fundamentals: [],
    cryptography_master: [],
    defi_adventure: [],
    smart_contract_creator: []
  };
  
  const categoryMapping = {
    'blockchain-basics': 'blockchain_fundamentals',
    'crypto-security': 'cryptography_master', 
    'defi-explorer': 'defi_adventure',
    'smart-contracts': 'smart_contract_creator'
  };
  
  if (secureData.gamingHub && secureData.gamingHub.categories) {
    secureData.gamingHub.categories.forEach(category => {
      const mappedCategory = categoryMapping[category.id];
      if (mappedCategory && category.questionSets) {
        category.questionSets.forEach(questionSet => {
          transformedData[mappedCategory].push({
            id: questionSet.id,
            question: questionSet.question,
            dragItems: questionSet.dragItems,
            dropZones: questionSet.dropZones,
            explanation: questionSet.explanation?.details || `Learn about ${category.title}`
          });
        });
      }
    });
  }
  
  return transformedData;
};

const levelUp = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const questGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
  100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
`;

const spinLoader = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spinLoader} 1s linear infinite;
  margin: 1rem auto;
`;

const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f0f23, #1a1a2e);
  position: relative;
  overflow: auto;
  padding: 65px 20px 20px; /* Increased top padding by 5px more */
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: rgba(0, 0, 0, 0.5);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PlayerStats = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

const StatItem = styled.div`
  text-align: center;
  color: white;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.color || '#10b981'};
  animation: ${props => props.animate ? levelUp : 'none'} 0.5s ease;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
`;

const XPBar = styled.div`
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
`;

const XPFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #10b981);
  width: ${props => props.percentage}%;
  transition: width 0.5s ease;
`;

const QuestBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const QuestCard = styled.div`
  background: ${props => props.completed ? 
    'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))' :
    props.active ?
    'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.1))' :
    'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.completed ? '#10b981' : props.active ? '#4f46e5' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${props => props.pulse ? questGlow : 'none'} 2s infinite;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const QuestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const QuestTitle = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuestReward = styled.div`
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoIcon = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  cursor: help;
  position: relative;
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: normal;
    white-space: nowrap;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:hover::before {
    content: '';
    position: absolute;
    bottom: 110%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
    z-index: 1000;
  }
`;

const EducationalContainer = styled.div`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.8));
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  backdrop-filter: blur(10px);
`;

const EducationalHeader = styled.h4`
  color: #f1f5f9;
  margin: 0 0 16px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EducationalContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EducationalImage = styled.div`
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  border: 2px dashed rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 48px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EducationalText = styled.div`
  color: #e2e8f0;
  font-size: 14px;
  line-height: 1.6;
  
  h5 {
    color: #f1f5f9;
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
  }
  
  p {
    margin: 0 0 12px 0;
  }
  
  ul {
    margin: 0;
    padding-left: 16px;
  }
  
  li {
    margin-bottom: 4px;
  }
`;

const CelebrationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
`;

const CelebrationCard = styled.div`
  background: linear-gradient(135deg, #1e293b, #334155);
  border: 2px solid #10b981;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: celebrationBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  @keyframes celebrationBounce {
    0% {
      transform: scale(0.3) rotate(-10deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.05) rotate(2deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
`;

const CelebrationTitle = styled.h2`
  color: #10b981;
  font-size: 28px;
  margin: 0 0 16px 0;
  font-weight: 700;
`;

const CelebrationEmojis = styled.div`
  font-size: 60px;
  margin: 20px 0;
  animation: emojiFloat 2s ease-in-out infinite;
  
  @keyframes emojiFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(5deg); }
  }
`;

const CelebrationMessage = styled.p`
  color: #e2e8f0;
  font-size: 18px;
  margin: 20px 0;
  line-height: 1.5;
`;

const CelebrationStats = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
`;

const CelebrationButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
  }
`;

const FloatingEmoji = styled.div`
  position: absolute;
  font-size: 24px;
  pointer-events: none;
  animation: floatUp 3s ease-out forwards;
  
  @keyframes floatUp {
    0% {
      transform: translateY(0px) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(-200px) scale(0.5);
      opacity: 0;
    }
  }
`;

const QuestDescription = styled.p`
  color: #e5e7eb;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
`;

const QuestProgress = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin: 0 12px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #10b981);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ChallengeArea = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ChallengeTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DragDropArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 20px;
`;

const DragItems = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  min-height: 200px;
`;

const DropZones = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  min-height: 200px;
`;

const DragItem = styled.div`
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 8px 0;
  cursor: grab;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.95);
  }
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.filled ? '#10b981' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.filled ? 'rgba(16, 185, 129, 0.1)' : 'transparent'};
  transition: all 0.3s ease;
  font-size: 14px;
  color: ${props => props.filled ? '#10b981' : '#9ca3af'};
`;

const AchievementTrigger = styled.div`
  position: absolute;
  top: 80px;
  right: 20px;
  width: 250px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 6px;
  padding: 6px 12px;
  border: 1px solid rgba(79, 70, 229, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }
`;

const AchievementPanel = styled.div`
  position: absolute;
  top: 120px;
  right: 20px;
  width: 250px;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 400px;
  overflow-y: auto;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transform: translateY(${props => props.show ? '0' : '-10px'});
  transition: all 0.3s ease;
  z-index: 999;
  backdrop-filter: blur(10px);
`;

const Achievement = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  opacity: ${props => props.unlocked ? 1 : 0.4};
`;

const AchievementIcon = styled.div`
  font-size: 20px;
  filter: ${props => props.unlocked ? 'none' : 'grayscale(100%)'};
`;

const AchievementText = styled.div`
  flex: 1;
  font-size: 12px;
  color: white;
`;

const ChallengeNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const NavButton = styled.button`
  background: ${props => props.isComplete ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)'};
  border: 1px solid rgba(79, 70, 229, 0.5);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => props.shouldBlink && css`
    animation: ${blinkAnimation} 1s infinite;
  `}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ChallengeCounter = styled.div`
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
`;

const blinkAnimation = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
`;

const FeedbackMessage = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  ${props => props.type === 'success' && `
    background: rgba(16, 185, 129, 0.95);
    color: white;
    border: 2px solid #10b981;
  `}
  
  ${props => props.type === 'error' && `
    background: rgba(239, 68, 68, 0.95);
    color: white;
    border: 2px solid #ef4444;
  `}
  
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }
`;

const GamifiedLearningHub = ({ userProgress, setUserProgress, addPoints }) => {
  // Wallet integration
  const { walletAddress, isConnected } = useWallet();
  
  // Existing state
  const [activeQuest, setActiveQuest] = useState(null);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [databaseData, setDatabaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerXP, setPlayerXP] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZoneContents, setDropZoneContents] = useState({});
  const [showAchievements, setShowAchievements] = useState(false);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectionsMade, setSelectionsMade] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [usedItems, setUsedItems] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  
  // Progress tracking state
  const [walletProgress, setWalletProgress] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Load database data on component mount
  useEffect(() => {
    const loadDatabaseData = async () => {
      setIsLoading(true);
      const data = await fetchGamingHubData();
      setDatabaseData(data);
      setIsLoading(false);
    };
    
    loadDatabaseData();
  }, []);

  // Load wallet-based progress when wallet connects
  useEffect(() => {
    const loadWalletProgress = async () => {
      if (!walletAddress) {
        console.log('🔍 No wallet connected, using local session storage');
        setWalletProgress(null);
        return;
      }

      try {
        setIsLoadingProgress(true);
        console.log('🔍 Loading progress for wallet:', walletAddress);
        
        const progress = await progressTracker.getGamingHubProgress(walletAddress);
        setWalletProgress(progress);
        
        console.log('✅ Wallet progress loaded:', progress);
        
        // Show feedback to user
        if (progress.overallStats.totalQuestionsAttempted > 0) {
          setFeedback({
            type: 'success',
            message: `🎉 Welcome back! Found ${progress.overallStats.totalQuestionsAttempted} questions attempted with ${progress.overallStats.accuracyRate.toFixed(1)}% accuracy!`
          });
          setTimeout(() => setFeedback(null), 4000);
        } else {
          setFeedback({
            type: 'success',
            message: `🎮 Welcome! Starting your blockchain learning journey with wallet ${walletAddress.substring(0, 6)}...${walletAddress.substring(-4)}`
          });
          setTimeout(() => setFeedback(null), 3000);
        }
        
      } catch (error) {
        console.error('❌ Error loading wallet progress:', error);
        setFeedback({
          type: 'error',
          message: '⚠️ Could not load progress from wallet. Using local session instead.'
        });
        setTimeout(() => setFeedback(null), 3000);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadWalletProgress();
  }, [walletAddress]);

  // Auto-resume quest progress when wallet progress is loaded
  useEffect(() => {
    if (walletProgress && !activeQuest) {
      const resumeWalletProgress = async () => {
        // Find the quest with the most recent progress
        let mostRecentQuest = null;
        let mostRecentTime = 0;
        
        Object.entries(walletProgress.questProgress).forEach(([questId, questData]) => {
          if (questData.questStatus === 'in-progress' && questData.attemptedQuestions.length > 0) {
            const lastAttemptTime = new Date(questData.attemptedQuestions[questData.attemptedQuestions.length - 1].lastAttempt).getTime();
            if (lastAttemptTime > mostRecentTime) {
              mostRecentTime = lastAttemptTime;
              mostRecentQuest = { questId, questData };
            }
          }
        });
        
        if (mostRecentQuest) {
          const quest = quests.find(q => q.id === mostRecentQuest.questId);
          if (quest && !quest.locked) {
            console.log('🔄 Auto-resuming quest:', quest.title);
            
            // Get next uncompleted challenge
            const resumePoint = await progressTracker.getNextUncompletedChallenge(
              walletAddress, 
              mostRecentQuest.questId
            );
            
            setActiveQuest(quest);
            setCurrentChallengeIndex(resumePoint.challengeIndex);
            
            setFeedback({
              type: 'success',
              message: `🎯 Resuming "${quest.title}" from challenge ${resumePoint.challengeIndex + 1}`
            });
            setTimeout(() => setFeedback(null), 3000);
          }
        }
      };
      
      resumeWalletProgress();
    }
  }, [walletProgress, activeQuest, walletAddress]);

  // Initialize wallet-database integration
  useEffect(() => {
    const initializeWalletIntegration = async () => {
      try {
        // Initialize the wallet-database integration with the addPoints function
        await walletDatabaseIntegration.initialize(addPoints);
        console.log('🎮 Gaming Hub: Wallet-database integration initialized');
      } catch (error) {
        console.error('❌ Gaming Hub: Failed to initialize wallet integration:', error);
      }
    };

    if (addPoints) {
      initializeWalletIntegration();
    }
  }, [addPoints]);

  // Load game progress on component mount
  useEffect(() => {
    const savedGameProgress = sessionStorage.getItem('ccube_game_progress');
    if (savedGameProgress) {
      try {
        const gameData = JSON.parse(savedGameProgress);
        console.log('🎮 Loading saved game progress:', gameData);
        
        if (gameData.activeQuest) setActiveQuest(gameData.activeQuest);
        if (gameData.currentChallengeIndex !== undefined) setCurrentChallengeIndex(gameData.currentChallengeIndex);
        if (gameData.playerXP !== undefined) setPlayerXP(gameData.playerXP);
        if (gameData.playerLevel !== undefined) setPlayerLevel(gameData.playerLevel);
        if (gameData.dropZoneContents) setDropZoneContents(gameData.dropZoneContents);
        if (gameData.correctAnswers !== undefined) setCorrectAnswers(gameData.correctAnswers);
        if (gameData.totalQuestions !== undefined) setTotalQuestions(gameData.totalQuestions);
        if (gameData.usedItems) setUsedItems(gameData.usedItems);
        if (gameData.selectionsMade !== undefined) setSelectionsMade(gameData.selectionsMade);
        if (gameData.challengeComplete !== undefined) setChallengeComplete(gameData.challengeComplete);
      } catch (err) {
        console.error('Error loading game progress:', err);
        sessionStorage.removeItem('ccube_game_progress');
      }
    }
  }, []);

  // Save game progress whenever key states change
  useEffect(() => {
    if (activeQuest) {
      const gameData = {
        activeQuest,
        currentChallengeIndex,
        playerXP,
        playerLevel,
        dropZoneContents,
        correctAnswers,
        totalQuestions,
        usedItems,
        selectionsMade,
        challengeComplete,
        timestamp: new Date().toISOString()
      };
      
      console.log('💾 Saving game progress:', gameData);
      sessionStorage.setItem('ccube_game_progress', JSON.stringify(gameData));
    }
  }, [activeQuest, currentChallengeIndex, playerXP, playerLevel, dropZoneContents, 
      correctAnswers, totalQuestions, usedItems, selectionsMade, challengeComplete]);

  const quests = [
    {
      id: 'blockchain-basics',
      title: '📚 Blockchain Fundamentals',
      icon: '🎯',
      description: 'Master the core concepts of distributed ledger technology',
      difficulty: 'Beginner',
      order: 1,
      prerequisite: null,
      tasks: [
        'Learn what blockchain is',
        'Understand decentralization',
        'Complete hash function quiz',
        'Build your first block'
      ],
      completed: userProgress.completedNodes.includes('blockchain-basics-completed'),
      progress: Math.min((userProgress.completedNodes.filter(n => n.startsWith('blockchain-basics-challenge-')).length / 5) * 100, 100),
      locked: false
    },
    {
      id: 'crypto-security',
      title: '🔐 Cryptography Master',
      icon: '🛡️',
      description: 'Become an expert in blockchain security and cryptographic principles',
      difficulty: 'Intermediate',
      order: 2,
      prerequisite: 'blockchain-basics',
      tasks: [
        'Study digital signatures',
        'Practice hash calculations',
        'Understand public/private keys',
        'Complete security challenges'
      ],
      completed: userProgress.completedNodes.includes('crypto-security-completed'),
      progress: Math.min((userProgress.completedNodes.filter(n => n.startsWith('crypto-security-challenge-')).length / 5) * 100, 100),
      locked: (() => {
        const isLocked = !userProgress.completedNodes.includes('blockchain-basics-completed');
        console.log(`🔍 Checking crypto-security lock status: looking for 'blockchain-basics-completed' in:`, userProgress.completedNodes);
        console.log(`🔒 Crypto-security locked: ${isLocked}`);
        return isLocked;
      })()
    },
    {
      id: 'defi-explorer',
      title: '💰 DeFi Adventure',
      icon: '🏦',
      description: 'Explore the world of decentralized finance protocols',
      difficulty: 'Advanced',
      order: 3,
      prerequisite: 'crypto-security',
      tasks: [
        'Understand liquidity pools',
        'Learn about yield farming',
        'Master DEX mechanics',
        'Complete DeFi simulation'
      ],
      completed: userProgress.completedNodes.includes('defi-explorer-completed'),
      progress: Math.min((userProgress.completedNodes.filter(n => n.startsWith('defi-explorer-challenge-')).length / 5) * 100, 100),
      locked: !userProgress.completedNodes.includes('crypto-security-completed')
    },
    {
      id: 'smart-contracts',
      title: '📝 Smart Contract Creator',
      icon: '⚡',
      description: 'Learn to build and deploy smart contracts',
      difficulty: 'Expert',
      order: 4,
      prerequisite: 'defi-explorer',
      tasks: [
        'Write first smart contract',
        'Deploy on testnet',
        'Interact with contracts',
        'Audit for security'
      ],
      completed: userProgress.completedNodes.includes('smart-contracts-completed'),
      progress: Math.min((userProgress.completedNodes.filter(n => n.startsWith('smart-contracts-challenge-')).length / 5) * 100, 100),
      locked: !userProgress.completedNodes.includes('defi-explorer-completed')
    }
  ];

  const achievements = [
    { id: 'first-quest', name: 'First Steps', icon: '👶', description: 'Complete your first quest', unlocked: quests.some(q => q.completed) },
    { id: 'crypto-novice', name: 'Crypto Novice', icon: '🌱', description: 'Learn 5 concepts', unlocked: userProgress.completedNodes.length >= 5 },
    { id: 'blockchain-explorer', name: 'Explorer', icon: '🗺️', description: 'Complete 3 quests', unlocked: quests.filter(q => q.completed).length >= 3 },
    { id: 'defi-master', name: 'DeFi Master', icon: '💎', description: 'Master DeFi concepts', unlocked: userProgress.completedNodes.includes('defi-explorer') },
    { id: 'speed-learner', name: 'Speed Learner', icon: '⚡', description: 'Complete quest in under 10 minutes', unlocked: false },
    { id: 'perfectionist', name: 'Perfectionist', icon: '🎯', description: 'Get 100% on all quizzes', unlocked: false }
  ];

  const challengeSets = {
    'blockchain-basics': {
      difficulty: 'Beginner',
      pointsPerChallenge: 1.0,
      challenges: []
    },
    'crypto-security': {
      difficulty: 'Intermediate',
      pointsPerChallenge: 1.5,
      challenges: []
    },
    'defi-explorer': {
      difficulty: 'Advanced',
      pointsPerChallenge: 2.0,
      challenges: []
    },
    'smart-contracts': {
      difficulty: 'Expert',
      pointsPerChallenge: 2.5,
      challenges: []
    }
  };

  // Generate challenges for each difficulty level
  const generateChallenges = () => {
    // Clear existing challenges first
    challengeSets['blockchain-basics'].challenges = [];
    challengeSets['crypto-security'].challenges = [];
    challengeSets['defi-explorer'].challenges = [];
    challengeSets['smart-contracts'].challenges = [];
    
    // Use database data if available, otherwise fallback to hardcoded data
    let beginnerTopics, intermediateTopics, advancedTopics, expertTopics;
    
    if (databaseData && databaseData.blockchain_fundamentals) {
      // Transform database data to match expected format
      // Since database data is already structured as challenges, we need to extract dragItems
      beginnerTopics = databaseData.blockchain_fundamentals.length > 0 ? 
        databaseData.blockchain_fundamentals.map(challenge => challenge.dragItems || []) :
        [];
      
      intermediateTopics = databaseData.cryptography_master && databaseData.cryptography_master.length > 0 ?
        databaseData.cryptography_master.map(challenge => challenge.dragItems || []) :
        [];
        
      advancedTopics = databaseData.defi_adventure && databaseData.defi_adventure.length > 0 ?
        databaseData.defi_adventure.map(challenge => challenge.dragItems || []) :
        [];
        
      expertTopics = databaseData.smart_contract_creator && databaseData.smart_contract_creator.length > 0 ?
        databaseData.smart_contract_creator.map(challenge => challenge.dragItems || []) :
        [];
    }
    
    // // Fallback to hardcoded data if database data not available
    // if (!beginnerTopics || beginnerTopics.length === 0 || beginnerTopics.every(topic => !topic || topic.length === 0)) {
    //   beginnerTopics = [
    //     ['Block', 'Transaction', 'Hash', 'Chain', 'Node', 'Network'],
    //     ['Bitcoin', 'Ethereum', 'Litecoin', 'Dogecoin', 'Monero', 'Ripple'],
    //     ['Wallet', 'Address', 'Balance', 'Send', 'Receive', 'Fee'],
    //     ['Mining', 'Miner', 'Reward', 'Halving', 'Difficulty', 'Pool'],
    //     ['Peer-to-Peer', 'Decentralized', 'Distributed', 'Central', 'Authority', 'Trust']
    //   ];
    //   console.log('🔄 Using hardcoded beginner topics as fallback');
    // }

    // Ensure we have valid topic arrays before processing
    if (!beginnerTopics || !Array.isArray(beginnerTopics) || beginnerTopics.length === 0) {
      console.warn('⚠️ No beginner topics available - skipping blockchain-basics challenges');
      return;
    }

    for (let i = 0; i < 10; i++) {
      // Stop if we already have 10 challenges to prevent duplicates
      if (challengeSets['blockchain-basics'].challenges.length >= 10) break;
      
      const topicIndex = i % beginnerTopics.length;
      const items = beginnerTopics[topicIndex];
      // Only provide 3 items for 3 drop zones (2 zones, but one accepts 2 items, one accepts 1)
      const correctItems = [items[0], items[1], items[2]]; // 3 correct answers
      const wrongItems = [items[3], items[4]]; // 2 wrong answers
      const allItems = [...correctItems, ...wrongItems];
      
      challengeSets['blockchain-basics'].challenges.push({
        title: `Blockchain Basics ${i + 1}`,
        description: `Learn fundamental blockchain concepts - Challenge ${i + 1}:`,
        dragItems: allItems,
        dropZones: [
          { id: 'core', label: 'Core Concepts', accepts: [correctItems[0], correctItems[1]] },
          { id: 'features', label: 'Key Features', accepts: [correctItems[2]] }
        ],
        educational: {
          title: `Understanding ${correctItems[0]} and ${correctItems[1]}`,
          icon: '🔗',
          explanation: `This challenge focuses on core blockchain concepts. ${correctItems[0]} and ${correctItems[1]} are fundamental building blocks that make blockchain technology secure and decentralized.`,
          keyPoints: [
            `${correctItems[0]}: Essential component for blockchain functionality`,
            `${correctItems[1]}: Works together with ${correctItems[0]} to maintain security`,
            `${correctItems[2]}: A key feature that distinguishes blockchain from traditional systems`
          ]
        }
      });
    }

    // Crypto Security (Intermediate) - 50 challenges
    // if (!intermediateTopics || intermediateTopics.length === 0 || intermediateTopics.every(topic => !topic || topic.length === 0)) {
    //   intermediateTopics = [
    //     ['Private Key', 'Public Key', 'Digital Signature', 'Hash Function', 'Encryption', 'Decryption'],
    //     ['Seed Phrase', '2FA', 'Hardware Wallet', 'Multi-Signature', 'Cold Storage', 'Hot Wallet'],
    //     ['SHA-256', 'ECDSA', 'RSA', 'AES', 'Merkle Tree', 'Proof of Work'],
    //     ['Phishing', 'Malware', 'Social Engineering', 'Brute Force', 'Dictionary Attack', 'Key Logger'],
    //     ['SSL/TLS', 'VPN', 'Tor', 'Zero Knowledge', 'Ring Signature', 'Stealth Address']
    //   ];
    //   console.log('🔄 Using hardcoded intermediate topics as fallback');
    // }

    // Ensure we have valid intermediate topics before processing
    if (!intermediateTopics || !Array.isArray(intermediateTopics) || intermediateTopics.length === 0) {
      console.warn('⚠️ No intermediate topics available - skipping crypto-security challenges');
    } else {
      for (let i = 0; i < 50; i++) {
        const topicIndex = i % intermediateTopics.length;
        const items = intermediateTopics[topicIndex];
      // Only provide 3 items for 3 drop zones
      const correctItems = [items[0], items[1], items[2]]; // 3 correct answers
      const wrongItems = [items[3], items[4]]; // 2 wrong answers
      const allItems = [...correctItems, ...wrongItems];
      
      challengeSets['crypto-security'].challenges.push({
        title: `Cryptography Security ${i + 1}`,
        description: `Master cryptographic security concepts - Challenge ${i + 1}:`,
        dragItems: allItems,
        dropZones: [
          { id: 'security', label: 'Security Methods', accepts: [correctItems[0], correctItems[1]] },
          { id: 'protection', label: 'Protection Tools', accepts: [correctItems[2]] }
        ],
        educational: {
          title: `Security with ${correctItems[0]} and ${correctItems[1]}`,
          icon: '🔐',
          explanation: `This challenge explores critical cryptographic security concepts. ${correctItems[0]} and ${correctItems[1]} work together to create secure, tamper-proof digital transactions.`,
          keyPoints: [
            `${correctItems[0]}: Primary security mechanism in cryptographic systems`,
            `${correctItems[1]}: Complementary security feature for enhanced protection`,
            `${correctItems[2]}: Essential protection tool for maintaining system integrity`
          ]
        }
      });
      }
    }

    // DeFi Explorer (Advanced) - 50 challenges
    // if (!advancedTopics || advancedTopics.length === 0 || advancedTopics.every(topic => !topic || topic.length === 0)) {
    //   advancedTopics = [
    //     ['Uniswap', 'Compound', 'MakerDAO', 'Aave', 'Curve', 'SushiSwap'],
    //     ['Liquidity Pool', 'Staking', 'LP Tokens', 'Yield Farming', 'Impermanent Loss', 'APY'],
    //     ['DEX', 'AMM', 'Order Book', 'Slippage', 'Front Running', 'MEV'],
    //     ['Flash Loan', 'Arbitrage', 'Liquidation', 'Collateral', 'Over-collateralized', 'Under-collateralized'],
    //     ['Governance Token', 'DAO', 'Proposal', 'Voting', 'Treasury', 'Protocol Fee']
    //   ];
    //   console.log('🔄 Using hardcoded advanced topics as fallback');
    // }

    // Ensure we have valid advanced topics before processing
    if (!advancedTopics || !Array.isArray(advancedTopics) || advancedTopics.length === 0) {
      console.warn('⚠️ No advanced topics available - skipping defi-explorer challenges');
    } else {
      for (let i = 0; i < 50; i++) {
        const topicIndex = i % advancedTopics.length;
        const items = advancedTopics[topicIndex];
      // Only provide 3 items for 3 drop zones
      const correctItems = [items[0], items[1], items[2]]; // 3 correct answers
      const wrongItems = [items[3], items[4]]; // 2 wrong answers
      const allItems = [...correctItems, ...wrongItems];
      
      challengeSets['defi-explorer'].challenges.push({
        title: `DeFi Mastery ${i + 1}`,
        description: `Explore advanced DeFi concepts - Challenge ${i + 1}:`,
        dragItems: allItems,
        dropZones: [
          { id: 'protocols', label: 'DeFi Protocols', accepts: [correctItems[0], correctItems[1]] },
          { id: 'mechanisms', label: 'Core Mechanisms', accepts: [correctItems[2]] }
        ],
        educational: {
          title: `DeFi Protocols: ${correctItems[0]} and ${correctItems[1]}`,
          icon: '🏦',
          explanation: `This challenge covers advanced DeFi ecosystem components. ${correctItems[0]} and ${correctItems[1]} are leading protocols that enable decentralized financial services without traditional intermediaries.`,
          keyPoints: [
            `${correctItems[0]}: Revolutionary DeFi protocol changing traditional finance`,
            `${correctItems[1]}: Complementary protocol that enhances DeFi ecosystem`,
            `${correctItems[2]}: Core mechanism that enables seamless DeFi operations`
          ]
        }
      });
      }
    }

    // Smart Contracts (Expert) - 50 challenges
    // if (!expertTopics || expertTopics.length === 0 || expertTopics.every(topic => !topic || topic.length === 0)) {
    //   expertTopics = [
    //     ['Solidity', 'Gas', 'ABI', 'Bytecode', 'Remix', 'Truffle'],
    //     ['Reentrancy Guard', 'Access Control', 'Overflow Protection', 'Audit', 'Formal Verification', 'Bug Bounty'],
    //     ['ERC-20', 'ERC-721', 'ERC-1155', 'Interface', 'Abstract Contract', 'Library'],
    //     ['Proxy Pattern', 'Diamond Pattern', 'Factory Pattern', 'Singleton', 'Registry', 'Upgrade'],
    //     ['Chainlink', 'Oracle', 'Price Feed', 'VRF', 'Automation', 'Cross-chain']
    //   ];
    //   console.log('🔄 Using hardcoded expert topics as fallback');
    // }

    // Ensure we have valid expert topics before processing
    if (!expertTopics || !Array.isArray(expertTopics) || expertTopics.length === 0) {
      console.warn('⚠️ No expert topics available - skipping smart-contracts challenges');
    } else {
      for (let i = 0; i < 50; i++) {
        const topicIndex = i % expertTopics.length;
        const items = expertTopics[topicIndex];
      // Only provide 3 items for 3 drop zones
      const correctItems = [items[0], items[1], items[2]]; // 3 correct answers
      const wrongItems = [items[3], items[4]]; // 2 wrong answers
      const allItems = [...correctItems, ...wrongItems];
      
      challengeSets['smart-contracts'].challenges.push({
        title: `Smart Contract Expert ${i + 1}`,
        description: `Master smart contract development - Challenge ${i + 1}:`,
        dragItems: allItems,
        dropZones: [
          { id: 'development', label: 'Development Tools', accepts: [correctItems[0], correctItems[1]] },
          { id: 'advanced', label: 'Advanced Concepts', accepts: [correctItems[2]] }
        ],
        educational: {
          title: `Smart Contract Development: ${correctItems[0]} and ${correctItems[1]}`,
          icon: '📝',
          explanation: `This challenge focuses on expert-level smart contract development. ${correctItems[0]} and ${correctItems[1]} are essential tools and concepts for building secure, efficient smart contracts.`,
          keyPoints: [
            `${correctItems[0]}: Fundamental development tool for smart contract creation`,
            `${correctItems[1]}: Advanced development concept for professional contract building`,
            `${correctItems[2]}: Expert-level concept that ensures contract reliability and security`
          ]
        }
      });
      }
    }
  };

  // Generate all challenges only once, but wait for database data to load
  if (!isLoading && databaseData && challengeSets['blockchain-basics'].challenges.length === 0) {
    generateChallenges();
    // Ensure blockchain-basics has exactly 10 challenges
    challengeSets['blockchain-basics'].challenges = challengeSets['blockchain-basics'].challenges.slice(0, 10);
  }

  const challenges = activeQuest ? challengeSets[activeQuest.id]?.challenges || [] : [
    {
      title: 'Select a Quest',
      description: 'Choose a quest from the list above to start learning:',
      dragItems: [],
      dropZones: []
    }
  ];

  const currentChallenge = challenges[currentChallengeIndex];

  const handleQuestClick = async (quest) => {
    // Prevent clicking on locked quests
    if (quest.locked) {
      const prerequisiteQuest = quests.find(q => q.id === quest.prerequisite);
      setFeedback({ 
        type: 'error', 
        message: `🔒 Complete "${prerequisiteQuest?.title}" first to unlock this quest!` 
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    console.log('🎯 Quest clicked:', quest.title);
    setActiveQuest(quest);
    
    // Check wallet progress first, then fallback to session storage
    let shouldResetToStart = true;
    let resumePoint = { challengeIndex: 0, isFirstTime: true };
    
    if (walletAddress && walletProgress) {
      try {
        console.log('🔍 Checking wallet progress for quest:', quest.id);
        resumePoint = await progressTracker.getNextUncompletedChallenge(walletAddress, quest.id);
        
        if (!resumePoint.isFirstTime) {
          console.log('📥 Resuming wallet progress for quest:', quest.title, 'Challenge:', resumePoint.challengeIndex + 1);
          shouldResetToStart = false;
          
          setFeedback({
            type: 'success',
            message: `📚 Resuming from challenge ${resumePoint.challengeIndex + 1} of ${quest.title}`
          });
          setTimeout(() => setFeedback(null), 3000);
        }
      } catch (error) {
        console.error('❌ Error checking wallet progress:', error);
      }
    }
    
    // Fallback to session storage if no wallet progress
    if (shouldResetToStart && !walletAddress) {
      const savedGameProgress = sessionStorage.getItem('ccube_game_progress');
      
      if (savedGameProgress) {
        try {
          const gameData = JSON.parse(savedGameProgress);
          if (gameData.activeQuest && gameData.activeQuest.id === quest.id) {
            console.log('📥 Resuming session progress for quest:', quest.title);
            shouldResetToStart = false;
            resumePoint.challengeIndex = gameData.currentChallengeIndex || 0;
          }
        } catch (err) {
          console.error('Error checking saved progress:', err);
        }
      }
    }
    
    if (shouldResetToStart) {
      console.log('🔄 Starting fresh quest:', quest.title);
      // Reset to start from beginning
      setCurrentChallengeIndex(0);
      setDropZoneContents({});
      setSelectionsMade(0);
      setChallengeComplete(false);
      setUsedItems([]);
      setCorrectAnswers(0);
      setTotalQuestions(0);
      setPlayerXP(0);
      setPlayerLevel(1);
      
      // Mark quest as started for session storage compatibility
      const questStartedKey = `quest-started-${quest.id}`;
      const hasBeenStarted = userProgress.completedNodes.includes(questStartedKey);
      
      if (!quest.completed && !hasBeenStarted) {
        setUserProgress(prev => ({
          ...prev,
          completedNodes: [...prev.completedNodes, questStartedKey]
        }));
      }
      
      if (walletAddress) {
        setFeedback({
          type: 'success',
          message: `🎮 Starting ${quest.title} - progress will be saved to your wallet!`
        });
        setTimeout(() => setFeedback(null), 3000);
      }
    } else {
      console.log('✅ Continuing saved quest progress from challenge:', resumePoint.challengeIndex + 1);
      // Resume from saved progress
      setCurrentChallengeIndex(resumePoint.challengeIndex);
      setDropZoneContents({});
      setSelectionsMade(0);
      setChallengeComplete(false);
      setUsedItems([]);
      
      // Restore some session state if available
      if (resumePoint.attemptedQuestions) {
        setCorrectAnswers(resumePoint.attemptedQuestions.filter(q => q.isCorrect).length);
        setTotalQuestions(resumePoint.attemptedQuestions.length);
      }
    }
  };

  // Generate floating celebration emojis
  const generateFloatingEmojis = () => {
    const celebrationEmojis = ['🎉', '🎊', '✨', '🌟', '🎈', '🏆', '👏', '🎯', '💫', '🎆'];
    const newEmojis = [];
    
    for (let i = 0; i < 20; i++) {
      newEmojis.push({
        id: Date.now() + i,
        emoji: celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)],
        left: Math.random() * 100,
        animationDelay: Math.random() * 2
      });
    }
    
    setFloatingEmojis(newEmojis);
    
    // Clear emojis after animation
    setTimeout(() => setFloatingEmojis([]), 3000);
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    setCelebrationData(null);
  };

  const handleNextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      // Mark current challenge as completed
      if (activeQuest && challengeComplete) {
        // Use consistent key format for both tracking and checking
        const challengeKey = `${activeQuest.id}-challenge-${currentChallengeIndex}`;
        
        if (!userProgress.completedNodes.includes(challengeKey)) {
          // Award points based on challenge accuracy (only once per challenge)
          if (addPoints) {
            // Calculate challenge accuracy: correct answers in this completed challenge
            const completedChallengeDropZones = challenges[currentChallengeIndex].dropZones;
            let correctInThisChallenge = 0;
            
            // Count correct answers in the completed challenge
            completedChallengeDropZones.forEach(zone => {
              const content = dropZoneContents[zone.id];
              if (content && content.length > 0 && content[0].isCorrect) {
                correctInThisChallenge++;
              }
            });
            
            // Calculate points based on accuracy:
            // 2/2 correct = 1 point, 1/2 correct = 0.5 points, 0/2 correct = 0 points
            const totalQuestionsInChallenge = completedChallengeDropZones.length;
            const challengePoints = correctInThisChallenge / totalQuestionsInChallenge;
            
            // Award points (including 0 points for 0 correct answers)
            switch (activeQuest.id) {
              case 'blockchain-basics':
                addPoints('gamingHub', 'blockchainBasics', challengePoints);
                break;
              case 'crypto-security':
                addPoints('gamingHub', 'smartContracts', challengePoints);
                break;
              case 'defi-explorer':
                addPoints('gamingHub', 'defiProtocols', challengePoints);
                break;
              case 'nft-creator':
                addPoints('gamingHub', 'nftsWeb3', challengePoints);
                break;
              default:
                addPoints('gamingHub', 'blockchainBasics', challengePoints);
            }
            
            console.log(`🎯 Challenge ${currentChallengeIndex + 1} completed! ${correctInThisChallenge}/${totalQuestionsInChallenge} correct = ${challengePoints} points awarded.`);
          }
          
          // Mark this specific challenge as completed
          setUserProgress(prev => ({
            ...prev,
            completedNodes: [...prev.completedNodes, challengeKey]
          }));
        } else {
          console.log(`⚠️ Challenge ${currentChallengeIndex + 1} already completed - no additional points awarded.`);
        }
        console.log(`✅ Challenge ${currentChallengeIndex + 1} of "${activeQuest.title}" completed!`);
      }
      
      setCurrentChallengeIndex(prev => prev + 1);
      setDropZoneContents({});
      setSelectionsMade(0);
      setChallengeComplete(false);
      setUsedItems([]);
    } else if (activeQuest && currentChallengeIndex === challenges.length - 1) {
      // Mark final challenge as completed
      if (challengeComplete) {
        // Use consistent key format for final challenge
        const finalChallengeKey = `${activeQuest.id}-challenge-${currentChallengeIndex}`;
        const questCompletionKey = `${activeQuest.id}-quest-completed`;
        
        // Check if both the final challenge AND quest completion haven't been tracked yet
        if (!userProgress.completedNodes.includes(finalChallengeKey) && !userProgress.completedNodes.includes(questCompletionKey)) {
          // Award points for completing the final challenge based on accuracy (only once per quest)
          if (addPoints) {
            // Calculate final challenge accuracy
            const finalChallengeDropZones = challenges[currentChallengeIndex].dropZones;
            let correctInFinalChallenge = 0;
            
            // Count correct answers in final challenge
            finalChallengeDropZones.forEach(zone => {
              const content = dropZoneContents[zone.id];
              if (content && content.length > 0 && content[0].isCorrect) {
                correctInFinalChallenge++;
              }
            });
            
            // Calculate points based on accuracy:
            // 2/2 correct = 1 point, 1/2 correct = 0.5 points, 0/2 correct = 0 points
            const totalQuestionsInFinalChallenge = finalChallengeDropZones.length;
            const finalChallengePoints = correctInFinalChallenge / totalQuestionsInFinalChallenge;
            
            // Award final challenge points (no additional bonus, just the challenge points)
            switch (activeQuest.id) {
              case 'blockchain-basics':
                addPoints('gamingHub', 'blockchainBasics', finalChallengePoints);
                break;
              case 'crypto-security':
                addPoints('gamingHub', 'smartContracts', finalChallengePoints);
                break;
              case 'defi-explorer':
                addPoints('gamingHub', 'defiProtocols', finalChallengePoints);
                break;
              case 'nft-creator':
                addPoints('gamingHub', 'nftsWeb3', finalChallengePoints);
                break;
              default:
                addPoints('gamingHub', 'blockchainBasics', finalChallengePoints);
            }
            
            console.log(`🏁 Quest "${activeQuest.title}" completed! Final challenge: ${correctInFinalChallenge}/${totalQuestionsInFinalChallenge} correct = ${finalChallengePoints} points awarded.`);
          }
          
          // Mark both the final challenge and quest as completed
          setUserProgress(prev => ({
            ...prev,
            completedNodes: [...prev.completedNodes, finalChallengeKey, questCompletionKey]
          }));
        } else {
          console.log(`⚠️ Quest "${activeQuest.title}" already completed - no additional points awarded.`);
        }
      }
      
      // Quest completed! Mark as completed and award bonus XP
      const questCompletedKey = `${activeQuest.id}-completed`;
      if (!userProgress.completedNodes.includes(questCompletedKey)) {
        // Calculate bonus based on accuracy: (correct answers / total questions) * 50
        const accuracyRatio = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
        const bonusXP = Math.round(accuracyRatio * 50);
        setPlayerXP(prev => prev + bonusXP);
        
        setUserProgress(prev => {
          const newCompletedNodes = [...prev.completedNodes, questCompletedKey];
          console.log(`🔓 Quest completion key saved: "${questCompletedKey}"`);
          console.log(`📝 All completed nodes:`, newCompletedNodes);
          return {
            ...prev,
            completedNodes: newCompletedNodes
          };
        });

        // Points already awarded in final challenge section above - no additional points needed here
        console.log('🎉 Quest completion bonus XP awarded, points already tracked per challenge');
        
        // Show celebration instead of regular feedback
        setCelebrationData({
          questTitle: activeQuest.title,
          accuracy: Math.round(accuracyRatio * 100),
          bonusXP: bonusXP,
          correctAnswers: correctAnswers,
          totalQuestions: totalQuestions,
          questIcon: activeQuest.icon
        });
        setShowCelebration(true);
        
        // Generate floating emojis
        generateFloatingEmojis();
        
        // Unlock next quest
        const nextQuest = quests.find(q => q.prerequisite === activeQuest.id);
        if (nextQuest) {
          setTimeout(() => {
            setFeedback({ 
              type: 'success', 
              message: `🔓 "${nextQuest.title}" is now unlocked!` 
            });
            setTimeout(() => setFeedback(null), 3000);
          }, 4000);
        }
      }
    }
  };

  const handleRestartGame = () => {
    console.log('🔄 Restarting game - clearing all progress');
    
    setCurrentChallengeIndex(0);
    setDropZoneContents({});
    setPlayerXP(0);
    setPlayerLevel(1);
    setFeedback(null);
    setSelectionsMade(0);
    setChallengeComplete(false);
    setUsedItems([]);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setShowCelebration(false);
    setCelebrationData(null);
    setFloatingEmojis([]);
    setActiveQuest(null);
    
    // Clear saved game progress
    sessionStorage.removeItem('ccube_game_progress');
    
    // Reset all progress - clear completed nodes to reset progress bars
    setUserProgress({
      completedNodes: []
    });
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    
    // Check if challenge is already complete
    if (challengeComplete) return;
    
    // Check if this drop zone already has an item (can only fill once)
    if (dropZoneContents[zoneId] && dropZoneContents[zoneId].length > 0) {
      setFeedback({ type: 'error', message: '❌ This space is already filled!' });
      setTimeout(() => setFeedback(null), 2000);
      setDraggedItem(null);
      return;
    }
    
    const zone = currentChallenge.dropZones.find(z => z.id === zoneId);
    const newSelectionCount = selectionsMade + 1;
    const totalDropZones = currentChallenge.dropZones.length;
    
    // Secure answer validation using hashes
    let isCorrectAnswer = false;
    
    if (zone) {
      if (zone.acceptedAnswerHashes && zone.acceptedAnswerHashes.length > 0) {
        // Use secure hash-based validation
        const questionId = currentChallenge.id || `${activeQuest?.id || 'unknown'}_q${currentChallengeIndex + 1}`;
        isCorrectAnswer = zone.acceptedAnswerHashes.some(hash => 
          validateAnswer(draggedItem, questionId + '_' + zoneId, hash)
        );
      } else if (zone.accepts) {
        // Fallback to legacy validation (less secure)
        isCorrectAnswer = zone.accepts.includes(draggedItem);
        if (process.env.NODE_ENV === 'development') {
          console.warn('🔓 Using legacy validation - consider upgrading to hash-based validation');
        }
      }
    }
    
    // Always fill the space with the item
    setDropZoneContents(prev => ({
      ...prev,
      [zoneId]: [{ item: draggedItem, isCorrect: isCorrectAnswer }]
    }));
    
    // Mark item as used
    setUsedItems(prev => [...prev, draggedItem]);
    
    if (isCorrectAnswer) {
      // Track correct answer
      setCorrectAnswers(prev => prev + 1);
      
      // Award XP based on difficulty level - points distributed per challenge divided by number of questions
      const pointsPerChallenge = activeQuest ? challengeSets[activeQuest.id]?.pointsPerChallenge || 1.0 : 1.0;
      const questionsCount = currentChallenge.dropZones.length;
      const pointsPerQuestion = pointsPerChallenge / questionsCount;
      setPlayerXP(prev => prev + pointsPerQuestion);
      
      // Show success feedback with points
      setFeedback({ type: 'success', message: `✅ Correct! +${pointsPerQuestion.toFixed(1)} XP!` });
      setTimeout(() => setFeedback(null), 2000);
    } else {
      // Show error feedback for incorrect placement
      setFeedback({ type: 'error', message: '❌ Incorrect placement. Try again!' });
      setTimeout(() => setFeedback(null), 2000);
    }
    
    // Track total questions answered
    setTotalQuestions(prev => prev + 1);
    
    // Save progress to wallet if connected
    if (walletAddress && activeQuest) {
      const saveProgressAsync = async () => {
        try {
          const questionId = `${activeQuest.id}-challenge-${currentChallengeIndex}-question-${zoneId}`;
          const isChallengeComplete = newSelectionCount >= totalDropZones;
          
          await progressTracker.saveGamingHubProgress(
            walletAddress,
            activeQuest.id,
            currentChallengeIndex,
            {
              questionId: questionId,
              isCorrect: isCorrectAnswer,
              userAnswer: draggedItem,
              correctAnswers: zone.accepts || [],
              challengeComplete: isChallengeComplete,
              timestamp: new Date().toISOString()
            }
          );
          
          console.log('💾 Progress saved to wallet:', {
            quest: activeQuest.id,
            challenge: currentChallengeIndex,
            question: zoneId,
            correct: isCorrectAnswer
          });
          
        } catch (error) {
          console.error('❌ Error saving progress to wallet:', error);
        }
      };
      
      saveProgressAsync();
    }
    
    // Update selections made
    setSelectionsMade(newSelectionCount);
    
    // Check if challenge is complete (all drop zones filled)
    if (newSelectionCount >= totalDropZones) {
      setChallengeComplete(true);
      setFeedback({ type: 'success', message: '🎉 All questions answered! Click Next to continue.' });
      setTimeout(() => setFeedback(null), 3000);
    }
    
    setDraggedItem(null);
  };

  // Calculate level based on XP
  useEffect(() => {
    const newLevel = Math.floor(playerXP / 100) + 1;
    if (newLevel > playerLevel) {
      setPlayerLevel(newLevel);
    }
  }, [playerXP, playerLevel]);

  const xpForNextLevel = playerLevel * 100;
  const xpProgress = (playerXP % 100);

  // Calculate actual gaming hub points for display (should match migrate points)
  const calculateGamingHubPoints = () => {
    try {
      const savedPoints = sessionStorage.getItem('ccube_user_points');
      if (savedPoints) {
        const pointsData = JSON.parse(savedPoints);
        if (pointsData.gamingHub) {
          return Object.values(pointsData.gamingHub).reduce((sum, val) => sum + val, 0);
        }
      }
    } catch (e) {
      console.error('Error reading gaming hub points:', e);
    }
    return 0;
  };

  const totalGamingHubPoints = calculateGamingHubPoints();

  // Show loading state while fetching database data
  if (isLoading) {
    return (
      <GameContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Loading Gaming Hub...</h2>
          <LoadingSpinner />
          <p>Fetching the latest challenges...</p>
        </div>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      {feedback && (
        <FeedbackMessage type={feedback.type}>
          {feedback.message}
        </FeedbackMessage>
      )}
      <GameHeader>
        <PlayerStats>
          <StatItem>
            <StatValue color="#4f46e5">{playerLevel}</StatValue>
            <StatLabel>Level</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{totalGamingHubPoints}</StatValue>
            <StatLabel>Total Points</StatLabel>
            <XPBar>
              <XPFill percentage={xpProgress} />
            </XPBar>
          </StatItem>
          <StatItem>
            <StatValue color="#f59e0b">{achievements.filter(a => a.unlocked).length}</StatValue>
            <StatLabel>Achievements</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue color="#10b981">{quests.filter(q => q.completed).length}/{quests.length}</StatValue>
            <StatLabel>Quests Complete</StatLabel>
          </StatItem>
        </PlayerStats>
        
        {/* Wallet Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isLoadingProgress && (
            <div style={{ color: '#fbbf24', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid transparent',
                borderTop: '2px solid #fbbf24',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Loading Progress...
            </div>
          )}
          
          {walletAddress && walletProgress && (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>💾</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(-4)}
                </div>
                <div style={{ opacity: 0.8 }}>
                  {walletProgress.overallStats.totalQuestionsAttempted} questions | {walletProgress.overallStats.accuracyRate.toFixed(1)}% accuracy
                </div>
              </div>
            </div>
          )}
          
          {!walletAddress && (
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>No Wallet Connected</div>
                <div style={{ opacity: 0.8 }}>Progress saved locally only</div>
              </div>
            </div>
          )}
        </div>
      </GameHeader>

      <QuestBoard>
        {quests.map(quest => (
          <QuestCard
            key={quest.id}
            completed={quest.completed}
            active={activeQuest?.id === quest.id}
            pulse={quest.progress > 0 && !quest.completed}
            locked={quest.locked}
            onClick={() => handleQuestClick(quest)}
            style={{
              opacity: quest.locked ? 0.5 : 1,
              cursor: quest.locked ? 'not-allowed' : 'pointer',
              filter: quest.locked ? 'grayscale(0.7)' : 'none'
            }}
          >
            <QuestHeader>
              <QuestTitle>
                {quest.locked ? '🔒' : quest.icon} {quest.title}
                {quest.locked && (
                  <span style={{ fontSize: '10px', color: '#ef4444', marginLeft: '8px' }}>
                    LOCKED
                  </span>
                )}
              </QuestTitle>
            </QuestHeader>
            
            <QuestDescription>
              {quest.locked 
                ? `Complete "${quests.find(q => q.id === quest.prerequisite)?.title}" to unlock this quest`
                : quest.description
              }
            </QuestDescription>
            
            <QuestProgress>
              <span>{quest.difficulty}</span>
              <ProgressBar>
                <ProgressFill percentage={quest.locked ? 0 : quest.progress} />
              </ProgressBar>
              <span>{quest.locked ? '0' : quest.progress}%</span>
            </QuestProgress>
          </QuestCard>
        ))}
      </QuestBoard>

      <ChallengeArea>
        <ChallengeTitle>
          🧩 {currentChallenge.title}
          {activeQuest && (
            <span style={{ 
              fontSize: '12px', 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              padding: '4px 8px', 
              borderRadius: '4px',
              marginLeft: '12px'
            }}>
              {challengeSets[activeQuest.id]?.difficulty} • +{challengeSets[activeQuest.id]?.pointsPerChallenge} XP per challenge
            </span>
          )}
        </ChallengeTitle>
        <p style={{ color: '#e5e7eb', fontSize: '14px', margin: '0 0 16px 0' }}>
          {currentChallenge.description}
        </p>

        <ChallengeNavigation>
          <NavButton 
            onClick={handleRestartGame}
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            🔄 Restart Game
          </NavButton>
          
          <ChallengeCounter>
            Challenge {currentChallengeIndex + 1} of {challenges.length}
          </ChallengeCounter>
          
          <NavButton 
            onClick={handleNextChallenge}
            disabled={!challengeComplete}
            shouldBlink={challengeComplete}
            isComplete={challengeComplete}
          >
            {currentChallengeIndex === challenges.length - 1 ? 'Complete Quest!' : 'Next →'}
          </NavButton>
        </ChallengeNavigation>

        <DragDropArea>
          <DragItems>
            <h4 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px' }}>Components</h4>
            {currentChallenge.dragItems.map(item => {
              const isUsed = usedItems.includes(item);
              const isDisabled = challengeComplete || isUsed;
              
              return (
                <DragItem
                  key={item}
                  draggable={!isDisabled}
                  onDragStart={isDisabled ? null : (e) => handleDragStart(e, item)}
                  style={{ 
                    opacity: isDisabled ? 0.3 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'grab',
                    textDecoration: isUsed ? 'line-through' : 'none'
                  }}
                >
                  {item} {isUsed ? '✓' : ''}
                </DragItem>
              );
            })}
          </DragItems>

          <DropZones>
            <h4 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px' }}>Assembly Areas</h4>
            {currentChallenge.dropZones.map(zone => (
              <DropZone
                key={zone.id}
                filled={dropZoneContents[zone.id]?.length > 0}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, zone.id)}
              >
                {dropZoneContents[zone.id]?.length > 0 ? (
                  <div>
                    <strong>{zone.label}</strong><br/>
                    {dropZoneContents[zone.id].map((itemObj, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          marginTop: '8px',
                          padding: '8px',
                          borderRadius: '4px',
                          background: itemObj.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          border: `2px solid ${itemObj.isCorrect ? '#10b981' : '#ef4444'}`,
                          color: itemObj.isCorrect ? '#10b981' : '#ef4444',
                          fontWeight: '600',
                          cursor: 'default',
                          transition: 'all 0.2s ease'
                        }}
                        title={itemObj.isCorrect ? 'Correct answer!' : 'Incorrect answer'}
                      >
                        {itemObj.isCorrect ? '✅' : '❌'} {itemObj.item}
                      </div>
                    ))}
                  </div>
                ) : (
                  `Drop items for ${zone.label}`
                )}
              </DropZone>
            ))}
          </DropZones>
        </DragDropArea>

        {/* Educational Container */}
        {currentChallenge.educational && (
          <EducationalContainer>
            <EducationalHeader>
              {currentChallenge.educational.icon} {currentChallenge.educational.title}
            </EducationalHeader>
            <EducationalContent>
              <EducationalImage>
                {currentChallenge.educational.icon}
              </EducationalImage>
              <EducationalText>
                <h5>What you're learning:</h5>
                <p>{currentChallenge.educational.explanation}</p>
                <h5>Key Points:</h5>
                <ul>
                  {currentChallenge.educational.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </EducationalText>
            </EducationalContent>
          </EducationalContainer>
        )}
      </ChallengeArea>

      <AchievementTrigger
        onMouseEnter={() => setShowAchievements(true)}
        onMouseLeave={() => setShowAchievements(false)}
      >
        <span style={{ color: 'white', margin: '0', fontSize: '0.65rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
          🏆 Achievements
        </span>
      </AchievementTrigger>

      <AchievementPanel 
        show={showAchievements}
        onMouseEnter={() => setShowAchievements(true)}
        onMouseLeave={() => setShowAchievements(false)}
      >
        {achievements.map(achievement => (
          <Achievement key={achievement.id} unlocked={achievement.unlocked}>
            <AchievementIcon unlocked={achievement.unlocked}>
              {achievement.icon}
            </AchievementIcon>
            <AchievementText>
              <div style={{ fontWeight: 600 }}>{achievement.name}</div>
              <div style={{ opacity: 0.7, fontSize: '11px' }}>{achievement.description}</div>
            </AchievementText>
          </Achievement>
        ))}
      </AchievementPanel>

      {/* Floating Emojis */}
      {floatingEmojis.map(emoji => (
        <FloatingEmoji
          key={emoji.id}
          style={{
            left: `${emoji.left}%`,
            top: '80%',
            animationDelay: `${emoji.animationDelay}s`
          }}
        >
          {emoji.emoji}
        </FloatingEmoji>
      ))}

      {/* Celebration Modal */}
      {showCelebration && celebrationData && (
        <CelebrationOverlay onClick={handleCelebrationClose}>
          <CelebrationCard onClick={(e) => e.stopPropagation()}>
            <CelebrationEmojis>
              🎉 {celebrationData.questIcon} 🎊
            </CelebrationEmojis>
            
            <CelebrationTitle>
              Quest Complete!
            </CelebrationTitle>
            
            <CelebrationMessage>
              🏆 Congratulations! You've successfully completed<br/>
              <strong>"{celebrationData.questTitle}"</strong>
            </CelebrationMessage>
            
            <CelebrationStats>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                    {celebrationData.accuracy}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Accuracy</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                    +{celebrationData.bonusXP}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Bonus XP</div>
                </div>
              </div>
              <div style={{ marginTop: '16px', color: '#e2e8f0', fontSize: '14px' }}>
                {celebrationData.correctAnswers} correct out of {celebrationData.totalQuestions} questions
              </div>
            </CelebrationStats>
            
            <CelebrationButton onClick={handleCelebrationClose}>
              Continue Learning! 🚀
            </CelebrationButton>
          </CelebrationCard>
        </CelebrationOverlay>
      )}
    </GameContainer>
  );
};

export default GamifiedLearningHub;