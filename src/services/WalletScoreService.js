/**
 * WalletScoreService - Reads existing wallet scores from GitHub database
 * Following DEVELOPMENT_RULES.md - only focusing on wallet score reading functionality
 */

class WalletScoreService {
  constructor() {
    this.USER_SCORES_BASE_URL = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/users/Users_Scores';
    this.GITHUB_API_BASE_URL = 'https://api.github.com/repos/cyfocube/C_DataBase/contents/users/Users_Scores';
  }

  /**
   * Read wallet scores from GitHub database
   * @param {string} walletAddress - The wallet address to read scores for
   * @returns {Promise<Object|null>} - Wallet data object or null if not found
   */
  async readWalletScores(walletAddress) {
    if (!walletAddress) {
      console.warn('⚠️ No wallet address provided to readWalletScores');
      return null;
    }

    try {
      console.log(`🔍 Reading scores for wallet: ${walletAddress}`);
      
      // Method 1: Try direct raw GitHub URL (faster, no API limits)
      const rawUrl = `${this.USER_SCORES_BASE_URL}/${walletAddress}.json`;
      
      try {
        const rawResponse = await fetch(rawUrl);
        
        if (rawResponse.ok) {
          const walletData = await rawResponse.json();
          console.log(`✅ Successfully read wallet scores from raw GitHub:`, {
            wallet: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
            totalPoints: walletData.points?.total || 0,
            gamingHub: walletData.points?.gamingHub || {},
            storyMode: walletData.points?.storyMode || {},
            lastActive: walletData.lastActive
          });
          
          return this.normalizeWalletData(walletData);
        }
      } catch (rawError) {
        console.log(`📡 Raw URL failed, trying GitHub API...`);
      }
      
      // Method 2: Fallback to GitHub API (if token available)
      const githubToken = process.env.REACT_APP_GITHUB_TOKEN;
      if (githubToken) {
        try {
          const apiUrl = `${this.GITHUB_API_BASE_URL}/${walletAddress}.json`;
          const apiResponse = await fetch(apiUrl, {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'C-Cube-Wallet-App'
            }
          });
          
          if (apiResponse.ok) {
            const fileData = await apiResponse.json();
            const walletData = JSON.parse(atob(fileData.content));
            
            console.log(`✅ Successfully read wallet scores from GitHub API:`, {
              wallet: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
              totalPoints: walletData.points?.total || 0,
              gamingHub: walletData.points?.gamingHub || {},
              storyMode: walletData.points?.storyMode || {}
            });
            
            return this.normalizeWalletData(walletData);
          }
        } catch (apiError) {
          console.log(`📡 GitHub API failed:`, apiError.message);
        }
      }
      
      // Wallet not found in database
      console.log(`📭 No existing scores found for wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
      return null;
      
    } catch (error) {
      console.error('❌ Error reading wallet scores:', error);
      return null;
    }
  }

  /**
   * Normalize wallet data to ensure consistent structure
   * @param {Object} rawData - Raw wallet data from database
   * @returns {Object} - Normalized wallet data
   */
  normalizeWalletData(rawData) {
    const defaultStructure = {
      walletAddress: rawData.walletAddress || '',
      createdAt: rawData.createdAt || new Date().toISOString(),
      lastActive: rawData.lastActive || new Date().toISOString(),
      points: {
        gamingHub: {
          blockchainBasics: 0,
          smartContracts: 0,
          defiProtocols: 0,
          nftsWeb3: 0
        },
        storyMode: {
          chaptersCompleted: 0,
          totalScore: 0,
          chapter1: 0,
          chapter2: 0,
          chapter3: 0,
          chapter4: 0,
          chapter5: 0,
          chapter6: 0,
          chapter7: 0,
          chapter8: 0
        },
        achievements: {
          firstQuest: false,
          cryptoNovice: false,
          blockchainExplorer: false,
          defiMaster: false,
          speedLearner: false,
          perfectionist: false
        },
        total: 0
      },
      progress: {
        completedNodes: [],
        currentQuest: null,
        level: 1,
        xp: 0
      },
      settings: {
        autoSync: true,
        notifications: true
      }
    };

    // Merge with existing data, keeping structure consistent
    const normalized = {
      ...defaultStructure,
      ...rawData,
      points: {
        ...defaultStructure.points,
        ...rawData.points,
        gamingHub: {
          ...defaultStructure.points.gamingHub,
          ...rawData.points?.gamingHub
        },
        storyMode: {
          ...defaultStructure.points.storyMode,
          ...rawData.points?.storyMode
        },
        achievements: {
          ...defaultStructure.points.achievements,
          ...rawData.points?.achievements
        }
      },
      progress: {
        ...defaultStructure.progress,
        ...rawData.progress
      },
      settings: {
        ...defaultStructure.settings,
        ...rawData.settings
      }
    };

    // Recalculate total if needed
    if (normalized.points.total === 0 && rawData.points) {
      const gamingTotal = Object.values(normalized.points.gamingHub).reduce((sum, val) => sum + (val || 0), 0);
      const storyTotal = normalized.points.storyMode.totalScore || 
        Object.values(normalized.points.storyMode)
          .filter(val => typeof val === 'number')
          .reduce((sum, val) => sum + val, 0);
      
      normalized.points.total = gamingTotal + storyTotal;
    }

    return normalized;
  }

  /**
   * Get wallet scores formatted for different components
   * @param {string} walletAddress - The wallet address
   * @param {string} section - 'migrate', 'gaming', 'story', or 'all'
   * @returns {Promise<Object>} - Formatted scores for the requested section
   */
  async getWalletScoresForSection(walletAddress, section = 'all') {
    const walletData = await this.readWalletScores(walletAddress);
    
    if (!walletData) {
      return this.getEmptyScoresForSection(section);
    }

    switch (section) {
      case 'migrate':
        return {
          totalPoints: walletData.points.total,
          gamingHubTotal: Object.values(walletData.points.gamingHub).reduce((sum, val) => sum + val, 0),
          storyModeTotal: walletData.points.storyMode.totalScore,
          achievementsCount: Object.values(walletData.points.achievements).filter(Boolean).length,
          lastActive: walletData.lastActive,
          hasData: true
        };

      case 'gaming':
        return {
          blockchainBasics: walletData.points.gamingHub.blockchainBasics,
          smartContracts: walletData.points.gamingHub.smartContracts,
          defiProtocols: walletData.points.gamingHub.defiProtocols,
          nftsWeb3: walletData.points.gamingHub.nftsWeb3,
          total: Object.values(walletData.points.gamingHub).reduce((sum, val) => sum + val, 0),
          hasData: true
        };

      case 'story':
        return {
          chaptersCompleted: walletData.points.storyMode.chaptersCompleted,
          totalScore: walletData.points.storyMode.totalScore,
          chapterScores: {
            chapter1: walletData.points.storyMode.chapter1 || 0,
            chapter2: walletData.points.storyMode.chapter2 || 0,
            chapter3: walletData.points.storyMode.chapter3 || 0,
            chapter4: walletData.points.storyMode.chapter4 || 0,
            chapter5: walletData.points.storyMode.chapter5 || 0,
            chapter6: walletData.points.storyMode.chapter6 || 0,
            chapter7: walletData.points.storyMode.chapter7 || 0,
            chapter8: walletData.points.storyMode.chapter8 || 0
          },
          hasData: true
        };

      case 'all':
      default:
        return {
          ...walletData,
          hasData: true
        };
    }
  }

  /**
   * Get empty scores structure for sections when no wallet data exists
   * @param {string} section - The section type
   * @returns {Object} - Empty scores structure
   */
  getEmptyScoresForSection(section) {
    switch (section) {
      case 'migrate':
        return {
          totalPoints: 0,
          gamingHubTotal: 0,
          storyModeTotal: 0,
          achievementsCount: 0,
          lastActive: null,
          hasData: false
        };

      case 'gaming':
        return {
          blockchainBasics: 0,
          smartContracts: 0,
          defiProtocols: 0,
          nftsWeb3: 0,
          total: 0,
          hasData: false
        };

      case 'story':
        return {
          chaptersCompleted: 0,
          totalScore: 0,
          chapterScores: {
            chapter1: 0, chapter2: 0, chapter3: 0, chapter4: 0,
            chapter5: 0, chapter6: 0, chapter7: 0, chapter8: 0
          },
          hasData: false
        };

      case 'all':
      default:
        return {
          walletAddress: '',
          points: {
            total: 0,
            gamingHub: { blockchainBasics: 0, smartContracts: 0, defiProtocols: 0, nftsWeb3: 0 },
            storyMode: { chaptersCompleted: 0, totalScore: 0 },
            achievements: {}
          },
          hasData: false
        };
    }
  }

  /**
   * Check if a wallet exists in the database
   * @param {string} walletAddress - The wallet address to check
   * @returns {Promise<boolean>} - True if wallet exists, false otherwise
   */
  async walletExists(walletAddress) {
    try {
      const walletData = await this.readWalletScores(walletAddress);
      return walletData !== null;
    } catch (error) {
      console.error('❌ Error checking wallet existence:', error);
      return false;
    }
  }
}

// Create singleton instance
const walletScoreService = new WalletScoreService();

export default walletScoreService;