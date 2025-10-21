/**
 * Test Wallet Progress Tracking
 * Tests the progress tracking functionality with mock wallet data
 */

const progressTracker = require('./progressTracker-test.js');

// Mock wallet address for testing
const testWalletAddress = '0x1234567890123456789012345678901234567890';

async function testProgressTracking() {
  console.log('🧪 Testing Wallet Progress Tracking System');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Get empty progress for new wallet
    console.log('\n📝 Test 1: Loading progress for new wallet');
    let progress = await progressTracker.getGamingHubProgress(testWalletAddress);
    console.log('Initial progress:', JSON.stringify(progress, null, 2));
    
    // Test 2: Save progress for blockchain-basics quest
    console.log('\n📝 Test 2: Saving progress for blockchain-basics');
    await progressTracker.saveGamingHubProgress(
      testWalletAddress,
      'blockchain-basics',
      0,
      {
        questionId: 'blockchain-basics-challenge-0-question-core',
        isCorrect: true,
        userAnswer: 'Block',
        correctAnswers: ['Block', 'Transaction'],
        challengeComplete: false
      }
    );
    
    await progressTracker.saveGamingHubProgress(
      testWalletAddress,
      'blockchain-basics',
      0,
      {
        questionId: 'blockchain-basics-challenge-0-question-features',
        isCorrect: true,
        userAnswer: 'Hash',
        correctAnswers: ['Hash'],
        challengeComplete: true
      }
    );
    
    // Test 3: Get updated progress
    console.log('\n📝 Test 3: Checking updated progress');
    progress = await progressTracker.getGamingHubProgress(testWalletAddress);
    console.log('Updated progress:', JSON.stringify(progress.questProgress['blockchain-basics'], null, 2));
    
    // Test 4: Get next uncompleted challenge
    console.log('\n📝 Test 4: Finding next uncompleted challenge');
    const nextChallenge = await progressTracker.getNextUncompletedChallenge(testWalletAddress, 'blockchain-basics');
    console.log('Next challenge:', nextChallenge);
    
    // Test 5: Save progress for multiple challenges
    console.log('\n📝 Test 5: Completing multiple challenges');
    for (let i = 1; i < 5; i++) {
      await progressTracker.saveGamingHubProgress(
        testWalletAddress,
        'blockchain-basics',
        i,
        {
          questionId: `blockchain-basics-challenge-${i}-question-1`,
          isCorrect: Math.random() > 0.3, // 70% correct rate
          userAnswer: `Answer${i}`,
          correctAnswers: [`Answer${i}`],
          challengeComplete: true
        }
      );
    }
    
    // Test 6: Check final progress
    console.log('\n📝 Test 6: Checking final progress');
    progress = await progressTracker.getGamingHubProgress(testWalletAddress);
    console.log('Final overall stats:', progress.overallStats);
    console.log('Blockchain-basics quest status:', progress.questProgress['blockchain-basics'].questStatus);
    
    // Test 7: Test different quest
    console.log('\n📝 Test 7: Starting crypto-security quest');
    await progressTracker.saveGamingHubProgress(
      testWalletAddress,
      'crypto-security',
      0,
      {
        questionId: 'crypto-security-challenge-0-question-1',
        isCorrect: false,
        userAnswer: 'WrongAnswer',
        correctAnswers: ['CorrectAnswer'],
        challengeComplete: false
      }
    );
    
    const finalProgress = await progressTracker.getGamingHubProgress(testWalletAddress);
    console.log('Multiple quests progress:', Object.keys(finalProgress.questProgress));
    
    // Test 8: Test resume functionality
    console.log('\n📝 Test 8: Testing resume functionality');
    const resumePoint = await progressTracker.getNextUncompletedChallenge(testWalletAddress, 'blockchain-basics');
    console.log('Resume point for blockchain-basics:', resumePoint);
    
    const cryptoResumePoint = await progressTracker.getNextUncompletedChallenge(testWalletAddress, 'crypto-security');
    console.log('Resume point for crypto-security:', cryptoResumePoint);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testProgressTracking();
}

module.exports = { testProgressTracking };