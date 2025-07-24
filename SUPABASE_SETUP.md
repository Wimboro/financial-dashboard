# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your Financial Dashboard application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Your existing Financial Dashboard project

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: Financial Dashboard
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (something like `https://your-project-ref.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root:
```bash
touch .env
```

2. Add your Supabase credentials to the `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: Replace the values with your actual Supabase project URL and anon key.

## Step 4: Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following settings:

### Site URL
- Set your site URL to `http://localhost:5173` for development
- For production, set it to your actual domain

### Auth Providers
- **Email**: Enabled by default
- **Confirm email**: You can disable this for development, but keep it enabled for production

### Email Templates
- Customize the email templates if needed
- The default templates work fine for getting started

## Step 5: Test the Authentication

1. Start your development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`
3. You should see the login screen
4. Try creating a new account:
   - Click "Sign Up" tab
   - Enter an email and password (minimum 6 characters)
   - Click "Create Account"
   - Check your email for verification (if email confirmation is enabled)

## Step 6: Verify User Creation

1. In your Supabase dashboard, go to **Authentication** → **Users**
2. You should see the user you just created
3. If email confirmation is enabled, the user will show as "unconfirmed" until they click the verification link

## Features Included

### Authentication Features
- ✅ Email/Password Sign Up
- ✅ Email/Password Sign In
- ✅ Password Reset
- ✅ User Session Management
- ✅ Automatic Token Refresh
- ✅ Sign Out
- ✅ User Profile Display

### UI Features
- ✅ Beautiful login/signup form with tabs
- ✅ Password visibility toggle
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages
- ✅ Dark mode support
- ✅ Responsive design
- ✅ User profile dropdown in header

## Security Considerations

### Row Level Security (RLS)
If you plan to store user-specific financial data in Supabase:

1. Go to **Database** → **Tables**
2. Create your tables with a `user_id` column
3. Enable RLS on your tables
4. Create policies to ensure users can only access their own data

Example policy for a `transactions` table:
```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Environment Variables
- Never commit your `.env` file to version control
- Use different Supabase projects for development and production
- Rotate your keys periodically

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your `VITE_SUPABASE_ANON_KEY` in `.env`
   - Make sure there are no extra spaces or quotes

2. **"Invalid URL" error**
   - Verify your `VITE_SUPABASE_URL` is correct
   - Ensure it starts with `https://`

3. **Email not sending**
   - Check your Supabase project's email settings
   - For development, you can disable email confirmation
   - For production, configure a custom SMTP provider

4. **User not redirected after login**
   - Check browser console for errors
   - Verify your site URL in Supabase settings

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Next Steps

1. **Customize the UI**: Modify the login screen colors, branding, and layout
2. **Add Social Auth**: Configure Google, GitHub, or other OAuth providers
3. **User Profiles**: Create a user profile management system
4. **Data Integration**: Connect user authentication to your financial data
5. **Email Customization**: Set up custom email templates and SMTP

## Production Deployment

When deploying to production:

1. Create a new Supabase project for production
2. Update your environment variables
3. Configure your production domain in Supabase settings
4. Set up proper email delivery (SMTP)
5. Enable email confirmation
6. Set up monitoring and logging

Your Financial Dashboard now has secure, scalable authentication powered by Supabase! 🎉 