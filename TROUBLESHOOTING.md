# Troubleshooting Guide

## "Failed to load user configuration" Error

This error typically occurs when the `user_configurations` table doesn't exist in your Supabase database. Follow these steps to fix it:

### Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for specific error messages when you try to open Settings

Common error codes:
- **42P01**: Table doesn't exist
- **PGRST116**: No configuration found (normal for new users)
- **Permission denied**: Authentication issue

### Step 2: Set Up the Database Table

You have two options to create the required database table:

#### Option A: Use Supabase SQL Editor (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **SQL Editor** in the left sidebar
4. Copy and paste the contents of `setup_user_configurations.sql` (created in your project root)
5. Click **Run** to execute the script

#### Option B: Manual Setup via Supabase Dashboard

1. Go to **Database** → **Tables** in your Supabase dashboard
2. Click **Create a new table**
3. Set table name: `user_configurations`
4. Add these columns:
   - `id` (uuid, primary key, default: `gen_random_uuid()`)
   - `user_id` (uuid, foreign key to `auth.users.id`, not null)
   - `google_sheet_id` (text, nullable)
   - `gemini_api_key` (text, nullable)
   - `backend_api_url_localhost` (text, default: `http://localhost:4000/api`)
   - `backend_api_url_production` (text, nullable)
   - `created_at` (timestamptz, default: `now()`)
   - `updated_at` (timestamptz, default: `now()`)
5. Enable **Row Level Security (RLS)**
6. Add RLS policies as shown in the SQL script

### Step 3: Verify Database Setup

After creating the table, run this query in the Supabase SQL Editor to verify:

```sql
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_configurations' 
ORDER BY ordinal_position;
```

You should see 8 columns listed.

### Step 4: Check Row Level Security Policies

Verify that RLS policies are set up correctly:

```sql
SELECT 
    schemaname,
    tablename, 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_configurations';
```

You should see 4 policies: SELECT, INSERT, UPDATE, DELETE.

### Step 5: Test the Configuration

1. Restart your application: `npm run dev`
2. Login to your account
3. Try opening Settings again
4. Check the browser console for any new error messages

### Step 6: Advanced Debugging

If the issue persists, enable debug logging:

1. Open your browser's Developer Tools
2. Go to Console tab
3. Look for log messages starting with:
   - "Loading user configuration for user:"
   - "Getting Google Sheet ID:"
   - "Getting Gemini API Key:"

### Common Issues and Solutions

#### Issue: "permission denied for table user_configurations"

**Solution**: RLS policies are not set up correctly. Re-run the SQL script in Step 2.

#### Issue: "relation 'user_configurations' does not exist"

**Solution**: The table wasn't created. Follow Step 2 again.

#### Issue: "Failed to load configuration: Invalid user"

**Solution**: User authentication issue. Try logging out and logging back in.

#### Issue: Settings modal opens but shows loading forever

**Solution**: 
1. Check network tab in developer tools
2. Look for failed requests to Supabase
3. Verify your Supabase URL and anon key in `.env`

### Verification Steps

After fixing the issue, verify everything works:

1. ✅ Settings modal opens without errors
2. ✅ You can enter Google Sheets ID
3. ✅ You can enter Gemini API key
4. ✅ You can save configuration
5. ✅ Success message appears after saving
6. ✅ Dashboard uses your personal configurations

### Environment Variables Check

Ensure your `.env` file has these variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional fallbacks (used when user config is empty)
VITE_GOOGLE_SHEET_ID=your-fallback-sheet-id
VITE_GEMINI_API_KEY=your-fallback-api-key
VITE_BACKEND_API_URL_LOCALHOST=http://localhost:4000/api
VITE_BACKEND_API_URL_PRODUCTION=https://your-api.example.com/api
```

### Still Having Issues?

If none of the above steps work:

1. Check the full error message in browser console
2. Verify your Supabase project is active and accessible
3. Try creating a test table in Supabase to ensure basic functionality works
4. Contact support with the specific error message and steps you've tried

### Success Indicators

When everything is working correctly, you should see:

- ✅ No errors in browser console when opening Settings
- ✅ Configuration form loads with current values
- ✅ Save button works and shows success message
- ✅ Dashboard uses your personal Google Sheets and API keys
- ✅ Console logs show configuration values being loaded correctly 