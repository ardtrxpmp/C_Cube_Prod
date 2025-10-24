/**
 * API Endpoint: Save User Scores to GitHub Database
 * Saves user points to https://github.com/cyfocube/C_DataBase.git users/Users_Scores/
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// GitHub configuration for external database repository
const GITHUB_CONFIG = {
  owner: 'cyfocube',
  repo: 'C_DataBase',
  branch: 'main',
  basePath: 'users/Users_Scores',
  token: process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN
};

// Fallback to local directory if GitHub not available
const LOCAL_USERS_SCORES_DIR = path.join(process.cwd(), '..', 'C_DataBase', 'users', 'Users_Scores');

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Validate Ethereum wallet address
function isValidWalletAddress(address) {
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(address);
}

// Validate user data schema
function validateUserData(userData) {
  const requiredFields = ['walletAddress', 'points', 'createdAt'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!(field in userData)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  // Validate wallet address
  if (!isValidWalletAddress(userData.walletAddress)) {
    return { valid: false, error: 'Invalid wallet address format' };
  }
  
  // Check points structure
  if (!userData.points || typeof userData.points !== 'object') {
    return { valid: false, error: 'Invalid points structure' };
  }
  
  // Check for expected points categories
  const expectedCategories = ['gamingHub', 'storyMode', 'achievements', 'total'];
  for (const category of expectedCategories) {
    if (!(category in userData.points)) {
      return { valid: false, error: `Missing points category: ${category}` };
    }
  }
  
  return { valid: true };
}

// Save to GitHub repository
async function saveToGitHub(walletAddress, userData) {
  try {
    console.log(`🔄 Saving ${walletAddress} to GitHub repository: ${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`);
    
    const fileName = `${walletAddress}.json`;
    const filePath = `${GITHUB_CONFIG.basePath}/${fileName}`;
    const fileContent = JSON.stringify(userData, null, 2);
    const encodedContent = Buffer.from(fileContent).toString('base64');

    // Check if file exists to get SHA
    let sha = null;
    const checkUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
    
    try {
      const checkResponse = await fetch(checkUrl, {
        headers: {
          'Authorization': `token ${GITHUB_CONFIG.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha;
        console.log('📝 Updating existing wallet file in GitHub');
        
        // Get existing data for merging
        const existingContent = Buffer.from(existingFile.content, 'base64').toString('utf-8');
        const existingData = JSON.parse(existingContent);
        userData = mergeUserData(existingData, userData);
      }
    } catch (error) {
      console.log('📄 Creating new wallet file in GitHub');
    }

    // Save to GitHub
    const saveUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
    const requestBody = {
      message: `Update wallet ${walletAddress} - ${userData.points.total} points`,
      content: Buffer.from(JSON.stringify(userData, null, 2)).toString('base64'),
      branch: GITHUB_CONFIG.branch
    };

    if (sha) {
      requestBody.sha = sha;
    }

    const saveResponse = await fetch(saveUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      throw new Error(`GitHub API error: ${saveResponse.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await saveResponse.json();
    console.log('✅ Successfully saved to GitHub database');

    return {
      success: true,
      method: 'github',
      githubUrl: result.content.html_url,
      sha: result.content.sha
    };

  } catch (error) {
    console.error('❌ GitHub save failed:', error);
    throw error;
  }
}

// Merge existing data with new data (keep higher values)
function mergeUserData(existingData, newData) {
  return {
    ...existingData,
    ...newData,
    lastActive: new Date().toISOString(),
    points: {
      ...existingData.points,
      ...newData.points,
      gamingHub: {
        ...existingData.points?.gamingHub,
        ...newData.points.gamingHub,
        blockchainBasics: Math.max(
          existingData.points?.gamingHub?.blockchainBasics || 0,
          newData.points.gamingHub?.blockchainBasics || 0
        ),
        smartContracts: Math.max(
          existingData.points?.gamingHub?.smartContracts || 0,
          newData.points.gamingHub?.smartContracts || 0
        ),
        defiProtocols: Math.max(
          existingData.points?.gamingHub?.defiProtocols || 0,
          newData.points.gamingHub?.defiProtocols || 0
        ),
        nftsWeb3: Math.max(
          existingData.points?.gamingHub?.nftsWeb3 || 0,
          newData.points.gamingHub?.nftsWeb3 || 0
        )
      },
      storyMode: {
        ...existingData.points?.storyMode,
        ...newData.points.storyMode,
        chaptersCompleted: Math.max(
          existingData.points?.storyMode?.chaptersCompleted || 0,
          newData.points.storyMode?.chaptersCompleted || 0
        ),
        totalScore: Math.max(
          existingData.points?.storyMode?.totalScore || 0,
          newData.points.storyMode?.totalScore || 0
        )
      },
      achievements: {
        ...existingData.points?.achievements,
        ...newData.points.achievements,
        firstQuest: existingData.points?.achievements?.firstQuest || newData.points.achievements?.firstQuest || false,
        cryptoNovice: existingData.points?.achievements?.cryptoNovice || newData.points.achievements?.cryptoNovice || false,
        blockchainExplorer: existingData.points?.achievements?.blockchainExplorer || newData.points.achievements?.blockchainExplorer || false,
        defiMaster: existingData.points?.achievements?.defiMaster || newData.points.achievements?.defiMaster || false,
        speedLearner: existingData.points?.achievements?.speedLearner || newData.points.achievements?.speedLearner || false,
        perfectionist: existingData.points?.achievements?.perfectionist || newData.points.achievements?.perfectionist || false
      }
    }
  };
}

// Express router setup
const express = require('express');
const router = express.Router();

// Main API handler
router.post('/', async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { walletAddress, userData } = req.body;

    // Validate input
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    if (!userData) {
      return res.status(400).json({
        success: false,
        error: 'User data is required'
      });
    }

    // Validate wallet address format
    if (!isValidWalletAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    // Validate user data structure
    const validation = validateUserData(userData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    let saveResult;
    let saveMethod = 'local';

    // Try GitHub first if token is available
    if (GITHUB_CONFIG.token) {
      try {
        saveResult = await saveToGitHub(walletAddress, userData);
        saveMethod = 'github';
      } catch (githubError) {
        console.warn('⚠️ GitHub save failed, falling back to local:', githubError.message);
        
        // Fallback to local save
        ensureDirectoryExists(LOCAL_USERS_SCORES_DIR);
        const fileName = `${walletAddress}.json`;
        const filePath = path.join(LOCAL_USERS_SCORES_DIR, fileName);
        
        console.log(`💾 Saving user scores locally to: ${filePath}`);
        
        saveResult = { success: true, method: 'local', filePath };
      }
    } else {
      console.log('⚠️ No GitHub token found, saving locally');
      
      // Save locally
      ensureDirectoryExists(LOCAL_USERS_SCORES_DIR);
      const fileName = `${walletAddress}.json`;
      const filePath = path.join(LOCAL_USERS_SCORES_DIR, fileName);
      
      console.log(`💾 Saving user scores locally to: ${filePath}`);
    }

    // For local save method, handle file operations
    if (saveMethod === 'local') {
      const fileName = `${walletAddress}.json`;
      const filePath = path.join(LOCAL_USERS_SCORES_DIR, fileName);
      const fileExists = fs.existsSync(filePath);
      
      if (fileExists) {
        console.log(`⚠️ Local file already exists, updating: ${walletAddress}`);
        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        userData = mergeUserData(existingData, userData);
      } else {
        console.log(`🆕 Creating new local user file: ${walletAddress}`);
      }

      // Write the file locally
      fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
      saveResult.filePath = filePath;
      saveResult.fileExists = fileExists;
    }

    console.log(`✅ User scores saved successfully for: ${walletAddress} via ${saveMethod}`);
    console.log(`📊 Total points saved: ${userData.points.total}`);

    // Return success response
    res.status(200).json({
      success: true,
      message: saveMethod === 'github' ? 
        'User scores saved to GitHub database successfully!' : 
        'User scores saved locally successfully!',
      data: {
        walletAddress: walletAddress,
        fileName: `${walletAddress}.json`,
        totalPoints: userData.points.total,
        gamingHubPoints: Object.values(userData.points.gamingHub).reduce((sum, val) => sum + val, 0),
        storyModePoints: userData.points.storyMode.totalScore,
        saveMethod: saveMethod,
        repository: saveMethod === 'github' ? `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}` : null,
        githubUrl: saveResult.githubUrl || null,
        filePath: saveResult.filePath || `${GITHUB_CONFIG.basePath}/${walletAddress}.json`,
        action: saveResult.fileExists !== undefined ? (saveResult.fileExists ? 'updated' : 'created') : 'saved'
      }
    });

  } catch (error) {
    console.error('❌ Error saving user scores:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
});

// Export the router
module.exports = router;

// For development/testing - Node.js direct execution
if (require.main === module) {
  // Test the function with sample data
  const testWalletAddress = '0x1234567890123456789012345678901234567890';
  const testUserData = {
    walletAddress: testWalletAddress,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    points: {
      gamingHub: {
        blockchainBasics: 5.5,
        smartContracts: 2.0,
        defiProtocols: 1.0,
        nftsWeb3: 0
      },
      storyMode: {
        chaptersCompleted: 1,
        totalScore: 25
      },
      achievements: {
        firstQuest: true,
        cryptoNovice: true,
        blockchainExplorer: false,
        defiMaster: false,
        speedLearner: false,
        perfectionist: false
      },
      total: 33.5
    },
    progress: {
      completedNodes: [],
      currentQuest: null,
      level: 4,
      xp: 335
    },
    settings: {
      autoSync: true,
      notifications: true
    }
  };

  console.log('🧪 Testing save-user-scores API...');
  
  // Mock request/response for testing
  const mockReq = {
    method: 'POST',
    body: {
      walletAddress: testWalletAddress,
      userData: testUserData
    }
  };
  
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        console.log(`Response ${code}:`, data);
      }
    })
  };
  
  handler(mockReq, mockRes);
}