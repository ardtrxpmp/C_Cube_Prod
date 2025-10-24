/**
 * GitHub Database Service
 * Handles saving wallet data to the external C_DataBase repository
 * Repository: https://github.com/cyfocube/C_DataBase.git
 * Target path: users/Users_Scores/[wallet_address].json
 */

const GITHUB_CONFIG = {
  owner: 'cyfocube',
  repo: 'C_DataBase',
  branch: 'main',
  basePath: 'users/Users_Scores'
};

class GitHubDatabaseService {
  constructor() {
    // GitHub token should be set in environment or config
    this.githubToken = process.env.GITHUB_TOKEN || process.env.REACT_APP_GITHUB_TOKEN;
    this.baseUrl = 'https://api.github.com';
  }

  /**
   * Save wallet data to GitHub repository
   * @param {string} walletAddress - The wallet address
   * @param {object} userData - The user data to save
   * @returns {Promise<object>} Save result
   */
  async saveWalletToDatabase(walletAddress, userData) {
    try {
      console.log(`🔄 Saving wallet ${walletAddress} to GitHub database...`);
      
      const fileName = `${walletAddress}.json`;
      const filePath = `${GITHUB_CONFIG.basePath}/${fileName}`;
      const fileContent = JSON.stringify(userData, null, 2);
      
      // First, try to get the existing file to get its SHA (required for updates)
      let sha = null;
      try {
        const existingFile = await this.getFileFromGitHub(filePath);
        sha = existingFile.sha;
        console.log('📝 Updating existing wallet file');
      } catch (error) {
        console.log('📄 Creating new wallet file');
        // File doesn't exist, we'll create a new one
      }

      // Prepare the request to GitHub API
      const url = `${this.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
      const requestBody = {
        message: `Update wallet data for ${walletAddress}`,
        content: btoa(unescape(encodeURIComponent(fileContent))), // Base64 encode
        branch: GITHUB_CONFIG.branch
      };

      // If updating existing file, include SHA
      if (sha) {
        requestBody.sha = sha;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Successfully saved to GitHub database');
      
      return {
        success: true,
        message: `✅ Wallet data saved to GitHub database!`,
        githubUrl: result.content.html_url,
        sha: result.content.sha,
        walletAddress: walletAddress,
        totalPoints: userData.points.total
      };

    } catch (error) {
      console.error('❌ Error saving to GitHub database:', error);
      return {
        success: false,
        error: error.message,
        walletAddress: walletAddress
      };
    }
  }

  /**
   * Get existing file from GitHub repository
   * @param {string} filePath - Path to the file in repository
   * @returns {Promise<object>} File data
   */
  async getFileFromGitHub(filePath) {
    const url = `${this.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`File not found: ${filePath}`);
    }

    return await response.json();
  }

  /**
   * Check if wallet exists in database
   * @param {string} walletAddress - The wallet address to check
   * @returns {Promise<boolean>} Whether wallet exists
   */
  async walletExistsInDatabase(walletAddress) {
    try {
      const filePath = `${GITHUB_CONFIG.basePath}/${walletAddress}.json`;
      await this.getFileFromGitHub(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get wallet data from database
   * @param {string} walletAddress - The wallet address
   * @returns {Promise<object>} Wallet data
   */
  async getWalletFromDatabase(walletAddress) {
    try {
      const filePath = `${GITHUB_CONFIG.basePath}/${walletAddress}.json`;
      const fileData = await this.getFileFromGitHub(filePath);
      
      // Decode base64 content
      const content = decodeURIComponent(escape(atob(fileData.content)));
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to get wallet data: ${error.message}`);
    }
  }
}

// Export for use in React components
export default GitHubDatabaseService;