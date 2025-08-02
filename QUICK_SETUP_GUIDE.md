# Quick Setup Guide - Fix Blank Dashboard Issue

## The Problem
Your dashboard shows "Memuat Data Keuangan..." for about 1 second and then goes blank because the application is missing proper Supabase configuration.

## Quick Fix Steps

### 1. Set Up Supabase (Required)
1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Settings → API
3. Copy your Project URL and anon/public key
4. Update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 2. Set Up Database Tables
After updating the .env file with real Supabase credentials:

```bash
npm run setup-db
```

### 3. Restart the Development Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 4. Test the Application
1. Open http://localhost:5173 in your browser
2. Sign up/login with your email
3. Go to Settings (click your profile picture)
4. Configure your Google Sheet ID and Backend API URL

## Alternative: Use Demo Mode

If you don't want to set up Supabase right now, you can modify the app to show a demo mode. However, this requires code changes and won't persist data.

## Common Issues

### "Database table not found"
- Run `npm run setup-db` after setting up Supabase credentials

### "Configuration error"
- Make sure your Supabase URL and anon key are correct
- Check that your Supabase project is active

### "Backend API connection failed"
- Set up your backend API server
- Or configure the backend URL in user settings

## Need Help?

1. Check the browser console (F12) for specific error messages
2. Review the detailed guides:
   - `SUPABASE_SETUP.md`
   - `BLANK_DASHBOARD_FIX.md`
   - `TROUBLESHOOTING.md`

## Success Indicators

When everything is working:
- ✅ Dashboard loads with financial data
- ✅ No errors in browser console
- ✅ Settings modal opens without errors
- ✅ Configuration saves successfully