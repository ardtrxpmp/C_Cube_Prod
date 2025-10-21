/**
 * Gaming Hub Data Service
 * Use this in your React components to fetch questions from database
 */

class GamingHubDataService {
  constructor() {
    this.baseUrl = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/gaming-hub/questions.json';
    this.cache = null;
    this.cacheExpiry = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch gaming hub data with caching
   */
  async fetchGamingHubData() {
    // Check cache first
    if (this.cache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      console.log('📦 Using cached gaming hub data');
      return this.cache;
    }

    try {
      console.log('🌐 Fetching gaming hub data from database...');
      const response = await fetch(this.baseUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the data
      this.cache = data.gamingHub;
      this.cacheExpiry = Date.now() + this.cacheTimeout;
      
      console.log('✅ Gaming hub data loaded successfully');
      return this.cache;
      
    } catch (error) {
      console.error('❌ Error fetching gaming hub data:', error);
      
      // Return fallback data or null
      if (this.cache) {
        console.log('⚠️ Using stale cached data as fallback');
        return this.cache;
      }
      
      throw error;
    }
  }

  /**
   * Get specific category data
   */
  async getCategoryData(categoryId) {
    const data = await this.fetchGamingHubData();
    return data.categories.find(cat => cat.id === categoryId);
  }

  /**
   * Get all categories
   */
  async getAllCategories() {
    const data = await this.fetchGamingHubData();
    return data.categories;
  }

  /**
   * Get question sets for a category
   */
  async getQuestionSets(categoryId) {
    const category = await this.getCategoryData(categoryId);
    return category ? category.questionSets : [];
  }

  /**
   * Generate challenges for a category (like your current logic)
   */
  async generateChallenges(categoryId, numberOfChallenges) {
    const questionSets = await this.getQuestionSets(categoryId);
    const challenges = [];
    
    for (let i = 0; i < numberOfChallenges; i++) {
      const setIndex = i % questionSets.length;
      const questionSet = questionSets[setIndex];
      
      const challenge = {
        title: `${categoryId} Challenge ${i + 1}`,
        description: `Challenge ${i + 1}:`,
        dragItems: questionSet.items,
        dropZones: [
          {
            id: 'primary',
            label: questionSet.correctAnswers.coreQuestion.replace('Drop items for ', ''),
            accepts: questionSet.correctAnswers.coreItems
          },
          {
            id: 'secondary', 
            label: questionSet.correctAnswers.featuresQuestion.replace('Drop items for ', ''),
            accepts: questionSet.correctAnswers.featuresItems
          }
        ],
        educational: questionSet.explanation
      };
      
      challenges.push(challenge);
    }
    
    return challenges;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache = null;
    this.cacheExpiry = null;
    console.log('🗑️ Gaming hub cache cleared');
  }
}

// Create singleton instance
const gamingHubService = new GamingHubDataService();

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GamingHubDataService, gamingHubService };
}

if (typeof window !== 'undefined') {
  window.gamingHubService = gamingHubService;
  window.GamingHubDataService = GamingHubDataService;
}

// Usage examples:
/*

// Example 1: Basic fetch
gamingHubService.fetchGamingHubData()
  .then(data => console.log('All categories:', data.categories));

// Example 2: Get specific category
gamingHubService.getCategoryData('blockchain-basics')
  .then(category => console.log('Blockchain category:', category));

// Example 3: Generate challenges
gamingHubService.generateChallenges('blockchain-basics', 10)
  .then(challenges => console.log('Generated challenges:', challenges));

// Example 4: React Hook usage
function useGamingHubData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    gamingHubService.fetchGamingHubData()
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

*/