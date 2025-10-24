# GitHub Database Integration

## Overview

The "Save Points to Database" button now saves wallet data directly to the external GitHub repository:

**Repository:** https://github.com/cyfocube/C_DataBase.git  
**Path:** `users/Users_Scores/[wallet_address].json`

## Features

✅ **Multi-Wallet Support** - Works with C-Cube wallet, MetaMask, and other Web3 wallets  
✅ **GitHub Integration** - Automatically saves to external C_DataBase repository  
✅ **Smart Merging** - Keeps highest points when updating existing wallet files  
✅ **Fallback System** - Local save if GitHub is unavailable  
✅ **Manual Upload** - Download file for manual GitHub upload if needed  

## Setup

### 1. Configure GitHub Token

Run the setup script:
```bash
node setup-github-database.js
```

Or manually create a `.env` file:
```env
GITHUB_TOKEN=your_github_personal_access_token_here
```

### 2. Create GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select permissions: `repo` (Full control of private repositories)
4. Copy the token and use in setup

### 3. Test Integration

Run the test script:
```bash
node test-github-database-integration.js
```

## How It Works

### Button Flow

1. **Detect Wallet** - Checks for connected C-Cube or external wallet
2. **Gather Points** - Collects points from browser session storage
3. **Create User Data** - Formats data according to Users_Scores schema
4. **Save to GitHub** - Uses GitHub API to save/update wallet file
5. **Fallback Options** - Local save or manual download if GitHub fails

### Wallet Detection Priority

1. **C-Cube Wallet** (`cCubeWalletData.address`)
2. **External Wallet** (`externalWalletData.address`) - MetaMask, etc.
3. **Legacy Wallet** (`walletData.address`) - Older format support

### Data Schema

```json
{
  "walletAddress": "0x...",
  "createdAt": "2025-10-23T...",
  "lastActive": "2025-10-23T...",
  "points": {
    "gamingHub": {
      "blockchainBasics": 5.0,
      "smartContracts": 2.0,
      "defiProtocols": 1.0,
      "nftsWeb3": 0
    },
    "storyMode": {
      "chaptersCompleted": 2,
      "totalScore": 25
    },
    "achievements": {
      "firstQuest": true,
      "cryptoNovice": true,
      "blockchainExplorer": false,
      "defiMaster": false,
      "speedLearner": false,
      "perfectionist": false
    },
    "total": 33
  },
  "progress": {
    "completedNodes": ["node1", "node2"],
    "currentQuest": "defi-basics",
    "level": 3,
    "xp": 330
  },
  "settings": {
    "autoSync": true,
    "notifications": true
  }
}
```

## API Endpoints

### POST `/api/save-user-scores`

Save wallet data to GitHub database.

**Request:**
```json
{
  "walletAddress": "0x1234...",
  "userData": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User scores saved to GitHub database successfully!",
  "data": {
    "walletAddress": "0x1234...",
    "fileName": "0x1234....json",
    "totalPoints": 150,
    "saveMethod": "github",
    "repository": "cyfocube/C_DataBase",
    "githubUrl": "https://github.com/cyfocube/C_DataBase/blob/main/users/Users_Scores/0x1234....json"
  }
}
```

## Success Messages

### GitHub Save Success
```
🎉 SUCCESS! Points saved to GitHub database!

📊 Total Points: 150
🏛️ Repository: cyfocube/C_DataBase
📁 Path: users/Users_Scores/0x1234....json

🔗 Your wallet data is now permanently stored in the C_DataBase repository!
✨ Future points will automatically sync to GitHub.
```

### Local Fallback
```
✅ Points saved locally!

📊 Total Points: 150
📁 Local file created

⚠️ Note: GitHub token not configured, data saved locally.
Contact admin to enable GitHub database integration.
```

### Manual Upload Required
```
💾 Manual GitHub Upload Required!

📊 Total Points: 150
🎮 Gaming Hub: 85
📚 Story Mode: 65

📋 Manual Steps:
1. File "0x1234....json" was downloaded
2. Go to: https://github.com/cyfocube/C_DataBase
3. Navigate to: users/Users_Scores/
4. Upload the file there
5. Your wallet will be in the database!

🔍 Data is also logged in browser console for copy/paste.
```

## Troubleshooting

### Button Shows "No Wallet Connected"

1. Check that wallet is actually connected in the app
2. Verify wallet props are passed correctly to component
3. Check browser console for wallet detection logs
4. Try disconnecting and reconnecting wallet

### GitHub Save Fails

1. Check that `GITHUB_TOKEN` environment variable is set
2. Verify token has `repo` permissions
3. Test token with: `node test-github-database-integration.js`
4. Check server logs for detailed error messages

### Points Not Saving

1. Verify you have accumulated points in session storage
2. Check that points data is not empty/zero
3. Look for JavaScript errors in browser console
4. Ensure API endpoint is accessible

## File Locations

- **API Handler:** `api/save-user-scores.js`
- **Component:** `src/components/LearnAI/MigratePointDashboard.js`
- **Service:** `src/services/GitHubDatabaseService.js`
- **Tests:** `test-github-database-integration.js`
- **Setup:** `setup-github-database.js`

## Environment Variables

```env
# Required for GitHub integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Alternative name (also supported)
GITHUB_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

## Next Steps

1. ✅ Configure GitHub token using setup script
2. ✅ Test integration with test script
3. ✅ Connect wallet in React app
4. ✅ Accumulate some points by completing activities  
5. ✅ Click "Save Points to Database" button
6. ✅ Verify wallet file appears in GitHub repository
7. ✅ Test that subsequent saves merge points correctly

The integration is now complete and ready for use! 🚀