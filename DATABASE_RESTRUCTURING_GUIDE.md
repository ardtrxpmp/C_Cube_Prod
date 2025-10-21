# Database Restructuring Guide

## Objective
Move the `story-mode` folder from `questions/story-mode/` to root level `story-mode/` in the cyfocube/C_DataBase repository.

## Current Structure
```
C_DataBase/
├── questions/
│   ├── story-mode/         <- Need to move this
│   ├── quick-actions/
│   └── gamified-learning/
├── gaming-hub/
└── other folders...
```

## Target Structure
```
C_DataBase/
├── story-mode/             <- Moved here
├── gaming-hub/
└── questions/
    ├── quick-actions/
    └── gamified-learning/
```

## Steps to Execute

### Method 1: Using the Provided Script (Recommended)

1. **Clone the database repository**:
   ```bash
   cd /Users/oladimejishodipe/Desktop/Cold_Wallet_Git_Version/
   git clone https://github.com/cyfocube/C_DataBase.git
   ```

2. **Run the restructuring script**:
   ```bash
   cd C_Cube_Prod
   chmod +x restructure-database.sh
   ./restructure-database.sh
   ```

### Method 2: Manual Git Commands

1. **Clone and navigate**:
   ```bash
   cd /Users/oladimejishodipe/Desktop/Cold_Wallet_Git_Version/
   git clone https://github.com/cyfocube/C_DataBase.git
   cd C_DataBase
   ```

2. **Move the folder**:
   ```bash
   mv questions/story-mode ./story-mode
   ```

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Restructure: Move story-mode folder to root level"
   git push origin main
   ```

### Method 3: GitHub Web Interface

1. Go to https://github.com/cyfocube/C_DataBase
2. Navigate to `questions/story-mode/`
3. Download all files
4. Create new folder `story-mode` at root level
5. Upload files to new location
6. Delete old `questions/story-mode/` folder

## Expected Result

After restructuring, Story Mode will be accessible at:
```
https://raw.githubusercontent.com/cyfocube/C_DataBase/main/story-mode/questions.json
```

This matches the pattern used by Gaming Hub:
```
https://raw.githubusercontent.com/cyfocube/C_DataBase/main/gaming-hub/questions.json
```

## Verification

Test the new path:
```bash
curl -I "https://raw.githubusercontent.com/cyfocube/C_DataBase/main/story-mode/questions.json"
```

Should return `200 OK` instead of `404 Not Found`.

## Note

Your StoryModeLearning component is already configured for this path structure, so no code changes are needed in your app once the database is restructured.