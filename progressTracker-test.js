/**
 * Progress Tracker Service - CommonJS Version for Testing
 * Manages user progress across Gaming Hub and Story Mode
 */

class ProgressTracker {
  constructor() {
    this.baseUrl = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/users/progress-tracking';
    this.cache = new Map();
    this.syncQueue = [];
    this.isOnline = true; // Assume online for Node.js testing
  }

  /**
   * Gaming Hub Progress Management
   */
  
  async getGamingHubProgress(walletAddress) {
    if (!walletAddress) {
      console.warn('🔴 No wallet address provided for progress tracking');
      return this.createEmptyGamingHubProgress(walletAddress);
    }

    try {
      // Check cache first
      const cacheKey = `gaming-hub-${walletAddress}`;
      if (this.cache.has(cacheKey)) {
        console.log('📱 Using cached gaming hub progress');
        return this.cache.get(cacheKey);
      }

      // For testing, return empty progress (GitHub fetch would happen here in production)
      console.log('📝 Creating new gaming hub progress for wallet:', walletAddress);
      const progress = this.createEmptyGamingHubProgress(walletAddress);
      this.cache.set(cacheKey, progress);
      return progress;
      
    } catch (error) {
      console.error('❌ Error loading gaming hub progress:', error);
      return this.createEmptyGamingHubProgress(walletAddress);
    }
  }

  async saveGamingHubProgress(walletAddress, questId, challengeIndex, questionData) {
    if (!walletAddress) {
      console.warn('🔴 Cannot save progress without wallet address');
      return;
    }

    try {
      // Get current progress
      const progress = await this.getGamingHubProgress(walletAddress);
      
      // Initialize quest progress if not exists
      if (!progress.questProgress[questId]) {
        progress.questProgress[questId] = {
          questStatus: 'not-started',
          currentChallengeIndex: 0,
          totalChallenges: this.getTotalChallenges(questId),
          completedChallenges: [],
          attemptedQuestions: []
        };
      }

      const questProgress = progress.questProgress[questId];
      
      // Update quest status
      if (questProgress.questStatus === 'not-started') {
        questProgress.questStatus = 'in-progress';
      }
      
      // Update current challenge index
      questProgress.currentChallengeIndex = Math.max(
        questProgress.currentChallengeIndex, 
        challengeIndex
      );
      
      // Add question attempt
      const questionAttempt = {
        challengeIndex: challengeIndex,
        questionId: questionData.questionId,
        attempts: 1,
        lastAttempt: new Date().toISOString(),
        isCorrect: questionData.isCorrect,
        userAnswers: questionData.userAnswer ? [questionData.userAnswer] : [],
        correctAnswers: questionData.correctAnswers || []
      };
      
      // Check if question already attempted
      const existingIndex = questProgress.attemptedQuestions.findIndex(
        q => q.questionId === questionData.questionId
      );
      
      if (existingIndex >= 0) {
        // Update existing attempt
        const existing = questProgress.attemptedQuestions[existingIndex];
        existing.attempts += 1;
        existing.lastAttempt = questionAttempt.lastAttempt;
        existing.isCorrect = questionData.isCorrect;
        existing.userAnswers = [...existing.userAnswers, ...(questionData.userAnswer ? [questionData.userAnswer] : [])];
      } else {
        // Add new attempt
        questProgress.attemptedQuestions.push(questionAttempt);
      }
      
      // Mark challenge as completed if all questions in challenge are correct
      if (questionData.challengeComplete && !questProgress.completedChallenges.includes(challengeIndex)) {
        questProgress.completedChallenges.push(challengeIndex);
        
        // Check if quest is complete
        if (questProgress.completedChallenges.length >= questProgress.totalChallenges) {
          questProgress.questStatus = 'completed';
        }
      }
      
      // Update overall stats
      progress.overallStats.totalQuestionsAttempted = this.countTotalQuestions(progress.questProgress);
      progress.overallStats.totalQuestionsCorrect = this.countCorrectQuestions(progress.questProgress);
      progress.overallStats.accuracyRate = progress.overallStats.totalQuestionsAttempted > 0 ? 
        (progress.overallStats.totalQuestionsCorrect / progress.overallStats.totalQuestionsAttempted) * 100 : 0;
      progress.overallStats.lastPlaySession = new Date().toISOString();
      progress.lastUpdated = new Date().toISOString();
      
      // Cache the updated progress
      const cacheKey = `gaming-hub-${walletAddress}`;
      this.cache.set(cacheKey, progress);
      
      console.log('💾 Gaming hub progress saved:', {
        wallet: walletAddress,
        quest: questId,
        challenge: challengeIndex,
        progress: questProgress
      });
      
      return progress;
      
    } catch (error) {
      console.error('❌ Error saving gaming hub progress:', error);
      throw error;
    }
  }

  async getNextUncompletedChallenge(walletAddress, questId) {
    const progress = await this.getGamingHubProgress(walletAddress);
    const questProgress = progress.questProgress[questId];
    
    if (!questProgress) {
      return { challengeIndex: 0, isFirstTime: true };
    }
    
    // Find first uncompleted challenge
    const totalChallenges = questProgress.totalChallenges;
    const completedChallenges = questProgress.completedChallenges || [];
    
    for (let i = 0; i < totalChallenges; i++) {
      if (!completedChallenges.includes(i)) {
        return { 
          challengeIndex: i, 
          isFirstTime: false,
          questStatus: questProgress.questStatus,
          attemptedQuestions: questProgress.attemptedQuestions.filter(q => q.challengeIndex === i)
        };
      }
    }
    
    // All challenges completed
    return { 
      challengeIndex: totalChallenges - 1, 
      isFirstTime: false, 
      isQuestComplete: true,
      questStatus: 'completed'
    };
  }

  /**
   * Helper Methods
   */
  
  createEmptyGamingHubProgress(walletAddress) {
    return {
      walletAddress: walletAddress || '',
      lastUpdated: new Date().toISOString(),
      questProgress: {},
      overallStats: {
        totalQuestionsAttempted: 0,
        totalQuestionsCorrect: 0,
        accuracyRate: 0.0,
        totalPlayTime: 0,
        lastPlaySession: new Date().toISOString()
      }
    };
  }

  getTotalChallenges(questId) {
    const challengeCounts = {
      'blockchain-basics': 10,
      'crypto-security': 50,
      'defi-explorer': 50,
      'smart-contracts': 50
    };
    return challengeCounts[questId] || 10;
  }

  countTotalQuestions(questProgress) {
    return Object.values(questProgress).reduce((total, quest) => {
      return total + (quest.attemptedQuestions?.length || 0);
    }, 0);
  }

  countCorrectQuestions(questProgress) {
    return Object.values(questProgress).reduce((total, quest) => {
      const correct = quest.attemptedQuestions?.filter(q => q.isCorrect).length || 0;
      return total + correct;
    }, 0);
  }

  // Reset progress (for testing/demo purposes)
  async resetProgress(walletAddress, mode = 'both') {
    if (mode === 'gaming-hub' || mode === 'both') {
      this.cache.delete(`gaming-hub-${walletAddress}`);
    }
    console.log(`🔄 Progress reset for ${walletAddress} (${mode})`);
  }
}

// Export for CommonJS (Node.js testing)
module.exports = new ProgressTracker();