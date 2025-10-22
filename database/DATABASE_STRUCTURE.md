# C³ Cube Database Structure

This document outlines the complete database organization for the C³ Cube learning platform.

## Overview

The database is organized into distinct sections for different types of data:

```
database/
├── gaming-hub-questions.json          # Gaming Hub challenge data
├── users/                             # User-specific data
│   └── progress-tracking/             # Progress tracking system
│       ├── README.md                  # Progress tracking documentation
│       ├── gaming-hub/               # Gaming Hub user progress
│       │   ├── {wallet-address}.json # Individual user progress files
│       │   ├── _summary.json         # Overall progress summary
│       │   └── example-progress.json # Example progress structure
│       ├── story-mode/              # Story Mode user progress
│       │   ├── {wallet-address}.json # Individual user progress files
│       │   └── example-progress.json # Example progress structure
│       └── schema/                   # Data validation schemas
│           ├── gaming-hub-schema.json # Gaming Hub progress schema
│           └── story-mode-schema.json # Story Mode progress schema
└── other-content/                    # Future: Additional content types
```

## Key Features

### 📁 **Organized Structure**
- **Gaming Hub Content**: Challenge questions and answers
- **User Progress**: Wallet-based individual progress tracking
- **Schema Validation**: JSON schemas for data integrity

### 🎯 **Wallet-Based Tracking**
- Each wallet address gets its own progress file
- Cross-session persistence automatically maintained
- Progress includes accuracy, timing, and resume points

### 🔄 **GitHub Sync Ready**
- Structure matches GitHub database repository
- URLs configured for `users/progress-tracking/` path
- Auto-sync capabilities for cross-device access

### 🛡️ **Data Security**
- Progress files isolated by wallet address
- Schema validation ensures data integrity
- No personal information stored, only progress metrics

## Progress Tracking Details

### Gaming Hub Progress Structure
Each `{wallet-address}.json` file contains:
- **Overall Statistics**: Total questions, accuracy rates, time spent
- **Quest Progress**: Individual quest status and completion
- **Detailed Questions**: Every question attempt with timestamps
- **Resume Capability**: Exact challenge and progress tracking

### File Naming Convention
- Progress files: `0x{wallet-address}.json`
- Summary files: `_summary.json` 
- Schema files: `{type}-schema.json`
- Example files: `example-progress.json`

## Integration Points

### ProgressTracker Service
- **Base URL**: `users/progress-tracking/`
- **GitHub API**: Configured for this path structure
- **Local Fallback**: Works offline with local database

### Gaming Hub Component
- Automatically loads wallet progress on connection
- Saves progress in real-time during gameplay
- Resumes from exact challenge when returning

### Future Extensions
- Story Mode progress tracking (same structure)
- Achievement system integration
- Analytics and reporting capabilities

## Migration Notes

✅ **Completed**: Moved progress-tracking into users/ folder
✅ **Updated**: ProgressTracker service URLs
✅ **Verified**: File structure and demo functionality
✅ **Documented**: New organization and paths

This structure provides a scalable foundation for user data management while maintaining clear separation between content and user progress.