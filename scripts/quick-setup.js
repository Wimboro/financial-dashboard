#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 Quick Setup for Financial Dashboard\n');

async function main() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    
    console.log('This script will help you set up your environment variables.\n');
    
    console.log('📋 Step 1: Supabase Setup');
    console.log('1. Go to https://supabase.com and create a new project');
    console.log('2. Once created, go to Settings → API');
    console.log('3. Copy your Project URL and anon/public key\n');
    
    const supabaseUrl = await question('Enter your Supabase Project URL (e.g., https://your-project.supabase.co): ');
    const supabaseAnonKey = await question('Enter your Supabase anon/public key: ');
    
    console.log('\n📋 Step 2: Optional Configuration');
    console.log('You can skip these by pressing Enter, and configure them later in the app.\n');
    
    const googleSheetId = await question('Enter your Google Sheet ID (optional): ');
    const geminiApiKey = await question('Enter your Gemini API key (optional): ');
    const backendUrlLocalhost = await question('Enter your local backend API URL (optional, default: http://localhost:4000/api): ') || 'http://localhost:4000/api';
    const backendUrlProduction = await question('Enter your production backend API URL (optional): ');
    
    // Create the .env content
    const envContent = `# Supabase Configuration
# You need to replace these with your actual Supabase project credentials
# Get them from: https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/settings/api
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Google Sheets Configuration (Optional - can be set per user)
# You can configure this per user in the app settings, or set it globally here
VITE_GOOGLE_SHEET_ID=${googleSheetId || 'your_google_sheet_id'}

# Gemini API Configuration (Optional - can be set per user)
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=${geminiApiKey || 'your_gemini_api_key'}

# Backend API Configuration (Optional - can be set per user)
# This should point to your backend API that can access Google Sheets
VITE_BACKEND_API_URL_LOCALHOST=${backendUrlLocalhost}
VITE_BACKEND_API_URL_PRODUCTION=${backendUrlProduction || 'your_production_backend_url'}
`;

    // Write the .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Environment variables saved to .env file!');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Set up your database: npm run setup-db');
    console.log('2. Start the development server: npm run dev');
    console.log('3. Open http://localhost:5173 in your browser');
    console.log('4. Sign up/login and configure your settings');
    
    console.log('\n📖 For detailed instructions, see:');
    console.log('- QUICK_SETUP_GUIDE.md');
    console.log('- SUPABASE_SETUP.md');
    console.log('- BLANK_DASHBOARD_FIX.md');
    
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

main();