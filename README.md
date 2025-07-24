# Financial Dashboard

A modern React-based financial dashboard that integrates with Google Sheets for data storage and provides AI-powered financial insights using Google's Gemini API.

## Features

- 📊 **Financial Data Visualization**: Interactive charts and graphs for income/expense tracking
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌙 **Dark Mode Support**: Toggle between light and dark themes
- 📈 **Monthly Trends**: Track financial patterns over time
- 🏷️ **Category Breakdown**: Organize transactions by categories
- 📅 **Daily Analysis**: View detailed daily transaction breakdowns
- 🤖 **AI Insights**: Get spending recommendations from Google Gemini AI
- 🔐 **User Authentication**: Secure login with Supabase
- 📝 **Real-time Data**: Sync with Google Sheets for live updates

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **Authentication**: Supabase
- **Data Source**: Google Sheets
- **AI**: Google Gemini API
- **Build Tool**: Vite

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Sheets Configuration
VITE_GOOGLE_SHEET_ID=your_google_sheet_id

# Gemini AI API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key

# Backend API Configuration
VITE_BACKEND_API_URL_LOCALHOST=http://localhost:4000/api
VITE_BACKEND_API_URL_PRODUCTION=your_production_backend_url
```

### Getting the Required Keys

#### 1. Supabase Setup
1. Go to [Supabase](https://supabase.com/) and create a new project
2. Navigate to Settings → API
3. Copy the Project URL and anon public key
4. See `SUPABASE_SETUP.md` for detailed authentication setup

#### 2. Google Sheets Setup
1. Create a Google Sheet with columns: Date, Description, Category, Amount
2. Make the sheet publicly viewable (Share → Anyone with the link can view)
3. Extract the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

#### 3. Google Gemini API Setup
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the generated API key

#### 4. Backend API Setup
- For localhost: Use `http://localhost:4000/api`
- For production: Deploy your backend and use the production URL

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd financial-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Fill in your environment variables in the `.env` file

5. Start the development server:
```bash
npm run dev
```

## Google Sheets Data Format

Your Google Sheet should have the following columns:

| Date | Description | Category | Amount | User ID | Timestamp |
|------|-------------|----------|---------|---------|-----------|
| 2024-01-15 | Coffee | Food | -5000 | user123 | 2024-01-15T10:30:00Z |
| 2024-01-15 | Salary | Income | 5000000 | user123 | 2024-01-15T09:00:00Z |

**Notes:**
- **Date**: Format as YYYY-MM-DD
- **Amount**: Positive numbers for income, negative for expenses
- **Category**: Any string (e.g., "Food", "Transportation", "Salary")
- **User ID**: For multi-user support (optional)
- **Timestamp**: ISO format timestamp (optional)

## Key Features Explained

### AI-Powered Insights
The dashboard uses Google's Gemini AI to analyze your spending patterns and provide personalized financial advice. Click the "✨ Dapatkan Wawasan Pengeluaran" button to get insights about your monthly expenses.

### Dark Mode
Toggle between light and dark themes using the moon/sun icon in the header.

### Interactive Charts
- **Monthly Trends**: Line chart showing income vs expenses over time
- **Category Breakdown**: Pie chart showing expense distribution by category
- **Daily Analysis**: Detailed daily transaction views

### Data Management
- **Real-time Sync**: Automatically fetches latest data from Google Sheets
- **Search & Filter**: Find specific transactions quickly
- **Delete Transactions**: Remove transactions (requires backend API)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom hooks (dark mode, etc.)
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── vite-env.d.ts       # TypeScript environment definitions
```

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and rotate them regularly
- The `.env` file is already included in `.gitignore`
- Use environment-specific configurations for different deployments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 