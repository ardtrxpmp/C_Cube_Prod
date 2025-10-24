#!/usr/bin/env node

/**
 * Direct GitHub API Test
 * Tests the GitHub token and repository access directly
 */

require('dotenv').config();
const fetch = require('node-fetch');

const GITHUB_CONFIG = {
  owner: 'cyfocube',
  repo: 'C_DataBase',
  branch: 'main',
  basePath: 'users/Users_Scores',
  token: process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN
};

async function testDirectGitHubAccess() {
  console.log('🧪 Direct GitHub API Test');
  console.log(`📁 Repository: https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`);
  console.log(`🔑 Token: ${GITHUB_CONFIG.token ? `${GITHUB_CONFIG.token.slice(0, 20)}...` : 'Missing ❌'}`);
  console.log('');

  if (!GITHUB_CONFIG.token) {
    console.log('❌ No GitHub token found in environment variables');
    console.log('💡 Expected: GITHUB_TOKEN or GITHUB_ACCESS_TOKEN in .env file');
    return;
  }

  try {
    // Test repository access
    console.log('1️⃣ Testing repository access...');
    const repoUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`;
    
    const repoResponse = await fetch(repoUrl, {
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'C-Cube-Wallet-Integration'
      }
    });

    if (!repoResponse.ok) {
      const error = await repoResponse.text();
      throw new Error(`Repository access failed: ${repoResponse.status} - ${error}`);
    }

    const repoData = await repoResponse.json();
    console.log(`✅ Repository accessible: ${repoData.full_name}`);
    console.log(`   Default branch: ${repoData.default_branch}`);
    console.log(`   Private: ${repoData.private ? 'Yes' : 'No'}`);
    
    // Check permissions
    if (repoData.permissions) {
      const perms = [];
      if (repoData.permissions.admin) perms.push('admin');
      if (repoData.permissions.maintain) perms.push('maintain');
      if (repoData.permissions.push) perms.push('push');
      if (repoData.permissions.triage) perms.push('triage');
      if (repoData.permissions.pull) perms.push('pull');
      console.log(`   Permissions: ${perms.join(', ')}`);
    }
    console.log('');

    // Test Users_Scores directory
    console.log('2️⃣ Testing Users_Scores directory...');
    const dirUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.basePath}`;
    
    const dirResponse = await fetch(dirUrl, {
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'C-Cube-Wallet-Integration'
      }
    });

    if (!dirResponse.ok) {
      console.log(`⚠️ Users_Scores directory response: ${dirResponse.status}`);
      if (dirResponse.status === 404) {
        console.log('   Directory may not exist - will be created when first wallet is saved');
      }
    } else {
      const dirData = await dirResponse.json();
      const jsonFiles = dirData.filter(file => file.name.endsWith('.json'));
      console.log(`✅ Users_Scores directory found with ${jsonFiles.length} wallet files`);
      
      if (jsonFiles.length > 0) {
        console.log(`   Example files:`);
        jsonFiles.slice(0, 5).forEach(file => {
          console.log(`     - ${file.name} (${Math.round(file.size / 1024)}KB)`);
        });
        if (jsonFiles.length > 5) {
          console.log(`     ... and ${jsonFiles.length - 5} more files`);
        }
      }
    }
    console.log('');

    // Test creating a wallet file
    console.log('3️⃣ Testing wallet file creation...');
    const testWallet = '0x1234567890ABCDEF1234567890ABCDEF12345678';
    const testData = {
      walletAddress: testWallet,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      points: {
        gamingHub: {
          blockchainBasics: 10,
          smartContracts: 5,
          defiProtocols: 3,
          nftsWeb3: 2
        },
        storyMode: {
          chaptersCompleted: 2,
          totalScore: 30
        },
        achievements: {
          firstQuest: true,
          cryptoNovice: true,
          blockchainExplorer: false,
          defiMaster: false,
          speedLearner: false,
          perfectionist: false
        },
        total: 50
      },
      progress: {
        completedNodes: ['intro'],
        currentQuest: 'blockchain-basics',
        level: 5,
        xp: 500
      },
      settings: {
        autoSync: true,
        notifications: true
      }
    };

    const fileName = `${testWallet}.json`;
    const filePath = `${GITHUB_CONFIG.basePath}/${fileName}`;
    const fileContent = JSON.stringify(testData, null, 2);
    const encodedContent = Buffer.from(fileContent).toString('base64');

    // Check if file exists
    const checkUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
    let existingSha = null;
    
    try {
      const checkResponse = await fetch(checkUrl, {
        headers: {
          'Authorization': `token ${GITHUB_CONFIG.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'C-Cube-Wallet-Integration'
        }
      });

      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        existingSha = existingFile.sha;
        console.log(`📝 Test file exists, updating (SHA: ${existingSha.slice(0, 8)}...)`);
      }
    } catch (error) {
      console.log('📄 Test file doesn\'t exist, creating new');
    }

    // Create/update the file
    const saveUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
    const requestBody = {
      message: `Test: Update wallet ${testWallet} - ${testData.points.total} points`,
      content: encodedContent,
      branch: GITHUB_CONFIG.branch
    };

    if (existingSha) {
      requestBody.sha = existingSha;
    }

    const saveResponse = await fetch(saveUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'C-Cube-Wallet-Integration'
      },
      body: JSON.stringify(requestBody)
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.text();
      console.log(`❌ Save failed (${saveResponse.status}):`, errorData);
      throw new Error(`Save failed: ${saveResponse.status}`);
    }

    const saveResult = await saveResponse.json();
    console.log('✅ Test wallet file saved successfully!');
    console.log(`   File: ${fileName}`);
    console.log(`   URL: ${saveResult.content.html_url}`);
    console.log(`   SHA: ${saveResult.content.sha.slice(0, 8)}...`);
    console.log(`   Size: ${Math.round(saveResult.content.size / 1024)}KB`);
    console.log('');

    console.log('🎉 SUCCESS! GitHub database integration is working perfectly!');
    console.log('');
    console.log('✅ What this means:');
    console.log(`   • Your wallet data will be saved to: ${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`);
    console.log('   • Files are stored as: users/Users_Scores/[wallet_address].json');
    console.log('   • The "Save Points to Database" button will work correctly');
    console.log('   • Data is automatically backed up to GitHub');
    console.log('');
    console.log('🚀 Ready to use! Try the "Save Points to Database" button in your React app.');

  } catch (error) {
    console.error('❌ GitHub API test failed:', error.message);
    console.log('');
    console.log('🔧 Common issues:');
    console.log('1. Token permissions: Make sure the token has "repo" scope');
    console.log('2. Repository access: Verify you can access the C_DataBase repo');
    console.log('3. Token format: Should start with "github_pat_" or "ghp_"');
    console.log('4. Repository exists: Check that cyfocube/C_DataBase exists');
  }
}

testDirectGitHubAccess();