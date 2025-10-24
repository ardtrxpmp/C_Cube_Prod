import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { validateAnswer, obfuscateDataForLogging } from '../../utils/answerSecurity';
import { useWallet } from '../../context/WalletContext';

// Secure database service for fetching story mode questions from individual chapter files
const fetchStoryModeData = async () => {
  try {
    console.log('📚 Fetching Story Mode chapters from individual files...');
    
    // Define all 10 chapters with their actual file names from the database
    const chapterFiles = [
      { id: 1, filename: 'chapter-01-blockchain-fundamentals.json', title: '🏗️ Blockchain Fundamentals' },
      { id: 2, filename: 'chapter-02-cryptography---security.json', title: '🔐 Cryptography & Security' },
      { id: 3, filename: 'chapter-03-mining---consensus.json', title: '⛏️ Mining & Consensus' },
      { id: 4, filename: 'chapter-04-bitcoin-fundamentals.json', title: '₿ Bitcoin Fundamentals' },
      { id: 5, filename: 'chapter-05-ethereum---smart-contracts.json', title: '📜 Ethereum & Smart Contracts' },
      { id: 6, filename: 'chapter-06-defi--decentralized-finance-.json', title: '🏦 Decentralized Finance (DeFi)' },
      { id: 7, filename: 'chapter-07-nfts---digital-ownership.json', title: '🎨 NFTs & Digital Ownership' },
      { id: 8, filename: 'chapter-08-interoperability---scaling.json', title: '🌐 Interoperability & Scaling' },
      { id: 9, filename: 'chapter-09-governance---daos.json', title: '🏛️ Governance & DAOs' },
      { id: 10, filename: 'chapter-10-web3---the-future.json', title: '🚀 Web3 & The Future' }
    ];
    
    const transformedChapters = [];
    
    // Fetch each chapter individually
    for (const chapterInfo of chapterFiles) {
      try {
        const chapterUrl = `https://raw.githubusercontent.com/cyfocube/C_DataBase/main/story-mode/${chapterInfo.filename}`;
        console.log(`📖 Fetching ${chapterInfo.title}...`);
        
        const response = await fetch(chapterUrl);
        if (!response.ok) {
          console.warn(`⚠️ Chapter ${chapterInfo.id} not found (${response.status}), creating placeholder`);
          // Create placeholder chapter
          transformedChapters.push({
            title: chapterInfo.title,
            description: 'This chapter is coming soon! Check back later for more content.',
            questions: [{
              content: `${chapterInfo.title} is being prepared for you...`,
              dialogue: {
                speaker: 'Blockchain Guide',
                text: 'This chapter is still being crafted. Soon you\'ll dive deep into these concepts!'
              },
              choices: ['Continue to next available chapter', 'Return to chapter selection', 'Explore other chapters', 'Wait for updates'],
              correctChoice: 0,
              explanation: {
                correctAnswer: 'Continue learning',
                details: 'New chapters are added regularly. Keep exploring the available content!',
                keyPoints: ['More content coming soon', 'Check back for updates', 'Explore existing chapters']
              }
            }]
          });
          continue;
        }
        
        const chapterData = await response.json();
        
        // Transform chapter data to expected format
        const transformedChapter = {
          title: chapterData.title || chapterInfo.title,
          description: chapterData.description || 'Explore blockchain concepts through interactive storytelling.',
          questions: []
        };
        
        if (chapterData.questions && Array.isArray(chapterData.questions)) {
          chapterData.questions.forEach((question, questionIndex) => {
            const secureQuestion = {
              content: question.question || `Learning ${chapterData.title}...`,
              dialogue: {
                speaker: 'Blockchain Guide',
                text: question.question || 'What do you think about this concept?'
              },
              choices: question.options || ['Option A', 'Option B', 'Option C', 'Option D'],
              // Use hash-based validation instead of exposing correct answer index
              correctChoiceHash: question.correctChoiceHash || null,
              correctChoice: question.correctAnswer || 0, // Keep for legacy support
              explanation: {
                correctAnswer: question.options ? question.options[question.correctAnswer] : 'Correct answer',
                details: question.explanation || question.detailedExplanation?.whyItMatters || 'This explains the concept in detail.',
                keyPoints: question.detailedExplanation?.keyPoints || question.tags || []
              }
            };
            transformedChapter.questions.push(secureQuestion);
          });
        }
        
        transformedChapters.push(transformedChapter);
        console.log(`✅ Successfully loaded ${chapterInfo.title} with ${transformedChapter.questions.length} questions`);
        
      } catch (chapterError) {
        console.error(`❌ Error loading chapter ${chapterInfo.id}:`, chapterError);
        // Add placeholder for failed chapters
        transformedChapters.push({
          title: chapterInfo.title,
          description: 'This chapter encountered an error while loading. Please try again later.',
          questions: [{
            content: `Error loading ${chapterInfo.title}`,
            dialogue: {
              speaker: 'System',
              text: 'There was an issue loading this chapter. Please try refreshing or contact support.'
            },
            choices: ['Try again', 'Skip this chapter', 'Report issue', 'Go back'],
            correctChoice: 0,
            explanation: {
              correctAnswer: 'Try again',
              details: 'Technical issues can sometimes occur. Refreshing usually helps.',
              keyPoints: ['Refresh the page', 'Check your connection', 'Try again later']
            }
          }]
        });
      }
    }
    
    // Use obfuscated logging for security
    const logData = obfuscateDataForLogging({ 
      chaptersLoaded: transformedChapters.length,
      totalQuestions: transformedChapters.reduce((sum, chapter) => sum + chapter.questions.length, 0)
    });
    console.log('📚 Secure story mode database loaded:', logData);
    console.log('✅ SECURE STORY MODE DATABASE DATA LOADED SUCCESSFULLY FROM GITHUB!');
    console.log(`📊 Total: ${transformedChapters.length} chapters with ${transformedChapters.reduce((sum, ch) => sum + ch.questions.length, 0)} questions`);
    return transformedChapters;
  } catch (error) {
    console.error('Error fetching secure story mode data:', error);
    // // Fallback to local secure data
    // try {
    // Fallback import removed - using database data only
    //   console.log('📦 Using local secure fallback data for story mode');
    //   return transformSecureStoryData(fallbackData.default);
    // } catch (fallbackError) {
    //   console.error('Story mode fallback data also failed:', fallbackError);
    //   // Return basic fallback chapters if everything fails
    //   return createFallbackChapters();
    // }
    return null; // Return null if database fails - no fallback
  }
};

// Hardcoded data removed - all content now comes from database only

// Transform secure database format to component format
const transformSecureStoryData = (secureData) => {
  const transformedChapters = [];
  
  if (secureData.storyMode && secureData.storyMode.chapters) {
    secureData.storyMode.chapters.forEach(chapter => {
      transformedChapters.push({
        title: chapter.title,
        description: chapter.description,
        questions: chapter.questions
      });
    });
  }
  
  return transformedChapters;
};

const storyFade = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const StoryContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460);
  position: relative;
  overflow-y: auto;
  padding: 40px 20px 20px 20px;
`;

const MainContentWrapper = styled.div`
  display: flex;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const QuestionsContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const DashboardContainer = styled.div`
  width: 320px;
  min-width: 320px;
  margin-top: 280px;
  
  @media (max-width: 1024px) {
    width: 100%;
    min-width: 100%;
    margin-top: 20px;
  }
`;

const StoryHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  animation: ${storyFade} 1s ease-out;
`;

const ChapterSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const ChapterDropdown = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 8px;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  
  option {
    background: #1a1a2e;
    color: white;
  }
  
  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
  }
`;

const ChapterTitle = styled.h2`
  color: #10b981;
  font-size: 2rem;
  margin-bottom: 10px;
`;

const QuestionCounter = styled.div`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 10px;
`;

const DashboardToggle = styled.button`
  width: 100%;
  height: 40px;
  background: rgba(16, 185, 129, 0.9);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  
  &:hover {
    background: rgba(16, 185, 129, 1);
    transform: translateY(-2px);
  }
`;

const PointsDashboard = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease-in-out;
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-20px)'};
  opacity: ${props => props.show ? '1' : '0'};
  height: ${props => props.show ? '600px' : '0'};
  overflow: hidden;
`;

const DashboardTitle = styled.h3`
  color: #10b981;
  margin: 0 0 12px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PointsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.2);
`;

const PointsLabel = styled.div`
  color: #e5e7eb;
  font-size: 14px;
`;

const PointsValue = styled.div`
  color: #10b981;
  font-size: 18px;
  font-weight: bold;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const StatBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  color: #10b981;
  font-size: 16px;
  font-weight: bold;
`;

const StatLabel = styled.div`
  color: #9ca3af;
  font-size: 11px;
  margin-top: 2px;
`;

const ChapterProgressList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.6);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(16, 185, 129, 0.8);
  }
`;

const ChapterProgressItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
  color: #d1d5db;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const PointsAnimation = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 18px;
  z-index: 1000;
  animation: ${storyFade} 0.5s ease-out;
  pointer-events: none;
`;

const StoryProgress = styled.div`
  width: calc(100% + 340px);
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  width: ${props => props.progress || 0}%;
  transition: width 0.5s ease;
`;

const StoryContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
  animation: ${storyFade} 1s ease-out 0.3s both;
`;

const StoryText = styled.p`
  color: white;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const CharacterDialogue = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border-left: 4px solid #10b981;
  padding: 15px 20px;
  margin: 20px 0;
  border-radius: 0 10px 10px 0;
`;

const Speaker = styled.div`
  color: #10b981;
  font-weight: bold;
  margin-bottom: 8px;
`;

const ChoiceContainer = styled.div`
  margin-top: 30px;
  animation: ${storyFade} 1s ease-out 0.6s both;
`;

const ChoiceButton = styled.button`
  display: block;
  width: 100%;
  padding: 15px 20px;
  margin: 10px 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.3));
    transform: translateX(5px);
  }
`;

const ExplanationContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border-left: 4px solid ${props => props.isCorrect ? '#10b981' : '#ef4444'};
  animation: ${storyFade} 0.5s ease-out;
`;

const ExplanationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: bold;
  color: ${props => props.isCorrect ? '#10b981' : '#ef4444'};
  font-size: 16px;
`;

const CorrectAnswerText = styled.div`
  color: #10b981;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
`;

const ExplanationText = styled.div`
  color: #e5e7eb;
  line-height: 1.6;
  font-size: 14px;
`;

const KeyPointsList = styled.ul`
  margin: 12px 0 0 0;
  padding-left: 16px;
  color: #d1d5db;
  
  li {
    margin-bottom: 4px;
    font-size: 13px;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const NavButton = styled.button`
  padding: 12px 24px;
  background: rgba(16, 185, 129, 0.8);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 1);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StoryCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
  animation: ${storyFade} 1s ease-out 0.3s both;
`;

const StoryTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
`;

const ChoicesContainer = styled.div`
  margin-top: 30px;
  animation: ${storyFade} 1s ease-out 0.6s both;
`;

const StoryModeLearning = ({ userProgress, setUserProgress, addPoints }) => {
  // Wallet integration for score reading
  const { walletScores, walletScoresLoading, isWalletConnected } = useWallet();
  // Initialize state with persistent data if available
  const initializeState = () => {
    try {
      const savedStoryProgress = sessionStorage.getItem('ccube_story_progress');
      if (savedStoryProgress) {
        const storyData = JSON.parse(savedStoryProgress);
        console.log('🔄 Initializing state with saved data:', storyData);
        return storyData;
      }
    } catch (err) {
      console.error('❌ Error reading saved state during initialization:', err);
      sessionStorage.removeItem('ccube_story_progress');
    }
    console.log('🆕 Initializing with default state - no saved data found');
    return null;
  };

  const savedData = initializeState();
  
  const [currentChapter, setCurrentChapter] = useState(savedData?.currentChapter ?? 0);
  const [currentQuestion, setCurrentQuestion] = useState(savedData?.currentQuestion ?? 0);
  const [selectedChoice, setSelectedChoice] = useState(savedData?.selectedChoice ?? null);
  const [chapterScores, setChapterScores] = useState(savedData?.chapterScores ?? {});
  const [totalPoints, setTotalPoints] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [animationText, setAnimationText] = useState('');
  const [showDashboard, setShowDashboard] = useState(savedData?.showDashboard ?? true);
  const [databaseChapters, setDatabaseChapters] = useState(null);
  const [isLoadingDatabase, setIsLoadingDatabase] = useState(true);
  const [databaseError, setDatabaseError] = useState(null);

  // Log component initialization
  useEffect(() => {
    console.log('📖 Story Mode component initialized with state:', {
      chapter: currentChapter,
      question: currentQuestion,
      hasScores: Object.keys(chapterScores).length > 0,
      selectedChoice,
      dashboardVisible: showDashboard
    });
  }, []);

  // Save story progress whenever key states change (with debouncing)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const storyData = {
        currentChapter,
        currentQuestion,
        chapterScores,
        selectedChoice,
        showDashboard,
        timestamp: new Date().toISOString()
      };
      
      console.log('💾 Saving story progress:', {
        chapter: storyData.currentChapter,
        question: storyData.currentQuestion, 
        scores: Object.keys(storyData.chapterScores).length,
        selectedChoice: storyData.selectedChoice,
        dashboardVisible: storyData.showDashboard
      });
      
      try {
        sessionStorage.setItem('ccube_story_progress', JSON.stringify(storyData));
        console.log('✅ Story progress saved successfully');
      } catch (err) {
        console.error('❌ Error saving story progress:', err);
      }
    }, 100); // Small delay to debounce rapid state changes

    return () => clearTimeout(saveTimer);
  }, [currentChapter, currentQuestion, chapterScores, selectedChoice, showDashboard]);

  // Debug helper to verify persistence
  const verifyPersistence = () => {
    const saved = sessionStorage.getItem('ccube_story_progress');
    console.log('🔍 Current sessionStorage content:', saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('🔍 Parsed data:', parsed);
        console.log('🔍 Current state vs saved:', {
          currentState: { currentChapter, currentQuestion, chapterScores, selectedChoice, showDashboard },
          savedState: parsed
        });
      } catch (err) {
        console.error('🔍 Error parsing saved data:', err);
      }
    } else {
      console.log('🔍 No data in sessionStorage');
    }
  };

  // Call verification on component mount and when state changes
  useEffect(() => {
    verifyPersistence();
  }, [currentChapter, currentQuestion]);

  // Helper function to shuffle array with deterministic seed
  const shuffleArrayWithSeed = (array, seed) => {
    const shuffled = [...array];
    let currentSeed = seed;
    
    // Simple seeded random number generator
    const seededRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get or create persistent shuffle seed
  const getShuffleSeed = () => {
    let seed = sessionStorage.getItem('ccube_story_shuffle_seed');
    if (!seed) {
      seed = Math.floor(Math.random() * 1000000);
      sessionStorage.setItem('ccube_story_shuffle_seed', seed.toString());
      console.log('🎲 Created new shuffle seed:', seed);
    } else {
      console.log('🎲 Using existing shuffle seed:', seed);
    }
    return parseInt(seed);
  };

  // Helper function to shuffle choices and update correctChoice index
  const shuffleQuestionChoices = (question, seed) => {
    const originalCorrectAnswer = question.choices[question.correctChoice];
    const shuffledChoices = shuffleArrayWithSeed(question.choices, seed);
    const newCorrectIndex = shuffledChoices.indexOf(originalCorrectAnswer);
    
    return {
      ...question,
      choices: shuffledChoices,
      correctChoice: newCorrectIndex
    };
  };

  // Load database data on component mount
  useEffect(() => {
    const loadStoryModeDatabase = async () => {
      setIsLoadingDatabase(true);
      setDatabaseError(null);
      
      try {
        const data = await fetchStoryModeData();
        if (data && data.length > 0) {
          setDatabaseChapters(data);
          console.log('📚 Story Mode database loaded successfully:', data.length, 'chapters');
        } else {
          throw new Error('No story mode data received from database');
        }
      } catch (error) {
        console.error('❌ Failed to load story mode database:', error);
        setDatabaseError(error.message);
        // Don't set databaseChapters to null - let it fall back to hardcoded data
      } finally {
        setIsLoadingDatabase(false);
      }
    };
    
    loadStoryModeDatabase();
  }, []);

  // Hardcoded fallback chapters commented out - now relies entirely on database
  // const originalStoryChapters = [
  //   {
  //     title: "🏗️ Blockchain Fundamentals",
  //     description: "Master the core concepts of blockchain technology",
  //     questions: [
  //       ... (large hardcoded array commented out)
//   //     ]
//   //   },
//   //   ... (9 more chapters commented out)
//   // ];

    //   //     ]
  //   //   },
  //   //   ... (9 more chapters commented out)
  //   // ];

  // NOTE: Large hardcoded content section (1100+ lines) was removed from here
  // Original content moved to: src/data/story-mode-fallback.js
  // All content now comes exclusively from C_DataBase repository
  
  // Helper function to calculate story mode points combining session and database
  const calculateStoryModePoints = () => {
    try {
      console.log('📚 StoryMode - isWalletConnected:', isWalletConnected);
      console.log('📚 StoryMode - walletScores:', walletScores);
      console.log('📚 StoryMode - walletScores?.points?.storyMode:', walletScores?.points?.storyMode);
      console.log('📚 StoryMode - FULL walletScores.points:', walletScores?.points);
      
      let sessionPoints = 0;
      let databasePoints = 0;
      
      // Get session storage points
      const savedPoints = sessionStorage.getItem('ccube_user_points');
      if (savedPoints) {
        const pointsData = JSON.parse(savedPoints);
        if (pointsData.storyMode) {
          sessionPoints = Object.values(pointsData.storyMode).reduce((sum, val) => sum + val, 0);
        }
      }
      
      // Get database points from wallet
      if (walletScores?.points?.storyMode) {
        databasePoints = walletScores.points.storyMode.totalScore || 
          Object.values(walletScores.points.storyMode)
            .filter(val => typeof val === 'number')
            .reduce((sum, val) => sum + val, 0);
      }
      
      console.log('📚 StoryMode - databasePoints calculated:', databasePoints);
      
      // Use same simple logic as MigratePointDashboard: wallet connected = database points
      let totalPoints = 0;
      if (isWalletConnected && walletScores?.points?.storyMode?.totalScore) {
        totalPoints = walletScores.points.storyMode.totalScore;
        console.log(`📚 Story Mode Points: Using database totalScore = ${totalPoints}`);
      } else if (isWalletConnected && walletScores?.points?.storyMode) {
        totalPoints = databasePoints;
        console.log(`📚 Story Mode Points: Using calculated database points = ${databasePoints}`);
      } else {
        totalPoints = 0;
        console.log(`📚 Story Mode Points: No wallet or no database points = 0, isWalletConnected=${isWalletConnected}, hasWalletScores=${!!walletScores?.points?.storyMode}`);
      }
      
      return totalPoints;
    } catch (e) {
      console.error('Error reading story mode points:', e);
    }
    return 0;
  };

  // All hooks must be called before any early returns
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Calculate points with dependency on refresh trigger and wallet scores
  const totalStoryModePoints = useMemo(() => {
    return calculateStoryModePoints();
  }, [refreshTrigger, walletScores, isWalletConnected]);

  // Update totalPoints state when wallet scores or calculated points change
  useEffect(() => {
    setTotalPoints(totalStoryModePoints);
  }, [totalStoryModePoints]);

  // Trigger refresh when points might have changed
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 1000); // Check every second for point updates

    return () => clearInterval(interval);
  }, []);

  // Create shuffled version of story chapters with randomized choice positions
  // Use database data only - no hardcoded fallback
  const storyChapters = useMemo(() => {
    // Use only database chapters - no fallback to hardcoded data
    const chaptersToUse = databaseChapters || [];
    
    if (databaseChapters && databaseChapters.length > 0) {
      console.log('📚 Using secure database chapters:', databaseChapters.length, 'chapters loaded');
    } else {
      console.log('⚠️ No database chapters available - Story Mode requires database connection');
      return []; // Return empty array if no database data
    }
    
    const shuffleSeed = getShuffleSeed();
    let currentSeed = shuffleSeed;
    
    const shuffledChapters = chaptersToUse.map((chapter, chapterIndex) => ({
      ...chapter,
      questions: chapter.questions.map((question, questionIndex) => {
        // Create unique seed for each question based on chapter and question index
        const questionSeed = currentSeed + (chapterIndex * 1000) + questionIndex;
        const shuffledQuestion = shuffleQuestionChoices(question, questionSeed);
        console.log(`🔀 Question shuffled: "${question.dialogue.text}" - Correct answer moved from position ${question.correctChoice} to position ${shuffledQuestion.correctChoice}`);
        return shuffledQuestion;
      })
    }));
    console.log('🎲 All Story Mode questions shuffled with persistent seed! Answers will remain consistent.');
    return shuffledChapters;
  }, [databaseChapters]); // Re-shuffle when database data loads

  // Handle case where no chapters are available
  if (!storyChapters || storyChapters.length === 0) {
    return (
      <StoryContainer>
        <MainContentWrapper>
          <StoryCard>
            <StoryTitle>📚 Story Mode</StoryTitle>
            <StoryText>
              Story Mode requires a database connection to load chapters. Please check your internet connection and try again.
            </StoryText>
            <ChoicesContainer>
              <ChoiceButton onClick={() => window.location.reload()}>
                🔄 Retry Connection
              </ChoiceButton>
            </ChoicesContainer>
          </StoryCard>
        </MainContentWrapper>
      </StoryContainer>
    );
  }

  const currentStory = storyChapters[currentChapter];
  const currentQuestionData = currentStory?.questions[currentQuestion];
  
  // Additional safety check
  if (!currentStory || !currentQuestionData) {
    return (
      <StoryContainer>
        <MainContentWrapper>
          <StoryCard>
            <StoryTitle>⚠️ Chapter Not Available</StoryTitle>
            <StoryText>
              This chapter is not available. Please try reloading or select a different chapter.
            </StoryText>
          </StoryCard>
        </MainContentWrapper>
      </StoryContainer>
    );
  }
  
  const chapterProgress = (currentQuestion / currentStory.questions.length) * 100;
  const totalProgress = ((currentChapter * 10 + currentQuestion) / 100) * 100;

  const handleChoiceSelect = (choiceIndex) => {
    // Prevent multiple selections - user can only select once per question
    if (selectedChoice !== null) {
      return;
    }
    
    setSelectedChoice(choiceIndex);
    
    // Update chapter scores with secure validation
    const chapterKey = `chapter-${currentChapter}`;
    
    // Secure answer validation using hashes when available
    let isCorrect = false;
    
    if (currentQuestionData.correctChoiceHash) {
      // Use secure hash-based validation
      const selectedAnswer = currentQuestionData.choices[choiceIndex];
      const questionId = `story_ch${currentChapter + 1}_q${currentQuestion + 1}`;
      isCorrect = validateAnswer(selectedAnswer, questionId, currentQuestionData.correctChoiceHash);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Using secure hash validation for:', questionId);
        console.log('🔍 Selected answer:', selectedAnswer);
        console.log('✅ Validation result:', isCorrect);
      }
    } else {
      // Fallback to legacy validation (less secure)
      isCorrect = choiceIndex === currentQuestionData.correctChoice;
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔓 Using legacy validation - consider upgrading to hash-based validation');
      }
    }
    
    setChapterScores(prev => ({
      ...prev,
      [chapterKey]: {
        ...prev[chapterKey],
        [`question-${currentQuestion}`]: isCorrect
      }
    }));
    
    // Points are only awarded through the global system for correct answers
    // No internal totalPoints tracking needed

    // Award points to the global system (1 point per CORRECT answer only)
    if (addPoints && isCorrect) {
      const questionKey = `story-ch${currentChapter + 1}-q${currentQuestion + 1}`;
      const hasBeenAnswered = userProgress?.completedNodes?.includes(questionKey) || false;
      
      if (!hasBeenAnswered) {
        const questionPoints = 1; // 1 point per correct answer
        const chapterKey = `chapter${currentChapter + 1}`; // chapter1, chapter2, etc.
        addPoints('storyMode', chapterKey, questionPoints);
        console.log(`✅ Question ${currentQuestion + 1} in Chapter ${currentChapter + 1} answered CORRECTLY! Awarded ${questionPoints} point.`);
        
        // Mark this question as answered correctly
        setUserProgress(prev => ({
          ...prev,
          completedNodes: [...(prev.completedNodes || []), questionKey]
        }));
        
        // Trigger dashboard refresh to show new points
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.log(`⚠️ Question ${currentQuestion + 1} in Chapter ${currentChapter + 1} already answered correctly - no additional points.`);
      }
    } else if (addPoints && !isCorrect) {
      console.log(`❌ Question ${currentQuestion + 1} in Chapter ${currentChapter + 1} answered incorrectly - no points awarded.`);
    }
    
    // Check for milestones and show appropriate animation
    let animation = isCorrect ? '+1 Point! ✅' : 'Incorrect ❌';
    
    // Get current persistent points for milestone checking (only for correct answers with points)
    if (isCorrect && addPoints) {
      const currentPersistentPoints = calculateStoryModePoints();
      
      // Milestone celebrations based on persistent points
      if (currentPersistentPoints === 10) animation = '🎉 10 Points Milestone!';
      else if (currentPersistentPoints === 25) animation = '🌟 25 Points Achievement!';
      else if (currentPersistentPoints === 50) animation = '🚀 50 Points Mastery!';
      else if (currentPersistentPoints === 75) animation = '💎 75 Points Expert!';
      else if (currentPersistentPoints === 100) animation = '👑 100 Points Champion!';
      else if (currentPersistentPoints % 20 === 0 && currentPersistentPoints > 100) animation = `🔥 ${currentPersistentPoints} Points Streak!`;
    }
    
    setAnimationText(animation);
    setShowPointsAnimation(true);
    setTimeout(() => setShowPointsAnimation(false), 2000);
    
    // Update user progress
    const newProgress = { ...userProgress };
    newProgress.totalProgress = (newProgress.totalProgress || 0) + 1;
    if (isCorrect) {
      newProgress.correctAnswers = (newProgress.correctAnswers || 0) + 1;
    }
    setUserProgress(newProgress);
  };

  const handleNext = () => {
    if (currentQuestion < currentStory.questions.length - 1) {
      // Next question in current chapter
      setCurrentQuestion(currentQuestion + 1);
      setSelectedChoice(null);
    } else if (currentChapter < storyChapters.length - 1) {
      // Next chapter (no bonus points - just 1 point per question)
      setCurrentChapter(currentChapter + 1);
      setCurrentQuestion(0);
      setSelectedChoice(null);
    } else {
      // Story completed! (no bonus points - just 1 point per question)
      console.log(`🏆 Story mode completed!`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      // Previous question in current chapter
      setCurrentQuestion(currentQuestion - 1);
      setSelectedChoice(null);
    } else if (currentChapter > 0) {
      // Previous chapter (go to last question)
      setCurrentChapter(currentChapter - 1);
      setCurrentQuestion(storyChapters[currentChapter - 1].questions.length - 1);
      setSelectedChoice(null);
    }
  };

  const handleChapterSelect = (chapterIndex) => {
    setCurrentChapter(parseInt(chapterIndex));
    setCurrentQuestion(0);
    setSelectedChoice(null);
  };

  const getChapterScore = (chapterIndex) => {
    // Use database scores when wallet connected
    if (isWalletConnected && walletScores?.points?.storyMode) {
      // Database has chapters as chapter1, chapter2, etc.
      const chapterKey = `chapter${chapterIndex + 1}`;
      return walletScores.points.storyMode[chapterKey] || 0;
    }
    
    // Fallback to session scores
    const chapterKey = `chapter-${chapterIndex}`;
    const chapterData = chapterScores[chapterKey];
    if (!chapterData) return 0;
    
    const correct = Object.values(chapterData).filter(Boolean).length;
    return correct;
  };

  const getTotalCorrectAnswers = () => {
    let total = 0;
    Object.values(chapterScores).forEach(chapterData => {
      total += Object.values(chapterData).filter(Boolean).length;
    });
    return total;
  };

  const getTotalQuestionsAnswered = () => {
    let total = 0;
    Object.values(chapterScores).forEach(chapterData => {
      total += Object.keys(chapterData).length;
    });
    return total;
  };

  const getAccuracyPercentage = () => {
    const total = getTotalQuestionsAnswered();
    const correct = getTotalCorrectAnswers();
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const getChapterProgress = (chapterIndex) => {
    const chapterKey = `chapter-${chapterIndex}`;
    const chapterData = chapterScores[chapterKey];
    if (!chapterData) return 0;
    
    const answered = Object.keys(chapterData).length;
    return Math.round((answered / 10) * 100); // 10 questions per chapter
  };

  // Show loading state while database loads
  if (isLoadingDatabase) {
    return (
      <StoryContainer>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Loading Story Mode...</h2>
          <p style={{ color: '#64748b' }}>Fetching the latest story content and questions...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </StoryContainer>
    );
  }

  // Show error state if database failed to load but continue with fallback
  if (databaseError && !storyChapters.length) {
    return (
      <StoryContainer>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Database Connection Error</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Failed to load story content: {databaseError}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Using local fallback content...
          </p>
        </div>
      </StoryContainer>
    );
  }

  return (
    <StoryContainer>
      <MainContentWrapper>
        {/* Questions Container */}
        <QuestionsContainer>
          <StoryHeader>
        <ChapterSelector>
          <div style={{ color: '#10b981', fontWeight: 'bold' }}>Select Chapter:</div>
          <ChapterDropdown value={currentChapter} onChange={(e) => handleChapterSelect(e.target.value)}>
            {storyChapters.map((chapter, index) => (
              <option key={index} value={index}>
                Chapter {index + 1}: {chapter.title} ({getChapterScore(index)}/10)
              </option>
            ))}
          </ChapterDropdown>
        </ChapterSelector>
        
        <ChapterTitle>
          {currentStory.title}
        </ChapterTitle>
        
        <QuestionCounter>
          Question {currentQuestion + 1} of {currentStory.questions.length} • Chapter {currentChapter + 1} of {storyChapters.length}
        </QuestionCounter>
        
        <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '10px' }}>
          {currentStory.description}
        </div>
        
        <StoryProgress>
          <ProgressBar progress={chapterProgress} />
        </StoryProgress>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
          <span>Chapter Progress: {Math.round(chapterProgress)}%</span>
          <span>Total Progress: {Math.round(totalProgress)}%</span>
        </div>
      </StoryHeader>

      <StoryContent>
        <StoryText>{currentQuestionData.content}</StoryText>
        
        <CharacterDialogue>
          <Speaker>{currentQuestionData.dialogue.speaker}:</Speaker>
          <div>{currentQuestionData.dialogue.text}</div>
        </CharacterDialogue>

        <ChoiceContainer>
          {currentQuestionData.choices.map((choice, index) => (
            <ChoiceButton
              key={index}
              onClick={() => handleChoiceSelect(index)}
              style={{
                background: selectedChoice === index 
                  ? (index === currentQuestionData.correctChoice 
                     ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(34, 197, 94, 0.5))'
                     : 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))')
                  : undefined,
                cursor: selectedChoice !== null ? 'not-allowed' : 'pointer',
                opacity: selectedChoice !== null && selectedChoice !== index ? 0.6 : 1
              }}
            >
              {choice}
              {selectedChoice === index && index === currentQuestionData.correctChoice && " ✅"}
              {selectedChoice === index && index !== currentQuestionData.correctChoice && " ❌"}
            </ChoiceButton>
          ))}
          
          {selectedChoice !== null && currentQuestionData.explanation && (
            <ExplanationContainer isCorrect={selectedChoice === currentQuestionData.correctChoice}>
              <ExplanationHeader isCorrect={selectedChoice === currentQuestionData.correctChoice}>
                {selectedChoice === currentQuestionData.correctChoice ? '🎉 Correct!' : '📚 Learning Opportunity'}
                {selectedChoice !== currentQuestionData.correctChoice && (
                  <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
                    - Let's learn from this!
                  </span>
                )}
              </ExplanationHeader>
              
              {selectedChoice !== currentQuestionData.correctChoice && (
                <CorrectAnswerText>
                  ✅ Correct Answer: {currentQuestionData.explanation.correctAnswer}
                </CorrectAnswerText>
              )}
              
              <ExplanationText>
                {currentQuestionData.explanation.details}
              </ExplanationText>
              
              {currentQuestionData.explanation.keyPoints && currentQuestionData.explanation.keyPoints.length > 0 && (
                <>
                  <div style={{ color: '#10b981', fontWeight: '600', marginTop: '12px', fontSize: '14px' }}>
                    🔑 Key Points:
                  </div>
                  <KeyPointsList>
                    {currentQuestionData.explanation.keyPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </KeyPointsList>
                </>
              )}
            </ExplanationContainer>
          )}
        </ChoiceContainer>
      </StoryContent>

      <NavigationButtons>
        <NavButton 
          onClick={handlePrevious} 
          disabled={currentChapter === 0 && currentQuestion === 0}
        >
          ← Previous
        </NavButton>
        <NavButton 
          onClick={handleNext} 
          disabled={(currentChapter === storyChapters.length - 1 && currentQuestion === currentStory.questions.length - 1) || selectedChoice === null}
        >
          {currentQuestion < currentStory.questions.length - 1 ? 'Next Question →' : 
           currentChapter < storyChapters.length - 1 ? 'Next Chapter →' : 'Complete! 🎉'}
        </NavButton>
      </NavigationButtons>

          {/* Points Animation */}
          {showPointsAnimation && (
            <PointsAnimation>
              {animationText}
            </PointsAnimation>
          )}
        </QuestionsContainer>

        {/* Dashboard Container */}
        <DashboardContainer>
          <DashboardToggle onClick={() => setShowDashboard(!showDashboard)}>
            {showDashboard ? '📊 Hide Dashboard' : '📊 Show Dashboard'}
          </DashboardToggle>

          <PointsDashboard show={showDashboard}>
            <DashboardTitle>
              🏆 Learning Dashboard
            </DashboardTitle>
            
            <PointsContainer>
              <PointsLabel>Total Points Earned</PointsLabel>
              <PointsValue>{(() => {
                const databasePoints = walletScores?.points?.storyMode?.totalScore || 0;
                const sessionPoints = getTotalCorrectAnswers();
                return databasePoints + sessionPoints;
              })()}</PointsValue>
            </PointsContainer>
            
            <StatsGrid>
              <StatBox>
                <StatValue>{getTotalCorrectAnswers()}</StatValue>
                <StatLabel>Correct</StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>{getTotalQuestionsAnswered()}</StatValue>
                <StatLabel>Answered</StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>{getAccuracyPercentage()}%</StatValue>
                <StatLabel>Accuracy</StatLabel>
              </StatBox>
              <StatBox style={{ 
                background: walletScores ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${walletScores ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                <StatValue style={{ color: walletScores ? '#10b981' : '#f59e0b' }}>
                  {walletScoresLoading ? '⏳' : walletScores ? '🏦' : '📱'}
                </StatValue>
                <StatLabel>
                  {walletScoresLoading 
                    ? 'Loading...' 
                    : walletScores 
                      ? 'Database'
                      : 'Session'
                  }
                </StatLabel>
              </StatBox>
            </StatsGrid>

            <ChapterProgressList>
              {storyChapters.map((chapter, index) => (
                <ChapterProgressItem key={index}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getChapterProgress(index) === 100 && <span style={{ color: '#fbbf24' }}>🏅</span>}
                    Ch{index + 1}: {chapter.title.replace(/🏗️|🔐|⛏️|💰|♦️|🏦|🎨|🔗|🏛️|🌐/g, '').trim()}
                  </span>
                  <span style={{ color: getChapterProgress(index) === 100 ? '#10b981' : '#64748b' }}>
                    {getChapterScore(index)} pts ({getChapterProgress(index)}%)
                  </span>
                </ChapterProgressItem>
              ))}
            </ChapterProgressList>
            
            {totalStoryModePoints > 0 && (
              <button
                onClick={() => {
                  console.log('🔄 Resetting all story progress and shuffling');
                  
                  // Reset all state
                  setTotalPoints(0);
                  setChapterScores({});
                  setCurrentChapter(0);
                  setCurrentQuestion(0);
                  setSelectedChoice(null);
                  setShowDashboard(true);
                  
                  // Clear all saved story data including shuffle seed
                  sessionStorage.removeItem('ccube_story_progress');
                  sessionStorage.removeItem('ccube_story_shuffle_seed');
                  
                  console.log('✅ Story progress completely reset - refresh page for new question shuffle');
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '12px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '6px',
                  color: '#ef4444',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
              >
                🔄 Reset Progress
              </button>
            )}
          </PointsDashboard>
        </DashboardContainer>
      </MainContentWrapper>
    </StoryContainer>
  );
};

export default StoryModeLearning;