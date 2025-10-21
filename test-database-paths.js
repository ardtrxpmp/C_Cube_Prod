// Test script to verify database paths for Story Mode and Gaming Hub
const testDatabasePaths = async () => {
  console.log('🧪 Testing Database Paths...\n');
  
  const paths = [
    {
      name: 'Story Mode',
      url: 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/questions/story-mode/questions.json',
      component: 'StoryModeLearning'
    },
    {
      name: 'Gaming Hub',
      url: 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/questions/gamified-learning/questions.json',
      component: 'GamifiedLearningHub'
    },
    {
      name: 'Alternative Story Mode Path',
      url: 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/story-mode/questions.json',
      component: 'Original StoryModeLearning'
    },
    {
      name: 'Alternative Gaming Hub Path',
      url: 'https://raw.githubusercontent.com/cyfocube/C_DataBase/main/gaming-hub/questions.json',
      component: 'Original GamifiedLearningHub'
    }
  ];
  
  for (const path of paths) {
    try {
      console.log(`📡 Testing ${path.name}...`);
      console.log(`🔗 URL: ${path.url}`);
      
      const response = await fetch(path.url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS: ${path.name} found!`);
        console.log(`📊 Data type: ${typeof data}`);
        console.log(`📝 Keys: ${Object.keys(data).join(', ')}`);
        
        if (data.metadata) {
          console.log(`ℹ️  Metadata: ${data.metadata.name || 'No name'}`);
        }
        
        if (data.storyMode) {
          console.log(`📚 Story Mode chapters: ${data.storyMode.chapters?.length || 0}`);
        }
        
        if (data.gamingHub) {
          console.log(`🎮 Gaming Hub categories: ${data.gamingHub.categories?.length || 0}`);
        }
        
        console.log(`📏 Response size: ${JSON.stringify(data).length} characters`);
      } else {
        console.log(`❌ FAILED: ${path.name} - HTTP ${response.status}`);
        console.log(`💬 Status: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${path.name} - ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }
  
  console.log('\n📋 Summary:');
  console.log('🎯 Updated paths based on database structure:');
  console.log('   Story Mode: questions/story-mode/questions.json');
  console.log('   Gaming Hub: questions/gamified-learning/questions.json');
  console.log('\n🔧 Components updated with new paths!');
};

// Run the test
testDatabasePaths().catch(console.error);