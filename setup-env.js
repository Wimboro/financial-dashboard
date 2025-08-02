#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Financial Dashboard Environment Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
    console.log('✅ .env file already exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\nCurrent environment variables:');
    console.log(envContent);
} else {
    console.log('📝 Creating new .env file...');
    
    const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Sheets Configuration (Optional - can be set per user)
VITE_GOOGLE_SHEET_ID=your_google_sheet_id

# Gemini API Configuration (Optional - can be set per user)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Backend API Configuration (Optional - can be set per user)
VITE_BACKEND_API_URL_LOCALHOST=http://localhost:4000/api
VITE_BACKEND_API_URL_PRODUCTION=your_production_backend_url
`;

    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env file created successfully!');
    console.log('\nPlease edit the .env file with your actual values:');
    console.log('1. Get your Supabase URL and anon key from your Supabase project dashboard');
    console.log('2. Set up your Google Sheet ID (optional - can be configured per user)');
    console.log('3. Set up your Gemini API key (optional - can be configured per user)');
    console.log('4. Configure your backend API URLs (optional - can be configured per user)');
}

console.log('\n📚 Next steps:');
console.log('1. Set up your Supabase database using: npm run setup-db');
console.log('2. Start the development server: npm run dev');
console.log('3. Open your browser and log in to configure your personal settings');
console.log('\n📖 For detailed setup instructions, see:');
console.log('- SUPABASE_SETUP.md');
console.log('- MULTI_USER_CONFIG.md');
console.log('- TROUBLESHOOTING.md');