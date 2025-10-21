#!/usr/bin/env node

/**
 * Gaming Hub Database Upload Script
 * Pushes gaming hub questions data to C_DataBase GitHub repository
 * 
 * Usage: node upload-gaming-hub-data.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  DATABASE_REPO: 'https://github.com/cyfocube/C_DataBase.git',
  LOCAL_TEMP_DIR: './temp-database',
  JSON_FILE: './database/gaming-hub-questions.json',
  TARGET_PATH: 'gaming-hub/questions.json'
};

async function uploadToDatabase() {
  console.log('🚀 Starting Gaming Hub Database Upload...');
  
  try {
    // Step 1: Check if JSON file exists
    if (!fs.existsSync(CONFIG.JSON_FILE)) {
      throw new Error(`Gaming hub JSON file not found: ${CONFIG.JSON_FILE}`);
    }
    
    console.log('✅ Gaming hub JSON file found');
    
    // Step 2: Clean up any existing temp directory
    if (fs.existsSync(CONFIG.LOCAL_TEMP_DIR)) {
      execSync(`rm -rf ${CONFIG.LOCAL_TEMP_DIR}`, { stdio: 'inherit' });
    }
    
    // Step 3: Clone the database repository
    console.log('📥 Cloning C_DataBase repository...');
    execSync(`git clone ${CONFIG.DATABASE_REPO} ${CONFIG.LOCAL_TEMP_DIR}`, { stdio: 'inherit' });
    
    // Step 4: Create directory structure if needed
    const targetDir = path.join(CONFIG.LOCAL_TEMP_DIR, path.dirname(CONFIG.TARGET_PATH));
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log('📁 Created directory structure');
    }
    
    // Step 5: Copy JSON file to database repository
    const sourceFile = CONFIG.JSON_FILE;
    const targetFile = path.join(CONFIG.LOCAL_TEMP_DIR, CONFIG.TARGET_PATH);
    
    fs.copyFileSync(sourceFile, targetFile);
    console.log('📄 Copied gaming hub data to database repository');
    
    // Step 6: Read and validate JSON data
    const jsonData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    const stats = {
      categories: jsonData.gamingHub.categories.length,
      totalQuestionSets: jsonData.gamingHub.categories.reduce((sum, cat) => sum + cat.questionSets.length, 0),
      totalChallenges: jsonData.gamingHub.categories.reduce((sum, cat) => sum + cat.totalChallenges, 0)
    };
    
    console.log('📊 Data Statistics:');
    console.log(`   - Categories: ${stats.categories}`);
    console.log(`   - Question Sets: ${stats.totalQuestionSets}`);
    console.log(`   - Total Challenges: ${stats.totalChallenges}`);
    
    // Step 7: Commit and push to database repository
    process.chdir(CONFIG.LOCAL_TEMP_DIR);
    
    execSync('git add .', { stdio: 'inherit' });
    
    const commitMessage = `Update Gaming Hub Questions - ${new Date().toISOString()}
    
📊 Updated Data:
- ${stats.categories} categories
- ${stats.totalQuestionSets} question sets  
- ${stats.totalChallenges} total challenges

🎮 Categories:
- 📚 Blockchain Fundamentals (10 challenges)
- 🔐 Cryptography Master (50 challenges)  
- 💰 DeFi Adventure (50 challenges)
- 📝 Smart Contract Creator (50 challenges)

Generated from C-Cube Gaming Hub`;
    
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('🎉 Successfully uploaded gaming hub data to database!');
    console.log(`📍 Database location: ${CONFIG.DATABASE_REPO}`);
    console.log(`📂 File path: ${CONFIG.TARGET_PATH}`);
    
    // Step 8: Clean up temp directory
    process.chdir('..');
    execSync(`rm -rf ${CONFIG.LOCAL_TEMP_DIR}`, { stdio: 'inherit' });
    console.log('🧹 Cleaned up temporary files');
    
    // Step 9: Generate API endpoint info
    console.log('\n📡 API Access Information:');
    console.log('Raw GitHub URL:');
    console.log(`https://raw.githubusercontent.com/cyfocube/C_DataBase/main/${CONFIG.TARGET_PATH}`);
    console.log('\nExample fetch code:');
    console.log(`fetch('https://raw.githubusercontent.com/cyfocube/C_DataBase/main/${CONFIG.TARGET_PATH}')`);
    console.log('  .then(response => response.json())');
    console.log('  .then(data => console.log(data.gamingHub));');
    
  } catch (error) {
    console.error('❌ Error uploading to database:', error.message);
    
    // Clean up on error
    if (fs.existsSync(CONFIG.LOCAL_TEMP_DIR)) {
      try {
        execSync(`rm -rf ${CONFIG.LOCAL_TEMP_DIR}`, { stdio: 'pipe' });
      } catch (cleanupError) {
        console.error('⚠️  Warning: Could not clean up temp directory');
      }
    }
    
    process.exit(1);
  }
}

// Run the upload process
if (require.main === module) {
  uploadToDatabase().catch(console.error);
}

module.exports = { uploadToDatabase };