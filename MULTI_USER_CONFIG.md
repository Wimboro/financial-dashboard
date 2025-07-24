# Multi-User Configuration System

This financial dashboard now supports per-user configuration, allowing each user to have their own Google Sheets ID, Gemini API key, and backend API URLs. All user configurations are securely stored in Supabase.

## Features

### 🔐 User-Specific Configurations
- **Google Sheets ID**: Each user can connect their own Google Sheet
- **Gemini API Key**: Personal AI insights with individual API keys
- **Backend URLs**: Separate localhost and production API endpoints
- **Secure Storage**: All configurations stored in Supabase with Row Level Security

### 🎯 Configuration Priority
1. **User Settings**: Personal configurations from the settings panel
2. **Environment Variables**: Fallback to `.env` variables if user settings are empty

## Getting Started

### 1. User Registration & Login
1. Create an account or login to the dashboard
2. You'll be prompted to configure your settings on first use

### 2. Configure Your Google Sheet
1. Click on your profile dropdown → **Settings**
2. Enter your **Google Sheets ID**:
   - Find it in your sheet URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Make sure your sheet is publicly viewable
3. Required columns: `Date`, `Description`, `Category`, `Amount`

### 3. Setup Gemini AI (Optional)
1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Enter it in the **Gemini API Key** field
3. Enable AI-powered spending insights and recommendations

### 4. Backend Configuration (Optional)
1. Set your **Localhost API URL** for development
2. Set your **Production API URL** for deployment
3. Used for transaction deletion and other write operations

## Database Schema

The system uses a `user_configurations` table in Supabase:

```sql
CREATE TABLE user_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    google_sheet_id TEXT,
    gemini_api_key TEXT,
    backend_api_url_localhost TEXT DEFAULT 'http://localhost:4000/api',
    backend_api_url_production TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### Security Features
- **Row Level Security (RLS)**: Users can only access their own configurations
- **Encrypted Storage**: API keys and sensitive data are securely stored
- **User Isolation**: Complete separation between different users' data

## Configuration Management

### UserConfigContext
The `UserConfigContext` provides configuration management throughout the app:

```typescript
const { 
  config,                    // Current user configuration
  updateConfig,             // Update configuration
  getGoogleSheetId,        // Get Google Sheet ID (user config or env)
  getGeminiApiKey,         // Get Gemini API key (user config or env)  
  getBackendApiUrl         // Get backend URL (user config or env)
} = useUserConfig();
```

### Configuration Flow
1. **Load**: User configurations are loaded when user authenticates
2. **Fallback**: If user config is empty, falls back to environment variables
3. **Update**: Users can update their settings through the Settings panel
4. **Persist**: Changes are automatically saved to Supabase

## Environment Variables (Fallback)

These environment variables serve as fallbacks when user configurations are not set:

```env
# Google Sheets Configuration
VITE_GOOGLE_SHEET_ID=your_default_sheet_id

# Gemini AI Configuration  
VITE_GEMINI_API_KEY=your_default_gemini_key

# Backend API Configuration
VITE_BACKEND_API_URL_LOCALHOST=http://localhost:4000/api
VITE_BACKEND_API_URL_PRODUCTION=https://your-api.example.com/api

# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Google Sheets Setup

### Sheet Structure
Your Google Sheet should have these columns:
- **Date**: Transaction date (YYYY-MM-DD or any date format)
- **Description**: Transaction description
- **Category**: Expense/Income category
- **Amount**: Transaction amount (positive for income, negative for expenses)

### Making Sheet Public
1. Open your Google Sheet
2. Click **Share** → **Change to anyone with the link**
3. Set permission to **Viewer**
4. Copy the sheet ID from the URL

### Example Sheet Data
```
Date        | Description       | Category    | Amount
2024-01-15 | Salary           | Income      | 5000000
2024-01-16 | Groceries        | Food        | -150000
2024-01-17 | Coffee           | Food        | -25000
2024-01-18 | Transport        | Transport   | -50000
```

## Gemini AI Integration

### Features
- **Spending Analysis**: AI-powered insights on monthly expenses
- **Personalized Tips**: Context-aware saving recommendations
- **Indonesian Context**: Recommendations tailored for Indonesian users
- **Privacy**: Each user's data is analyzed separately

### API Usage
- Uses Gemini 2.0 Flash Lite model
- Generates insights based on expense categories
- Provides markdown-formatted responses

## Multi-User Benefits

### For Families
- Each family member can track their own expenses
- Separate Google Sheets for different accounts
- Individual privacy and data isolation

### For Businesses
- Multiple team members can use the same dashboard
- Separate configurations for different departments
- Centralized authentication with isolated data

### For Developers
- Easy tenant isolation
- Scalable configuration management
- Secure API key storage

## Migration from Single-User

If you're upgrading from a single-user setup:

1. **Existing Environment Variables**: Will continue to work as fallbacks
2. **User Settings**: Override environment variables when configured
3. **Gradual Migration**: Users can configure settings at their own pace
4. **Backward Compatibility**: App works with or without user configurations

## Troubleshooting

### Common Issues

**1. "Google Sheet ID not configured"**
- Solution: Set your Google Sheet ID in Settings or environment variables

**2. "Gemini API key not configured"**  
- Solution: Get API key from Google AI Studio and add to Settings

**3. "Backend API URL not configured"**
- Solution: Configure backend URLs in Settings for write operations

**4. "Failed to load user configuration"**
- Solution: Check Supabase connection and database permissions

### Getting Help

1. Check the browser console for detailed error messages
2. Verify your Google Sheet is publicly accessible
3. Ensure your Gemini API key is valid and has quota
4. Confirm Supabase database setup is complete

## Security Best Practices

1. **API Keys**: Never share your Gemini API keys
2. **Sheet Access**: Only make sheets publicly viewable, not editable
3. **Regular Rotation**: Periodically rotate API keys
4. **Monitor Usage**: Keep track of API usage and costs

## Future Enhancements

- [ ] Shared configurations for teams
- [ ] Import/export configuration settings
- [ ] Configuration templates
- [ ] Enhanced admin panel
- [ ] Audit logs for configuration changes 