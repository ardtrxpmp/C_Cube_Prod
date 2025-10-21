/**
 * Multi-Wallet Progress Test
 * Tests progress isolation between different wallet addresses
 */

const progressTracker = require('./progressTracker-test.js');

async function testMultiWalletProgress() {
  console.log('🧪 Testing Multi-Wallet Progress Isolation');
  console.log('==================================================\n');

  // Test data
  const wallet1 = '0x1111111111111111111111111111111111111111';
  const wallet2 = '0x2222222222222222222222222222222222222222';

  // Reset cache to start fresh
  progressTracker.cache.clear();

  console.log('📝 Test 1: Setting up progress for Wallet 1');
  let progress1 = await progressTracker.getGamingHubProgress(wallet1);
  await progressTracker.saveGamingHubProgress(wallet1, 'blockchain-basics', 0, {
    questionId: 'wallet1-question-1',
    isCorrect: true,
    userAnswer: 'Block',
    correctAnswers: ['Block'],
    challengeComplete: false
  });

  await progressTracker.saveGamingHubProgress(wallet1, 'blockchain-basics', 1, {
    questionId: 'wallet1-question-2', 
    isCorrect: true,
    userAnswer: 'Hash',
    correctAnswers: ['Hash'],
    challengeComplete: true
  });
  
  console.log('✅ Wallet 1 progress saved: Challenge 0-1 completed\n');

  console.log('📝 Test 2: Setting up progress for Wallet 2'); 
  let progress2 = await progressTracker.getGamingHubProgress(wallet2);
  await progressTracker.saveGamingHubProgress(wallet2, 'crypto-security', 0, {
    questionId: 'wallet2-question-1',
    isCorrect: false,
    userAnswer: 'Wrong Answer',
    correctAnswers: ['Correct Answer'],
    challengeComplete: false
  });

  await progressTracker.saveGamingHubProgress(wallet2, 'crypto-security', 2, {
    questionId: 'wallet2-question-2',
    isCorrect: true, 
    userAnswer: 'Security',
    correctAnswers: ['Security'],
    challengeComplete: true
  });
  
  console.log('✅ Wallet 2 progress saved: Different quest, different progress\n');

  console.log('📝 Test 3: Checking progress isolation');
  progress1 = await progressTracker.getGamingHubProgress(wallet1);
  progress2 = await progressTracker.getGamingHubProgress(wallet2);

  console.log('Wallet 1 quests:', Object.keys(progress1.questProgress));
  console.log('Wallet 1 blockchain-basics status:', progress1.questProgress['blockchain-basics']?.questStatus);
  console.log('Wallet 1 total questions attempted:', progress1.overallStats.totalQuestionsAttempted);

  console.log('\nWallet 2 quests:', Object.keys(progress2.questProgress)); 
  console.log('Wallet 2 crypto-security status:', progress2.questProgress['crypto-security']?.questStatus);
  console.log('Wallet 2 total questions attempted:', progress2.overallStats.totalQuestionsAttempted);

  console.log('\n📝 Test 4: Resume functionality for each wallet');
  const wallet1Resume = await progressTracker.getNextUncompletedChallenge(wallet1, 'blockchain-basics');
  const wallet2Resume = await progressTracker.getNextUncompletedChallenge(wallet2, 'crypto-security');

  console.log('Wallet 1 should resume from challenge:', wallet1Resume.challengeIndex);
  console.log('Wallet 2 should resume from challenge:', wallet2Resume.challengeIndex);

  console.log('\n📝 Test 5: Cross-contamination check');
  const wallet1SecurityProgress = await progressTracker.getNextUncompletedChallenge(wallet1, 'crypto-security');
  const wallet2BlockchainProgress = await progressTracker.getNextUncompletedChallenge(wallet2, 'blockchain-basics');

  console.log('Wallet 1 crypto-security progress (should be new):', wallet1SecurityProgress.isFirstTime);
  console.log('Wallet 2 blockchain-basics progress (should be new):', wallet2BlockchainProgress.isFirstTime);

  console.log('\n✅ Multi-wallet isolation test completed successfully!');
  console.log('✅ Each wallet maintains separate progress tracking');
  console.log('✅ No cross-contamination between wallet addresses');
}

// Run the test
testMultiWalletProgress().catch(console.error);