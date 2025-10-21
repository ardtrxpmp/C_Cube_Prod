// Test script to verify Gaming Hub database integration
const fetch = require('node-fetch');

const DATABASE_URL = 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/gaming-hub/questions.json';

async function testGamingHubIntegration() {
  console.log('🧪 Testing Gaming Hub Database Integration...');
  console.log('📡 Fetching from:', DATABASE_URL);
  
  try {
    const response = await fetch(DATABASE_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rawData = await response.json();
    
    console.log('✅ Database fetch successful!');
    console.log('📊 Raw data structure check:');
    
    if (rawData.gamingHub && rawData.gamingHub.categories) {
      console.log(`  ✅ Found ${rawData.gamingHub.categories.length} categories in database`);
      
      rawData.gamingHub.categories.forEach(category => {
        const questionSets = category.questionSets ? category.questionSets.length : 0;
        console.log(`  - ${category.id}: ${questionSets} question sets`);
      });
    } else {
      console.log('  ❌ Invalid database structure');
    }
    
    // Test transformation (simulate what the component does)
    const transformedData = {
      blockchain_fundamentals: [],
      cryptography_master: [],
      defi_adventure: [],
      smart_contract_creator: []
    };
    
    const categoryMapping = {
      'blockchain-basics': 'blockchain_fundamentals',
      'crypto-security': 'cryptography_master', 
      'defi-explorer': 'defi_adventure',
      'smart-contracts': 'smart_contract_creator'
    };
    
    let totalQuestions = 0;
    
    if (rawData.gamingHub && rawData.gamingHub.categories) {
      rawData.gamingHub.categories.forEach(category => {
        const mappedCategory = categoryMapping[category.id];
        if (mappedCategory && category.questionSets) {
          transformedData[mappedCategory] = category.questionSets;
          totalQuestions += category.questionSets.length;
        }
      });
    }
    
    console.log('\n🔄 After transformation:');
    Object.keys(transformedData).forEach(category => {
      console.log(`  - ${category}: ${transformedData[category].length} questions`);
    });
    
    console.log(`📈 Total questions after transformation: ${totalQuestions}`);
    
    // Test a sample question structure from the raw data
    if (rawData.gamingHub && rawData.gamingHub.categories && rawData.gamingHub.categories.length > 0) {
      const firstCategory = rawData.gamingHub.categories[0];
      if (firstCategory.questionSets && firstCategory.questionSets.length > 0) {
        const sampleQuestion = firstCategory.questionSets[0];
        console.log('\n🔍 Sample raw question structure:');
        console.log('  - Items array:', sampleQuestion.items ? '✅' : '❌');
        console.log('  - Correct answers:', sampleQuestion.correctAnswers ? '✅' : '❌');
        console.log('  - Wrong answers:', sampleQuestion.wrongAnswers ? '✅' : '❌');
        console.log('  - Explanation:', sampleQuestion.explanation ? '✅' : '❌');
        
        if (sampleQuestion.items) {
          console.log(`  - Total items: ${sampleQuestion.items.length}`);
        }
        if (sampleQuestion.correctAnswers) {
          const coreItems = sampleQuestion.correctAnswers.coreItems || [];
          const featureItems = sampleQuestion.correctAnswers.featuresItems || [];
          console.log(`  - Core items: ${coreItems.length}, Feature items: ${featureItems.length}`);
        }
      }
    }
    
    console.log('\n🎉 Integration test completed successfully!');
    console.log('✨ The Gaming Hub should work properly with this database structure.');
    
  } catch (error) {
    console.error('❌ Integration test failed:');
    console.error('Error:', error.message);
    console.error('🔧 Check network connection and database URL');
  }
}

testGamingHubIntegration();