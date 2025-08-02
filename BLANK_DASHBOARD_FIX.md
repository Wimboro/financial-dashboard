# Fixing Blank Dashboard After Login

If you're experiencing a blank dashboard after logging in, this guide will help you identify and fix the issue.

## Quick Diagnosis

1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Look for error messages** when you log in

## Common Causes and Solutions

### 1. Missing Environment Variables

**Symptoms:**
- Console shows "your-supabase-url" or "your-supabase-anon-key"
- Authentication fails or dashboard is completely blank

**Solution:**
```bash
# Run the environment setup script
npm run setup-env

# Edit the .env file with your actual values
# Required variables:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 2. Database Table Not Set Up

**Symptoms:**
- Console shows "relation 'user_configurations' does not exist"
- Error code 42P01
- Settings modal shows "Failed to load user configuration"

**Solution:**
```bash
# Set up the database table
npm run setup-db
```

Or manually run the SQL script in Supabase:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `setup_user_configurations.sql`
4. Click Run

### 3. Authentication Issues

**Symptoms:**
- User appears logged in but dashboard is blank
- Console shows authentication errors
- User context is null

**Solution:**
1. Clear browser cache and cookies
2. Log out and log back in
3. Check if Supabase project is active
4. Verify Supabase URL and anon key are correct

### 4. Configuration Loading Errors

**Symptoms:**
- Dashboard shows "Please configure your Google Sheet ID and Backend API URL"
- Settings modal opens but shows loading forever
- Console shows configuration errors

**Solution:**
1. Open Settings (click your profile → Settings)
2. Enter your Google Sheet ID
3. Enter your Backend API URL
4. Save the configuration
5. Refresh the dashboard

### 5. Network/API Issues

**Symptoms:**
- Console shows network errors
- "Failed to fetch" errors
- Backend API connection issues

**Solution:**
1. Check if your backend API server is running
2. Verify the API URL is correct
3. Check if the API server can access Google Sheets
4. Ensure proper CORS configuration

## Step-by-Step Fix

### Step 1: Check Environment Variables
```bash
npm run setup-env
```

Make sure your `.env` file has:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### Step 2: Set Up Database
```bash
npm run setup-db
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Configure User Settings
1. Open the app in your browser
2. Log in to your account
3. Click your profile picture → Settings
4. Enter your Google Sheet ID
5. Enter your Backend API URL
6. Save the configuration

### Step 5: Verify Setup
1. Check browser console for any remaining errors
2. Refresh the dashboard
3. Data should now load properly

## Debug Information

To get detailed debug information, check the browser console for these log messages:

- ✅ "Dashboard component mounted"
- ✅ "User configuration ready"
- ✅ "Configuration complete, fetching data..."
- ❌ Any error messages

## Still Having Issues?

If the problem persists:

1. **Check the full error message** in browser console
2. **Verify your Supabase project** is active and accessible
3. **Test basic functionality** by creating a test table in Supabase
4. **Check network tab** in developer tools for failed requests
5. **Review the detailed troubleshooting guide**: `TROUBLESHOOTING.md`

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "relation 'user_configurations' does not exist" | Database table missing | Run `npm run setup-db` |
| "permission denied for table user_configurations" | RLS policies not set up | Run `npm run setup-db` |
| "Google Sheet ID not configured" | Missing configuration | Open Settings and configure |
| "Backend API URL not configured" | Missing configuration | Open Settings and configure |
| "Failed to load configuration" | Database connection issue | Check Supabase configuration |

## Success Indicators

When everything is working correctly, you should see:

- ✅ Dashboard loads with financial data
- ✅ No errors in browser console
- ✅ Settings modal opens without errors
- ✅ Configuration saves successfully
- ✅ Data refreshes when you click "Segarkan Data"

## Getting Help

If you're still experiencing issues:

1. Copy the exact error message from the browser console
2. Check which step in this guide you're stuck on
3. Review the detailed documentation in the project
4. Ensure all prerequisites are met (Supabase, Google Sheets, Backend API)