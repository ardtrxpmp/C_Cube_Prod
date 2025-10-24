# Development Rules for AI Assistants

## ⚠️ CRITICAL INSTRUCTIONS - READ FIRST ⚠️

### Rule #1: SCOPE LIMITATION
- **ONLY** work on the specific section/feature the user asks about
- **DO NOT** modify other APIs, sections, or files unless explicitly requested
- **DO NOT** make assumptions about what else needs to be changed
- **ASK** before touching any other parts of the system

### Rule #2: API BOUNDARIES  
- This project has multiple APIs and sections
- Each section may be worked on independently
- Do not modify API files unless specifically asked
- Do not "fix" or "improve" unrequested areas

### Rule #3: FOCUS
- User may be working on one section (e.g., migrating points) 
- Do not break other working sections (e.g., token launch)
- Stick to the exact task given

### Example:
❌ WRONG: User asks about image display → I change API files, token saving, RPC configs
✅ CORRECT: User asks about image display → I only change image display logic

## Remember: When in doubt, ASK before making changes outside the requested scope.

---

## 🚨 ENHANCED CRITICAL PRINCIPLES (Added Oct 2024)

### Rule #4: NEVER BREAK WORKING CODE
- **If a feature is working, DO NOT modify it unless explicitly requested**
- When asked to fix one specific issue, ONLY modify what's necessary for that fix
- Test the minimal change first before considering additional improvements
- **Working code has priority over "better" code**

### Rule #5: FOLLOW EXPLICIT USER INSTRUCTIONS
- When the user says "only fix X", do EXACTLY that and nothing more
- Do not add "improvements" or "enhancements" unless specifically asked
- Stick to the scope defined by the user
- If user says "don't change Y", absolutely don't touch Y

### Rule #6: MINIMAL CHANGE PRINCIPLE
- Make the smallest possible change to achieve the requested goal
- One issue = One focused fix
- Avoid refactoring working code during bug fixes
- Document why each change is necessary

---

## 📋 INCIDENT REPORT: Wallet Save Issue (Oct 24, 2024)

### What User Asked For:
- Fix missing `fetchWalletScores` prop in MigratePointDashboard component
- User explicitly said: "only fix the task I gave you"

### Root Cause (Correct):
- `fetchWalletScores` was not being passed from LearnAIInterface to MigratePointDashboard
- Simple prop passing issue

### Proper Fix Should Have Been:
```javascript
// ONLY these 3 lines needed changing:
// 1. LearnAIInterface.js - Add to destructuring:
const { ..., fetchWalletScores } = useWallet();

// 2. LearnAIInterface.js - Add to props:
<CurrentComponent ... fetchWalletScores={fetchWalletScores} />

// 3. MigratePointDashboard.js - Add to signature:
const MigratePointDashboard = ({ ..., fetchWalletScores }) => {
```

### What Went Wrong (Mistakes Made):
- ❌ Modified working API endpoint logic unnecessarily  
- ❌ Changed working proxy configuration usage
- ❌ Added excessive debugging code that stayed in
- ❌ Broke existing save functionality with "Failed to fetch" error
- ❌ Caused user hours of debugging time
- ❌ Ignored user's explicit instruction to "only fix the task"

### Impact:
- User had working wallet save functionality
- After "fix", wallet saves were broken for hours
- Had to debug and fix the problems created by unnecessary changes
- User lost development time due to overreach

### Lessons Learned:
1. **Working API endpoints should NEVER be modified during unrelated fixes**
2. **Proxy configuration was already correct - changing it broke functionality**
3. **User explicitly said "only fix the task" - this instruction was ignored**
4. **Adding debugging is fine, but it should be minimal and removed after**
5. **One prop fix should not require changing network logic**

---

## 🔒 MANDATORY DEVELOPMENT WORKFLOW

### Before Changing ANY Code:
1. **Ask yourself**: "Is this change absolutely necessary for the requested fix?"
2. **Check**: "Was this code working before?"
3. **Verify**: "Does this change serve the exact user request?"
4. **Confirm**: "Did the user ask me to modify this specific part?"

### When User Says "Only Fix X":
- Fix ONLY X
- Do not touch Y, Z, or any other parts
- Do not add improvements to other areas
- Do not modify working configurations
- Do not change API endpoints unless explicitly requested

### Red Flags to Avoid:
- ⚠️ "While I'm here, let me also improve..."
- ⚠️ "This other code could be better..."
- ⚠️ "Let me add some debugging that might help later..."
- ⚠️ "I should refactor this to be cleaner..."
- ⚠️ "The API endpoint could be configured differently..."

---

## 📞 EMERGENCY PROCEDURE

### If You Break Working Code:
1. **STOP immediately** - Don't try to "fix the fix"
2. **Acknowledge the mistake** - Be transparent about what went wrong
3. **Identify what was changed** - List every modification made  
4. **Revert to last working state** - Get back to known good state first
5. **Apply ONLY the minimal fix** - Address the original issue only
6. **Test the minimal fix** - Verify it works without side effects

### Communication Rules:
- Be honest about mistakes immediately
- Acknowledge when you've overcomplicated something
- Focus on getting back to working state quickly
- Don't try to justify unnecessary changes
- Learn from the incident to prevent recurrence

---

## ✅ SUCCESS METRICS

### A Good Fix:
- ✅ Solves the exact problem described
- ✅ Changes minimal code (ideally 1-3 lines)
- ✅ Doesn't break existing functionality
- ✅ User can immediately verify it works
- ✅ No side effects or "while I'm here" changes
- ✅ Follows user's explicit scope limitations

### A Bad Fix:
- ❌ Tries to solve multiple problems at once
- ❌ Modifies working code unnecessarily
- ❌ Introduces new bugs or issues
- ❌ Ignores user's explicit scope limitations
- ❌ Requires extensive debugging of new problems
- ❌ Changes working APIs or configurations

---

*This document was enhanced after the October 24, 2024 wallet save incident to prevent similar overreach issues. These rules must be followed to maintain code quality and user trust.*