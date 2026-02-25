# Database Setup Guide

This guide walks you through setting up the Smart Guide Robot database to be fully functional.

## Architecture

The app uses a **hybrid storage approach**:
- **Default**: AsyncStorage (local device storage) with demo data
- **Optional**: Supabase PostgreSQL (remote database)

The app **always initializes** with demo data, then optionally syncs with Supabase if enabled.

---

## Quick Start (Local Only - No Setup Required)

The app works out-of-the-box with local AsyncStorage. Just run:

```bash
npm install
npm start
```

Demo data (5 IT classrooms, robot state) loads automatically.

---

## Full Setup with Supabase (Remote Database)

### Step 1: Verify Your Supabase Credentials

Edit `.env` and confirm you have valid credentials:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_DB_URL=postgresql://postgres.xxx:password@aws-0-Europe.pooler.supabase.com:6543/postgres
```

Get these from your [Supabase Dashboard](https://app.supabase.com):
- **URL & Anon Key**: Settings → API
- **DB Connection**: Settings → Database → Connection Pooler → Transaction mode

### Step 2: Create Database Schema

**Option A: Supabase SQL Editor (Recommended)**

1. Open your Supabase project → **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of:
   ```
   supabase/migrations/20260222183649_create_smart_robot_schema.sql
   ```
4. Click **Run**
5. Wait for success message

**Option B: Using Node Script (Requires DB Connection)**

```bash
npm run db:migrate supabase/migrations/20260222183649_create_smart_robot_schema.sql
```

Note: Pooler connections on Windows sometimes fail DNS resolution. Use Option A if you encounter network errors.

### Step 3: Verify Tables Were Created

In **Supabase Console** → **Table Editor**, confirm:

- ✅ `faculties` table exists with 2 demo rows:
  - Information Technology (3 floors)
  - Engineering (4 floors)

- ✅ `classrooms` table exists with 5 demo rows:
  - IT-101, IT-102, IT-201, IT-202, IT-301

- ✅ `robot_state` table exists with 1 row:
  - status: 'idle', battery_level: 100, position (0,0)

- ✅ RLS (Row Level Security) is **enabled** on all tables

### Step 4: Test Connection

```bash
npm run db:test
```

Expected output:
```
Supabase connection OK — faculties rows found: 2
```

### Step 5: Enable Remote Database in App (Optional)

To make the app use Supabase instead of local storage, set:

```dotenv
EXPO_PUBLIC_USE_REMOTE_DB=true
```

Then restart the app:

```bash
npm start
```

The app will:
1. Try to fetch data from Supabase
2. Cache locally for offline access
3. Fall back to demo data if Supabase is unavailable

### Step 6: Test the App

- **Manage Tab**: Add a new faculty/classroom → should save to Supabase
- **Map Tab**: View classrooms → should load from Supabase
- **Robot Tab**: Control robot → updates saved to Supabase
- **History Tab**: View past navigation → syncs from Supabase

---

## Features

### 🏠 **Local Storage (Always Available)**
- Fast, no network required
- Works offline
- Data persists between app restarts
- Located in `lib/storage.ts`

### ☁️ **Remote Supabase (When Enabled)**
- All CRUD operations sync with Supabase
- Real-time multi-device updates
- Automatic fallback if Supabase is unavailable
- Toggle with `EXPO_PUBLIC_USE_REMOTE_DB=true`

### 🤖 **Race Condition Protection**
- Concurrent `getRobotState()` calls are safe
- App initializes demo data on startup (prevents duplicate inserts)
- Idempotent operations (safe to retry)

---

## Files Modified

- **`lib/storage.ts`** — Hybrid storage with Supabase fallback
- **`lib/supabase.ts`** — Supabase client initialization + connection test
- **`contexts/AuthContext.tsx`** — Initializes storage on app load
- **`.env.example`** — Environment variables template
- **`scripts/test-supabase.js`** — Connection test script
- **`scripts/run-migration.js`** — Migration runner

---

## Troubleshooting

### Error: "Missing SUPABASE_DB_URL"
- Edit `.env` and add the full Postgres connection string
- Restart the app

### Error: "Connection refused" or "ENOTFOUND"
- Pooler URL not accessible from your network
- Use **Option A** (SQL Editor) instead to apply migrations
- Contact your Supabase support if persistent

### Error: "Uncaught Error...UNIQUE constraint failed: robot_state.id"
- This is fixed in the latest code
- Run `npm install` again
- Clear app cache: `npm start -- --clear`

### App crashes on startup with red error screen
- Check `.env` credentials are correct
- Ensure `EXPO_PUBLIC_USE_REMOTE_DB=false` (default)
- Restart: `npm start -- --clear`

### Data not syncing to Supabase
- Verify `EXPO_PUBLIC_USE_REMOTE_DB=true` is set
- Check Supabase **RLS policies** allow public access (they should)
- Run `npm run db:test` to confirm connectivity
- Check browser DevTools console for errors

---

## NPM Scripts

```bash
npm start              # Start Expo dev server
npm run db:test        # Test Supabase connection
npm run db:migrate     # Run database migration
npm run lint           # Lint code
npm run typecheck      # Check TypeScript
```

---

## Database Functions

All functions in `lib/storage.ts`:

### Faculties
- `getFaculties()` — Fetch all faculties
- `addFaculty(data)` — Add a new faculty

### Classrooms
- `getClassrooms()` — Fetch all classrooms
- `addClassroom(data)` — Add a new classroom

### Robot State
- `getRobotState()` — Get current robot position/status
- `updateRobotState(updates)` — Update robot position/status

### Utilities
- `clearAllData()` — Delete all local data
- `resetToDemoData()` — Restore demo data
- `initializeStorage()` — Initialize storage (auto-called on app load)

---

## Questions?

- **Supabase docs**: https://supabase.com/docs
- **Project issues**: Check GitHub issues
- **Environment setup**: See `.env.example`

