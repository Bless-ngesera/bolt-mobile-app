# ✅ Database Setup - Complete Analysis & Fixes 

## Problem Identified
Your app was crashing on startup with: `SQLITE_CONSTRAINT_UNIQUE error on robot_state.id`

**Root Cause**: Multiple screens (`robot.tsx`, `map.tsx`) were calling `getRobotState()` simultaneously (every 2-3 seconds), and when remote storage wasn't initialized, they would all try to INSERT a new robot_state record at the same time, causing a UNIQUE constraint violation.

---

## Solutions Applied

### 1. **Fixed Race Condition in `getRobotState()`**
- Added a singleton guard (`robotStateInitPromise`) that ensures only ONE initialization attempt happens at a time
- If multiple concurrent calls occur, all other calls wait for the first to complete
- If a UNIQUE constraint is detected, the function retries by fetching the existing record

**File**: `lib/storage.ts` (lines 218-288)

### 2. **Added Storage Initialization on App Startup**
- New function: `initializeStorage()` ensures demo data is cached in AsyncStorage on first app load
- This ensures robot_state, faculties, and classrooms are pre-populated BEFORE any component tries to access them
- Prevents the INSERT race condition entirely

**File**: `lib/storage.ts` (lines 106-138)  
**Called from**: `contexts/AuthContext.tsx` - runs before UI renders

### 3. **Enabled Hybrid Storage Mode**
- App now works in LOCAL mode by default (AsyncStorage + demo data)
- Can be switched to REMOTE mode when Supabase is properly set up
- Includes automatic fallback: if Supabase fails, app uses local AsyncStorage

**File**: `lib/storage.ts` (constants at lines 32-140)

### 4. **Added Comprehensive Documentation**
- New file: `DATABASE_SETUP.md` with complete setup instructions
- Includes troubleshooting for the UNIQUE constraint error
- Explains local vs. remote database switching

**File**: `DATABASE_SETUP.md`

---

## What's Changed vs. Before

| Aspect | Before | Now |
|--------|--------|-----|
| App startup | ❌ Crashes with UNIQUE constraint | ✅ Initializes demo data safely |
| Storage model | Apps uses Supabase immediately | ✅ Works offline first (AsyncStorage) |
| Race conditions | ❌ No guard, concurrent calls crash | ✅ Singleton guard prevents duplicate inserts |
| Remote DB toggle | ❌ Not available | ✅ Set `EXPO_PUBLIC_USE_REMOTE_DB=true` to enable |
| Fallback behavior | ❌ Crashes if Supabase unavailable | ✅ Auto-fallback to local AsyncStorage |

---

## Files Modified

```
lib/storage.ts                 — Added initializeStorage(), race condition guard
lib/supabase.ts               — Supabase client (already working)
contexts/AuthContext.tsx      — Calls initializeStorage() on app load
.env.example                  — Added EXPO_PUBLIC_USE_REMOTE_DB flag
scripts/test-supabase.js      — Connection test (already working)
scripts/run-migration.js      — Migration runner (already working)
DATABASE_SETUP.md             — Complete setup & troubleshooting guide (NEW)
```

---

## How to Test

### ✅ Option 1: Run Locally (No Supabase Setup Needed)

```bash
cd C:\Apps\bolt-mobile-app
npm install
npm start
```

The app should now:
- Load without errors
- Show demo data (2 faculties, 5 classrooms)
- Allow adding/managing data locally
- Robot control works with position tracking

### ✅ Option 2: Full Setup with Supabase

Follow the step-by-step guide in [DATABASE_SETUP.md](DATABASE_SETUP.md):

1. Edit `.env` - set `SUPABASE_DB_URL`
2. Create schema in Supabase SQL editor
3. Run `npm run db:test` to confirm connection
4. Set `EXPO_PUBLIC_USE_REMOTE_DB=true` in `.env`
5. Restart app - now uses Supabase

---

## Next Steps for You

### Immediate (Get app running)
```bash
cd C:\Apps\bolt-mobile-app
npm install
npm start
```

### Optional (Enable Supabase)
Follow the **Full Setup with Supabase** section in [DATABASE_SETUP.md](DATABASE_SETUP.md):

1. Get your `SUPABASE_DB_URL` from Supabase Console → Settings → Database → Connection Pooler
2. Paste SQL migration in Supabase SQL Editor
3. Set `EXPO_PUBLIC_USE_REMOTE_DB=true` in `.env`
4. Restart app

---

## Key Improvements

✅ **No more UNIQUE constraint crashes**  
✅ **App works offline with local data**  
✅ **Optional Supabase integration**  
✅ **Automatic fallback if remote fails**  
✅ **Race condition protection for concurrent requests**  
✅ **Demo data auto-initialized on startup**  

---

## Verification Checklist

After following the quick start above, verify:

- [ ] App starts without red error screen
- [ ] Home screen loads with demo data
- [ ] Manage tab: Can add a faculty (even if it's local)
- [ ] Map tab: Shows IT classrooms
- [ ] Robot tab: Shows robot status as "idle", battery 100%
- [ ] History tab: Loads without errors

All of these should pass with just `npm start` (local mode).

---

## Still Have Issues?

1. **App crashes on startup**: Run `npm start -- --clear` to reset cache
2. **"Cannot find module" errors**: Run `npm install` again
3. **See UNIQUE constraint error**: Update to the latest code and clear app data
4. **Remote DB not working**: See "Troubleshooting" in DATABASE_SETUP.md

---

## Architecture Summary

```
┌─────────────────────────────────────────┐
│         React Native App (Expo)         │
│  Storage Layer (lib/storage.ts)         │
└────────┬──────────────────────┬─────────┘
         │                      │
    ✓ USE_REMOTE=false      ✓ USE_REMOTE=true
         │                      │
         ▼                      ▼
    AsyncStorage           Supabase (Remote)
    (Device Storage)       PostgreSQL
    └─ Demo Data           └─ Live Data
    └─ Offline-first       └─ Multi-user
```

---

**Database is now fully functional!** 🎉

