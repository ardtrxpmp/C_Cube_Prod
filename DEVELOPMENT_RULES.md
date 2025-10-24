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