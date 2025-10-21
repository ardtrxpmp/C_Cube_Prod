const https = require('https');

async function testDatabaseAccess() {
  console.log('🔍 Testing Gaming Hub Database Access...');
  
  const url = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/gaming-hub/questions.json';
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      
      console.log(`📡 Response Status: ${response.statusCode}`);
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const gamingHub = jsonData.gamingHub;
          
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
          
          console.log('\n🎯 Database Access Test: PASSED ✅');
          console.log('🔗 Direct URL:', url);
          
          resolve(gamingHub);
          
        } catch (error) {
          reject(new Error(`JSON Parse Error: ${error.message}`));
        }
      });
      
    }).on('error', (error) => {
      reject(new Error(`Request Error: ${error.message}`));
    });
  });
}

// Run the test
testDatabaseAccess()
  .then(() => {
    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database access test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if the C_DataBase repository is public');
    console.log('   2. Verify the file exists at: gaming-hub/questions.json');
    console.log('   3. Check your internet connection');
    console.log('   4. Verify the upload was successful');
    process.exit(1);
  });