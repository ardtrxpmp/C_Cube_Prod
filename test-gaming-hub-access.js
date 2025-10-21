/**
 * Test Gaming Hub Database Access
 * Run this to verify your uploaded data is accessible
 */

const testGamingHubDatabase = async () => {
  console.log('🔍 Testing Gaming Hub Database Access...');
  
  try {
    const response = await fetch('https://raw.githubusercontent.com/cyfocube/C_DataBase/main/gaming-hub/questions.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const gamingHub = data.gamingHub;
    
    console.log('✅ Successfully fetched gaming hub data!');
    console.log('\n📊 Database Statistics:');
    console.log(`   Categories: ${gamingHub.categories.length}`);
    console.log(`   Total Challenges: ${gamingHub.metadata.totalChallenges}`);
    console.log(`   Version: ${gamingHub.metadata.version}`);
    console.log(`   Last Updated: ${gamingHub.metadata.lastUpdated}`);
    
    console.log('\n🎮 Categories Found:');
    gamingHub.categories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.title} (${category.difficulty})`);
      console.log(`      - ${category.totalChallenges} challenges`);
      console.log(`      - ${category.questionSets.length} question sets`);
      console.log(`      - ${category.pointsPerChallenge} points per challenge`);
    });
    
    // Test accessing specific category data
    const blockchainFundamentals = gamingHub.categories.find(cat => cat.id === 'blockchain-basics');
    if (blockchainFundamentals) {
      console.log('\n🔗 Sample Question Set (Blockchain Fundamentals):');
      const firstSet = blockchainFundamentals.questionSets[0];
      console.log(`   Question 1: "${firstSet.correctAnswers.coreQuestion}"`);
      console.log(`   Correct Answers: ${firstSet.correctAnswers.coreItems.join(', ')}`);
      console.log(`   Question 2: "${firstSet.correctAnswers.featuresQuestion}"`);
      console.log(`   Correct Answer: ${firstSet.correctAnswers.featuresItems[0]}`);
      console.log(`   Available Items: ${firstSet.items.join(', ')}`);
    }
    
    return gamingHub;
    
  } catch (error) {
    console.error('❌ Error accessing gaming hub database:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if the repository is public');
    console.log('   2. Verify the file path: gaming-hub/questions.json');
    console.log('   3. Ensure the data was uploaded correctly');
    return null;
  }
};

// For browser environment
if (typeof window !== 'undefined') {
  // Add to global scope for browser testing
  window.testGamingHubDatabase = testGamingHubDatabase;
  console.log('🌐 Run testGamingHubDatabase() in browser console to test');
}

// For Node.js environment (if you want to test server-side)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testGamingHubDatabase };
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment - don't auto-run, let user decide
  console.log('🎯 Gaming Hub Database Test Ready!');
  console.log('Run: testGamingHubDatabase()');
}