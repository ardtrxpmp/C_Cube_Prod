#!/usr/bin/env node

/**
 * GitHub Database Setup Script
 * Helps configure the environment for saving to the C_DataBase repository
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupGitHubIntegration() {
  console.log('🔧 GitHub Database Integration Setup\n');
  console.log('This script will help you configure access to the external C_DataBase repository:');
  console.log('Repository: https://github.com/cyfocube/C_DataBase.git');
  console.log('Target Path: users/Users_Scores/[wallet_address].json\n');

  // Check if GitHub token exists
  const existingToken = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
  if (existingToken) {
    console.log('✅ GitHub token found in environment variables');
    const useExisting = await question('Use existing token? (y/n): ');
    if (useExisting.toLowerCase() === 'y') {
      console.log('✅ Using existing GitHub token');
      await testConnection(existingToken);
      rl.close();
      return;
    }
  }

  console.log('\n📋 To set up GitHub database access, you need:');
  console.log('1. A GitHub Personal Access Token with repository permissions');
  console.log('2. Write access to the cyfocube/C_DataBase repository\n');

  console.log('🔗 Create a token at: https://github.com/settings/tokens');
  console.log('Required permissions: repo (Full control of private repositories)\n');

  const token = await question('Enter your GitHub Personal Access Token: ');

  if (!token || token.trim().length < 20) {
    console.log('❌ Invalid token. GitHub tokens are typically 40+ characters.');
    rl.close();
    return;
  }

  console.log('\n🔄 Testing token...');
  const isValid = await testConnection(token.trim());

  if (isValid) {
    console.log('\n✅ Token is valid! Setting up environment...');
    
    // Create .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Remove existing GITHUB_TOKEN entries
    envContent = envContent.replace(/^GITHUB_TOKEN=.*$/gm, '');
    envContent = envContent.replace(/^GITHUB_ACCESS_TOKEN=.*$/gm, '');
    
    // Add new token
    envContent += `\nGITHUB_TOKEN=${token.trim()}\n`;
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Token saved to ${envPath}`);
    
    console.log('\n🎉 Setup Complete!');
    console.log('The "Save Points to Database" button will now save directly to GitHub.');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Test the button in your React app');
    console.log('3. Check the C_DataBase repository for saved wallet files');
    
  } else {
    console.log('❌ Token test failed. Please check the token and try again.');
  }

  rl.close();
}

async function testConnection(token) {
  try {
    const fetch = require('node-fetch');
    
    // Test API access
    const response = await fetch('https://api.github.com/repos/cyfocube/C_DataBase', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const repo = await response.json();
      console.log(`✅ Successfully connected to ${repo.full_name}`);
      console.log(`   Repository: ${repo.html_url}`);
      console.log(`   Permissions: ${repo.permissions?.push ? 'Write' : 'Read-only'}`);
      return true;
    } else {
      console.log(`❌ GitHub API error: ${response.status} ${response.statusText}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
    return false;
  }
}

// Run setup
setupGitHubIntegration().catch(error => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
});