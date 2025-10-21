// Test script for Story Mode chapter loading
const fs = require('fs');

// Mock the component's fetchStoryModeData function
const fetchStoryModeData = async () => {
  try {
    console.log('📚 Fetching Story Mode chapters from individual files...');
    
    // Define all 10 chapters with their actual file names from the database
    const chapterFiles = [
      { id: 1, filename: 'chapter-01-blockchain-fundamentals.json', title: '🏗️ Blockchain Fundamentals' },
      { id: 2, filename: 'chapter-02-cryptography---security.json', title: '🔐 Cryptography & Security' },
      { id: 3, filename: 'chapter-03-mining---consensus.json', title: '⛏️ Mining & Consensus' },
      { id: 4, filename: 'chapter-04-bitcoin-fundamentals.json', title: '₿ Bitcoin Fundamentals' },
      { id: 5, filename: 'chapter-05-ethereum---smart-contracts.json', title: '📜 Ethereum & Smart Contracts' },
      { id: 6, filename: 'chapter-06-defi--decentralized-finance-.json', title: '🏦 Decentralized Finance (DeFi)' },
      { id: 7, filename: 'chapter-07-nfts---digital-ownership.json', title: '🎨 NFTs & Digital Ownership' },
      { id: 8, filename: 'chapter-08-interoperability---scaling.json', title: '🌐 Interoperability & Scaling' },
      { id: 9, filename: 'chapter-09-governance---daos.json', title: '🏛️ Governance & DAOs' },
      { id: 10, filename: 'chapter-10-web3---the-future.json', title: '🚀 Web3 & The Future' }
    ];
    
    const transformedChapters = [];
    let successCount = 0;
    let placeholderCount = 0;
    let errorCount = 0;
    
    // Fetch each chapter individually
    for (const chapterInfo of chapterFiles) {
      try {
        const chapterUrl = `https://raw.githubusercontent.com/cyfocube/C_DataBase/main/story-mode/${chapterInfo.filename}`;
        console.log(`📖 Testing ${chapterInfo.title}...`);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(chapterUrl);
        
        if (!response.ok) {
          console.warn(`⚠️ Chapter ${chapterInfo.id} not found (${response.status}), would create placeholder`);
          placeholderCount++;
          continue;
        }
        
        const chapterData = await response.json();
        console.log(`✅ Successfully loaded ${chapterInfo.title} with ${chapterData.questions ? chapterData.questions.length : 0} questions`);
        successCount++;
        
      } catch (chapterError) {
        console.error(`❌ Error loading chapter ${chapterInfo.id}:`, chapterError.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Successfully loaded: ${successCount} chapters`);
    console.log(`⚠️ Missing (placeholders): ${placeholderCount} chapters`);
    console.log(`❌ Errors: ${errorCount} chapters`);
    console.log(`📚 Total chapters expected: ${chapterFiles.length}`);
    
    return { successCount, placeholderCount, errorCount, total: chapterFiles.length };
    
  } catch (error) {
    console.error('❌ Critical error in fetchStoryModeData:', error);
    return null;
  }
};

// Run the test
fetchStoryModeData().then(result => {
  if (result) {
    console.log('\n🎯 Story Mode chapter loading test completed!');
    console.log('The component should now work with individual chapter files.');
  } else {
    console.log('\n💥 Test failed - check the error above');
  }
}).catch(error => {
  console.error('💥 Test script failed:', error);
});