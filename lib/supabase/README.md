# Supabase Setup Instructions

## Current Status
✅ **Code Setup Complete** - All necessary Supabase client files have been created
❌ **Project Configuration Needed** - Manual steps required below

## What's Already Done
- ✅ Supabase packages installed (`@supabase/supabase-js`, `@supabase/ssr`)
- ✅ Browser client utility created (`lib/supabase/client.ts`)
- ✅ Server client utility created (`lib/supabase/server.ts`)
- ✅ Middleware configured for auth handling (`middleware.ts`)
- ✅ Auth callback route created (`app/auth/callback/route.ts`)

## Manual Setup Required

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/sign in
3. Click "New Project"
4. Choose your organization
5. Enter project name: "trust-play" (or similar)
6. Choose a database password
7. Select region closest to your users
8. Click "Create new project"

### 2. Get Project Credentials
1. In your Supabase dashboard, go to **Settings → API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon/Public key** (starts with `eyJ`)

### 3. Set Environment Variables
Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Configure Google OAuth (for later)
1. In Supabase Dashboard → **Authentication → Providers**
2. Enable "Google" provider
3. Add Google OAuth credentials when ready

## Testing the Setup
Once environment variables are set, the app should be able to connect to Supabase.

## Next Steps
After completing the manual setup:
- ✅ Mark subtask 2.1 as complete
- 🚀 Move to subtask 2.2 (Implement Google Authentication)
- 🚀 Move to subtask 2.3 (Create database tables) 