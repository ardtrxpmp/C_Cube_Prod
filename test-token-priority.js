#!/usr/bin/env node

/**
 * Token Priority Test
 * Tests which GitHub token the API will use for saving wallet data
 */

require('dotenv').config();

console.log('🔧 GitHub Token Configuration Test\n');

const tokens = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_ACCESS_TOKEN: process.env.GITHUB_ACCESS_TOKEN,
  GITHUB_PAT_TOKEN: process.env.GITHUB_PAT_TOKEN
};

console.log('📋 Available Tokens:');
Object.entries(tokens).forEach(([name, token]) => {
  if (token) {
    const prefix = token.startsWith('ghp_') ? 'Classic PAT' : 
                  token.startsWith('github_pat_') ? 'Fine-grained PAT' : 'Unknown';
    console.log(`   ✅ ${name}: ${token.slice(0, 15)}... (${prefix})`);
  } else {
    console.log(`   ❌ ${name}: Not set`);
  }
});

console.log('\n🔄 API Token Selection Logic:');
const selectedToken = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
if (selectedToken) {
  const tokenType = selectedToken.startsWith('ghp_') ? 'Classic PAT (ghp_)' : 
                   selectedToken.startsWith('github_pat_') ? 'Fine-grained PAT (github_pat_)' : 'Unknown';
  console.log(`   🎯 Will use: ${selectedToken.slice(0, 15)}... (${tokenType})`);
  console.log(`   📍 This is the token that worked in our test!`);
} else {
  console.log('   ❌ No suitable token found for API');
}

console.log('\n✅ Ready for React App Test:');
console.log('1. Connect a wallet in your app');
console.log('2. Earn some points (complete activities)');
console.log('3. Click "💾 Save Points to Database" button');
console.log('4. Check the GitHub repository for your wallet file');

console.log('\n🔗 GitHub Repository:');
console.log('   Repository: https://github.com/cyfocube/C_DataBase');
console.log('   Directory: https://github.com/cyfocube/C_DataBase/tree/main/users/Users_Scores');
console.log('   Your file will be: users/Users_Scores/[your_wallet_address].json');