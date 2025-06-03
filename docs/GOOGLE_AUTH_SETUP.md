# Google Authentication Setup Guide

## Overview

This guide walks you through setting up Google OAuth authentication for TrustPlay using Supabase Auth.

## Prerequisites

✅ **Already Complete:**
- Supabase project created
- Environment variables configured (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Auth infrastructure implemented (login/dashboard/onboarding pages)
- Database schema applied with user tables

## Step 1: Create Google OAuth Credentials

### 1.1 Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### 1.2 Enable Google+ API
1. Navigate to **APIs & Services** → **Library**
2. Search for "Google+ API" 
3. Click on it and press **Enable**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in required app information:
     - App name: "TrustPlay"
     - User support email: your email
     - Developer contact information: your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed

### 1.4 Configure OAuth Client
1. Application type: **Web application**
2. Name: "TrustPlay Web Client"
3. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
4. **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```
5. Click **Create**
6. **Save the Client ID and Client Secret** - you'll need these next

## Step 2: Configure Supabase Authentication

### 2.1 Enable Google Provider
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your TrustPlay project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click to configure

### 2.2 Add Google Credentials
1. **Enable** the Google provider
2. Enter your **Client ID** from Google Cloud Console
3. Enter your **Client Secret** from Google Cloud Console
4. **Redirect URL** should already be filled in as:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
5. Click **Save**

### 2.3 Update Google OAuth Redirect URIs
1. Go back to Google Cloud Console → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add the Supabase redirect URI to **Authorized redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
4. Save the changes

## Step 3: Apply Database Migration

Run your database migration to create the required tables:

```bash
# Apply the migration in Supabase Dashboard
# Go to: Database → SQL Editor
# Copy and paste the contents of: supabase/migrations/001_initial_schema.sql
# Click "Run"
```

Or if using Supabase CLI:
```bash
npx supabase db push
```

## Step 4: Test the Authentication Flow

### 4.1 Start Development Server
```bash
npm run dev
```

### 4.2 Test Complete Flow
1. **Visit** `http://localhost:3000`
2. **Should redirect** to `/login`
3. **Click** "Continue with Google"
4. **Sign in** with your Google account
5. **Should redirect** to `/onboarding` (for new users)
6. **Complete** your profile
7. **Should redirect** to `/dashboard`
8. **Test sign out** - should return to login

### 4.3 Test Returning User
1. **Sign out** and sign in again
2. **Should skip** onboarding and go directly to dashboard

## Step 5: Verification Checklist

✅ **Google OAuth Setup:**
- [ ] Google Cloud project created
- [ ] OAuth credentials configured
- [ ] Redirect URIs properly set

✅ **Supabase Configuration:**
- [ ] Google provider enabled
- [ ] Client ID and Secret added
- [ ] Redirect URL configured

✅ **Database:**
- [ ] Migration applied successfully
- [ ] Tables created (users, sessions, ratings, etc.)
- [ ] RLS policies enabled

✅ **Application Flow:**
- [ ] Login redirects to Google
- [ ] Google auth completes successfully
- [ ] New users go to onboarding
- [ ] Onboarding creates user profile
- [ ] Dashboard loads with user data
- [ ] Sign out works correctly
- [ ] Returning users skip onboarding

## Troubleshooting

### Common Issues

**"redirect_uri_mismatch" Error:**
- Check that redirect URIs in Google Console match exactly
- Ensure both localhost and Supabase URLs are added
- Check for trailing slashes or typos

**"OAuth Error" in Supabase:**
- Verify Client ID and Secret are correct
- Ensure Google+ API is enabled
- Check OAuth consent screen is configured

**Database Errors:**
- Verify migration was applied successfully
- Check RLS policies are not blocking inserts
- Ensure user has proper permissions

**User Not Created:**
- Check browser console for errors
- Verify database utility functions work
- Ensure required fields are provided

### Debug Commands

Check current user:
```javascript
// In browser console
const { data: { user } } = await window.supabase.auth.getUser()
console.log(user)
```

Check database connection:
```sql
-- In Supabase SQL Editor
SELECT * FROM users LIMIT 5;
```

## Production Deployment

When deploying to production:

1. **Update redirect URIs** in Google Console with production URLs
2. **Add production domain** to Supabase site URL settings
3. **Update CORS settings** if needed
4. **Test the complete flow** on production

## Security Notes

- Never expose Client Secret in frontend code
- Client Secret is only used in Supabase backend
- Environment variables are properly prefixed (`NEXT_PUBLIC_*` for frontend)
- RLS policies protect user data access
- OAuth scopes are minimal (`email`, `profile`, `openid`)

---

**Status:** ✅ Implementation Complete  
**Next:** Test authentication flow and proceed to User Profile Management (Task 3) 