/**
 * Progress Tracker Service
 * Manages user progress across Gaming Hub and Story Mode
 * Syncs progress with GitHub database for cross-device persistence
 */

class ProgressTracker {
  constructor() {
    this.baseUrl = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/users/progress-tracking';
    this.apiUrl = 'https://api.github.com/repos/cyfocube/C_DataBase/contents/users/progress-tracking';
    this.cache = new Map();
    this.syncQueue = [];
    this.isOnline = navigator?.onLine || true;
    this.githubToken = null; // Will be set when available for write operations
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
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

      // Try to load from GitHub
      console.log('🔍 Loading gaming hub progress from GitHub...');
      const url = `${this.baseUrl}/gaming-hub/${walletAddress}.json`;
      const response = await fetch(url);
      
      if (response.ok) {
        const progress = await response.json();
        this.cache.set(cacheKey, progress);
        console.log('✅ Gaming hub progress loaded from GitHub:', progress);
        return progress;
      } else {
        console.log('📝 Creating new gaming hub progress for wallet:', walletAddress);
        return this.createEmptyGamingHubProgress(walletAddress);
      }
    } catch (error) {
      console.error('❌ Error loading gaming hub progress:', error);
      // Return empty progress on error
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
      
      // Attempt to sync to GitHub (non-blocking)
      this.syncProgressToGitHub(walletAddress, 'gaming-hub', progress)
        .catch(error => console.log('ℹ️ GitHub sync skipped:', error.message));
      
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
   * Story Mode Progress Management
   */
  
  async getStoryModeProgress(walletAddress) {
    if (!walletAddress) {
      return this.createEmptyStoryModeProgress(walletAddress);
    }

    try {
      const cacheKey = `story-mode-${walletAddress}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const url = `${this.baseUrl}/story-mode/${walletAddress}.json`;
      const response = await fetch(url);
      
      if (response.ok) {
        const progress = await response.json();
        this.cache.set(cacheKey, progress);
        return progress;
      } else {
        return this.createEmptyStoryModeProgress(walletAddress);
      }
    } catch (error) {
      console.error('❌ Error loading story mode progress:', error);
      return this.createEmptyStoryModeProgress(walletAddress);
    }
  }

  async saveStoryModeProgress(walletAddress, chapterId, nodeId, nodeData) {
    if (!walletAddress) return;

    try {
      const progress = await this.getStoryModeProgress(walletAddress);
      
      // Initialize chapter progress if not exists
      if (!progress.chapterProgress[chapterId]) {
        progress.chapterProgress[chapterId] = {
          chapterStatus: 'not-started',
          currentNodeIndex: 0,
          totalNodes: this.getTotalNodes(chapterId),
          completedNodes: [],
          nodeProgress: []
        };
      }

      const chapterProgress = progress.chapterProgress[chapterId];
      
      // Update chapter status
      if (chapterProgress.chapterStatus === 'not-started') {
        chapterProgress.chapterStatus = 'in-progress';
      }
      
      // Add node progress
      const nodeProgress = {
        nodeId: nodeId,
        nodeType: nodeData.nodeType || 'story',
        isCompleted: nodeData.isCompleted || false,
        completedAt: nodeData.isCompleted ? new Date().toISOString() : null,
        attempts: nodeData.attempts || 1,
        userAnswers: nodeData.userAnswers || [],
        isCorrect: nodeData.isCorrect
      };
      
      // Update or add node progress
      const existingIndex = chapterProgress.nodeProgress.findIndex(n => n.nodeId === nodeId);
      if (existingIndex >= 0) {
        chapterProgress.nodeProgress[existingIndex] = nodeProgress;
      } else {
        chapterProgress.nodeProgress.push(nodeProgress);
      }
      
      // Update completed nodes
      if (nodeData.isCompleted && !chapterProgress.completedNodes.includes(nodeData.nodeIndex)) {
        chapterProgress.completedNodes.push(nodeData.nodeIndex);
        chapterProgress.currentNodeIndex = Math.max(chapterProgress.currentNodeIndex, nodeData.nodeIndex + 1);
      }
      
      // Check if chapter is complete
      if (chapterProgress.completedNodes.length >= chapterProgress.totalNodes) {
        chapterProgress.chapterStatus = 'completed';
      }
      
      // Update overall stats
      progress.overallStats.totalNodesCompleted = this.countTotalNodes(progress.chapterProgress);
      progress.lastUpdated = new Date().toISOString();
      
      // Cache and queue for sync
      const cacheKey = `story-mode-${walletAddress}`;
      this.cache.set(cacheKey, progress);
      // Attempt to sync to GitHub (non-blocking)
      this.syncProgressToGitHub(walletAddress, 'story-mode', progress)
        .catch(error => console.log('ℹ️ GitHub sync skipped:', error.message));
      
      console.log('💾 Story mode progress saved:', {
        wallet: walletAddress,
        chapter: chapterId,
        node: nodeId,
        progress: chapterProgress
      });
      
      return progress;
      
    } catch (error) {
      console.error('❌ Error saving story mode progress:', error);
      throw error;
    }
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

  createEmptyStoryModeProgress(walletAddress) {
    return {
      walletAddress: walletAddress || '',
      lastUpdated: new Date().toISOString(),
      chapterProgress: {},
      overallStats: {
        totalNodesCompleted: 0,
        totalQuizQuestions: 0,
        correctQuizAnswers: 0,
        chaptersCompleted: 0,
        totalPlayTime: 0
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

  getTotalNodes(chapterId) {
    // This would be dynamic based on actual story structure
    return 20; // Default value
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

  countTotalNodes(chapterProgress) {
    return Object.values(chapterProgress).reduce((total, chapter) => {
      return total + (chapter.completedNodes?.length || 0);
    }, 0);
  }

  queueForSync(mode, walletAddress, data) {
    this.syncQueue.push({ mode, walletAddress, data, timestamp: Date.now() });
    
    // If online, try to sync immediately
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;
    
    console.log(`🔄 Processing ${this.syncQueue.length} items in sync queue`);
    
    // Process each item in the queue
    const processPromises = this.syncQueue.map(async (item) => {
      try {
        const success = await this.syncProgressToGitHub(item.walletAddress, item.mode, item.data);
        if (success) {
          console.log('✅ Queued sync completed:', {
            mode: item.mode,
            wallet: `${item.walletAddress.substring(0, 6)}...${item.walletAddress.substring(-4)}`,
            timestamp: new Date(item.timestamp).toISOString()
          });
        }
        return success;
      } catch (error) {
        console.log('ℹ️ Queued sync failed (will retry later):', error.message);
        return false;
      }
    });
    
    // Wait for all syncs to complete
    const results = await Promise.allSettled(processPromises);
    
    // Remove successfully synced items from queue
    const failedItems = [];
    results.forEach((result, index) => {
      if (result.status === 'rejected' || !result.value) {
        failedItems.push(this.syncQueue[index]);
      }
    });
    
    // Keep failed items in queue for retry
    this.syncQueue = failedItems;
    
    if (failedItems.length > 0) {
      console.log(`ℹ️ ${failedItems.length} items remain in sync queue for retry`);
    } else {
      console.log('✅ All queued progress synced successfully');
    }
  }

  // Reset progress (for testing/demo purposes)
  async resetProgress(walletAddress, mode = 'both') {
    if (mode === 'gaming-hub' || mode === 'both') {
      this.cache.delete(`gaming-hub-${walletAddress}`);
    }
    if (mode === 'story-mode' || mode === 'both') {
      this.cache.delete(`story-mode-${walletAddress}`);
    }
    console.log(`🔄 Progress reset for ${walletAddress} (${mode})`);
  }

  /**
   * Sync progress to GitHub database (requires authentication for write operations)
   */
  async syncProgressToGitHub(walletAddress, mode, progressData) {
    if (!this.githubToken) {
      console.log('ℹ️ GitHub token not available - progress saved locally only');
      return false;
    }

    try {
      const filename = `${walletAddress.toLowerCase()}.json`;
      const path = `users/progress-tracking/${mode}/${filename}`;
      const content = btoa(JSON.stringify(progressData, null, 2));

      // Check if file exists to get SHA for update
      let sha = null;
      try {
        const checkResponse = await fetch(`${this.apiUrl}/${mode}/${filename}`, {
          headers: {
            'Authorization': `Bearer ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (checkResponse.ok) {
          const existingFile = await checkResponse.json();
          sha = existingFile.sha;
        }
      } catch (error) {
        console.log('📝 File does not exist, will create new');
      }

      // Create or update file
      const updateData = {
        message: `Update ${mode} progress for wallet ${walletAddress.substring(0, 6)}...${walletAddress.substring(-4)}`,
        content: content,
        ...(sha && { sha })
      };

      const response = await fetch(`${this.apiUrl}/${mode}/${filename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        console.log('✅ Progress synced to GitHub successfully');
        return true;
      } else {
        console.error('❌ GitHub sync failed:', response.status, response.statusText);
        return false;
      }

    } catch (error) {
      console.error('❌ Error syncing to GitHub:', error);
      return false;
    }
  }

  /**
   * Set GitHub token for write operations (optional)
   */
  setGitHubToken(token) {
    this.githubToken = token;
    console.log('🔑 GitHub token configured for progress sync');
  }
}

// Export singleton instance
const progressTracker = new ProgressTracker();

// Support both ES6 and CommonJS exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = progressTracker;
} else {
  // ES6 export for React components
  if (typeof window !== 'undefined') {
    window.progressTracker = progressTracker;
  }
}

export { progressTracker };
export default progressTracker;