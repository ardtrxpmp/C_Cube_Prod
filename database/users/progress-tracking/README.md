# Progress Tracking Database

This directory contains wallet-based progress tracking data for the C³ Cube learning platform.

## Directory Structure

```
users/progress-tracking/
├── README.md                           # This documentation
├── gaming-hub/                         # Gaming Hub progress by wallet
│   ├── 0x1234567890abcdef123456.json   # User gaming progress
│   ├── 0x7890abcdef1234567890ab.json   # Another user's progress
│   └── ...                             # Additional user progress files
├── story-mode/                         # Story Mode progress by wallet  
│   ├── 0x1234567890abcdef123456.json   # User story progress
│   ├── 0x7890abcdef1234567890ab.json   # Another user's progress
│   └── ...                             # Additional user progress files
└── schema/
    ├── gaming-hub-schema.json          # Gaming Hub data schema
    └── story-mode-schema.json          # Story Mode data schema
```

## Gaming Hub Progress Schema

Each gaming hub progress file (`gaming-hub/{wallet-address}.json`) contains:

```json
{
  "walletAddress": "0x1234567890abcdef123456789012345678901234",
  "lastUpdated": "2025-10-20T12:00:00.000Z",
  "questProgress": {
    "blockchain-basics": {
      "questStatus": "in-progress",
      "currentChallengeIndex": 2,
      "totalChallenges": 10,
      "completedChallenges": [0, 1],
      "attemptedQuestions": [
        {
          "challengeIndex": 0,
          "questionId": "blockchain-basics-challenge-0-question-core",
          "attempts": 1,
          "lastAttempt": "2025-10-20T11:45:00.000Z",
          "isCorrect": true,
          "userAnswers": ["Block"],
          "correctAnswers": ["Block", "Transaction"]
        }
      ]
    },
    "crypto-security": {
      "questStatus": "not-started",
      "currentChallengeIndex": 0,
      "totalChallenges": 50,
      "completedChallenges": [],
      "attemptedQuestions": []
    }
  },
  "overallStats": {
    "totalQuestionsAttempted": 15,
    "totalQuestionsCorrect": 12,
    "accuracyRate": 80.0,
    "totalPlayTime": 1200,
    "lastPlaySession": "2025-10-20T12:00:00.000Z"
  }
}
```

## Story Mode Progress Schema

Each story mode progress file (`story-mode/{wallet-address}.json`) contains:

```json
{
  "walletAddress": "0x1234567890abcdef123456789012345678901234",
  "lastUpdated": "2025-10-20T12:00:00.000Z",
  "chapterProgress": {
    "chapter-01": {
      "chapterStatus": "completed",
      "currentQuestionIndex": 10,
      "totalQuestions": 10,
      "completedQuestions": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      "attemptedQuestions": [
        {
          "questionIndex": 0,
          "questionId": "ch01-q001",
          "attempts": 2,
          "lastAttempt": "2025-10-20T11:30:00.000Z",
          "isCorrect": true,
          "selectedChoice": 1,
          "correctChoice": 1
        }
      ],
      "score": 85,
      "timeSpent": 450
    }
  },
  "overallStats": {
    "totalChaptersStarted": 3,
    "totalChaptersCompleted": 1,
    "totalQuestionsAttempted": 25,
    "totalQuestionsCorrect": 22,
    "accuracyRate": 88.0,
    "totalScore": 245,
    "totalTimeSpent": 1800,
    "lastPlaySession": "2025-10-20T12:00:00.000Z"
  }
}
```

## Integration Features

- **Cross-Session Persistence**: Progress automatically saves and resumes across wallet connections
- **Real-Time Sync**: Progress updates immediately on question attempts
- **Auto-Resume**: Users automatically continue from their last attempted challenge/question
- **Wallet Isolation**: Each wallet address maintains completely separate progress
- **GitHub Sync**: Progress stored in GitHub for permanent persistence

## Usage

This progress tracking system is automatically integrated with:

- **GamifiedLearningHub**: Gaming challenges with drag-and-drop mechanics
- **StoryModeLearning**: Interactive story-based learning chapters  
- **ProgressTracker Service**: Core service managing all progress operations
- **WalletContext**: Automatic progress loading on wallet connection

## API Operations

### Gaming Hub
- `getGamingHubProgress(walletAddress)` - Load user's gaming progress
- `saveGamingHubProgress(walletAddress, questId, challengeIndex, questionData)` - Save progress
- `getNextUncompletedChallenge(walletAddress, questId)` - Get resume point

### Story Mode  
- `getStoryModeProgress(walletAddress)` - Load user's story progress
- `saveStoryModeProgress(walletAddress, chapterId, questionIndex, questionData)` - Save progress
- `getNextUncompletedQuestion(walletAddress, chapterId)` - Get resume point

## Security Features

- Wallet addresses used as unique identifiers
- Progress validation and sanitization
- Automatic backup with Git history
- No cross-wallet data contamination
- Secure GitHub API integration

## File Naming Convention

All progress files use lowercase wallet addresses:
- Gaming Hub: `gaming-hub/{wallet-address-lowercase}.json`
- Story Mode: `story-mode/{wallet-address-lowercase}.json`

## Auto-Creation

Progress files are automatically created when:
1. User connects wallet for first time
2. User starts their first quest/chapter
3. User attempts their first question

The system handles all file creation and updates automatically.