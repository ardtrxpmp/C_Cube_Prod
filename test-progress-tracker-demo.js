#!/usr/bin/env node

/**
 * Progress Tracker Demo & Test
 * This script demonstrates the progress tracking functionality
 * and creates sample progress files for testing
 */

const fs = require('fs');
const path = require('path');

// Sample wallet addresses for testing
const sampleWallets = [
  '0x1234567890abcdef1234567890abcdef12345678',
  '0x7890abcdef1234567890abcdef1234567890abcd',
  '0xabcdef1234567890abcdef1234567890abcdef12'
];

// Sample gaming hub progress structure
function createSampleGamingHubProgress(walletAddress, questionsAttempted = 5, accuracy = 85) {
  const currentTime = new Date().toISOString();
  
  return {
    walletAddress: walletAddress,
    lastUpdated: currentTime,
    createdAt: currentTime,
    overallStats: {
      totalQuestionsAttempted: questionsAttempted,
      totalCorrectAnswers: Math.floor(questionsAttempted * (accuracy / 100)),
      accuracyRate: accuracy,
      totalTimeSpent: Math.floor(Math.random() * 3600) + 600, // 10-70 minutes
      averageTimePerQuestion: Math.floor(Math.random() * 30) + 15, // 15-45 seconds
      currentStreak: Math.floor(Math.random() * 10),
      longestStreak: Math.floor(Math.random() * 15) + 5
    },
    questProgress: {
      'blockchain-basics': {
        questId: 'blockchain-basics',
        questStatus: questionsAttempted >= 3 ? 'completed' : 'in-progress',
        currentChallenge: questionsAttempted >= 3 ? 10 : Math.min(questionsAttempted + 1, 10),
        completedChallenges: Math.min(questionsAttempted, 10),
        totalChallenges: 10,
        questAccuracy: accuracy,
        startTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        lastActivity: currentTime,
        attemptedQuestions: generateAttemptedQuestions('blockchain-basics', Math.min(questionsAttempted, 10))
      }
    }
  };
}

// Generate sample attempted questions
function generateAttemptedQuestions(questId, count) {
  const questions = [];
  const topics = {
    'blockchain-basics': [
      { question: 'What is a blockchain?', correct: ['Block', 'Chain'], user: ['Block', 'Hash'] },
      { question: 'Core concepts', correct: ['Node', 'Network'], user: ['Node', 'Network'] },
      { question: 'Key features', correct: ['Decentralized', 'Distributed'], user: ['Decentralized', 'Trust'] }
    ]
  };

  for (let i = 0; i < count; i++) {
    const topic = topics[questId] || topics['blockchain-basics'];
    const randomTopic = topic[i % topic.length];
    const isCorrect = Math.random() > 0.15; // 85% accuracy

    questions.push({
      questionId: `${questId}-challenge-${i}-question-${Math.floor(i/2)}`,
      challengeIndex: i,
      isCorrect: isCorrect,
      userAnswer: randomTopic.user[0],
      correctAnswers: randomTopic.correct,
      timeSpent: Math.floor(Math.random() * 30) + 10, // 10-40 seconds
      attempts: 1,
      lastAttempt: new Date(Date.now() - Math.random() * 3600000).toISOString() // Within last hour
    });
  }

  return questions;
}

// Create sample progress files
async function createSampleProgressFiles() {
  console.log('🎮 Creating sample progress tracker demo files...\n');

  // Ensure directories exist
  const gamingHubDir = path.join(__dirname, 'database', 'users', 'progress-tracking', 'gaming-hub');
  const storyModeDir = path.join(__dirname, 'database', 'users', 'progress-tracking', 'story-mode');

  if (!fs.existsSync(gamingHubDir)) {
    fs.mkdirSync(gamingHubDir, { recursive: true });
  }
  if (!fs.existsSync(storyModeDir)) {
    fs.mkdirSync(storyModeDir, { recursive: true });
  }

  // Create sample gaming hub progress for each wallet
  for (let i = 0; i < sampleWallets.length; i++) {
    const wallet = sampleWallets[i];
    const questionsAttempted = (i + 1) * 5; // 5, 10, 15 questions
    const accuracy = [92, 78, 88][i]; // Different accuracy rates

    const progressData = createSampleGamingHubProgress(wallet, questionsAttempted, accuracy);
    const filePath = path.join(gamingHubDir, `${wallet}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(progressData, null, 2));
    
    console.log(`✅ Created progress for wallet: ${wallet.substring(0, 8)}...${wallet.substring(-6)}`);
    console.log(`   📊 Questions attempted: ${questionsAttempted}`);
    console.log(`   🎯 Accuracy: ${accuracy}%`);
    console.log(`   📁 File: ${filePath}\n`);
  }

  // Create a summary file showing all progress
  const summaryPath = path.join(gamingHubDir, '_summary.json');
  const summary = {
    totalUsers: sampleWallets.length,
    lastUpdated: new Date().toISOString(),
    userSummaries: sampleWallets.map(wallet => ({
      walletAddress: wallet,
      totalQuestions: Math.floor(Math.random() * 20) + 5,
      accuracy: Math.floor(Math.random() * 30) + 70,
      status: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)]
    }))
  };
  
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📋 Created progress summary: ${summaryPath}\n`);

  console.log('🎉 Sample progress tracker files created successfully!');
  console.log('\n📁 Check the database/users/progress-tracking/gaming-hub/ folder to see:');
  console.log('   • Individual wallet progress files (*.json)');
  console.log('   • Progress summary (_summary.json)');
  console.log('\n🔍 These files demonstrate how wallet-based progress tracking works:');
  console.log('   • Each wallet gets its own progress file');
  console.log('   • Progress includes question attempts, accuracy, timing');
  console.log('   • Supports cross-session resume functionality');
  console.log('   • Ready for GitHub database sync\n');
}

// Run the demo
if (require.main === module) {
  createSampleProgressFiles().catch(console.error);
}

module.exports = { createSampleGamingHubProgress, generateAttemptedQuestions };