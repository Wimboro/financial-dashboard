# Google Sheets Service Account Setup

This application now uses a **service account** approach to access Google Sheets, which is more secure than making your spreadsheets public.

## How It Works

1. **Backend API**: The application uses a backend API to read Google Sheets data
2. **Service Account**: The backend uses a Google Service Account with proper credentials
3. **Sheet Sharing**: You only need to share your sheet with the service account email
4. **No Public Access**: Your spreadsheet remains private and secure

## Setup Steps

### 1. Get Your Google Sheets ID

Copy the ID from your Google Sheets URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```

### 2. Share Your Sheet with Service Account

Share your Google Spreadsheet with this service account email:
```
financial-dashboard@your-project.iam.gserviceaccount.com
```

**Important**: Give it **Viewer** access only (not Editor or Owner).

### 3. Configure Your Sheet Structure

Your spreadsheet should have these columns in the first row (header):

| Date | Description | Category | Amount |
|------|-------------|----------|---------|
| 2024-01-15 | Grocery shopping | Food | -50000 |
| 2024-01-16 | Salary | Income | 5000000 |

**Column Requirements**:
- **Date**: Format as YYYY-MM-DD or any standard date format
- **Description**: Text description of the transaction
- **Category**: Category name (e.g., Food, Transport, Income)
- **Amount**: Positive for income, negative for expenses

### 4. Configure in Settings

1. Open the application
2. Click on your profile → Settings
3. Enter your Google Sheets ID
4. Configure other settings as needed
5. Save configuration

## API Endpoint

The backend API endpoint used is:
```
GET /api/spreadsheet/{SHEET_ID}/data?sheet=Sheet1
```

## Benefits of Service Account Approach

✅ **Security**: Your spreadsheet remains private  
✅ **Authentication**: Proper Google API authentication  
✅ **Reliability**: More stable than public sheet access  
✅ **Control**: You control who has access to your data  
✅ **Scalability**: Better for multi-user applications  

## Troubleshooting

### Common Issues

1. **"Sheet not found" error**
   - Check if the Google Sheets ID is correct
   - Verify the sheet is shared with the service account email

2. **"Permission denied" error**
   - Make sure you shared the sheet with the correct service account email
   - Ensure the service account has at least Viewer access

3. **"No data found" error**
   - Check if your sheet has the correct header row
   - Verify there's actual data in the sheet
   - Make sure you're using the correct sheet name (default: "Sheet1")

4. **Backend API errors**
   - Verify your backend API URL is configured correctly
   - Check if the backend service is running
   - Ensure the backend has proper Google Service Account credentials

### Getting Help

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all configuration settings in the Settings modal
3. Test with a simple spreadsheet first
4. Contact your system administrator for backend API issues

## Security Notes

- Never share your Google Sheets publicly
- Only share with the specific service account email provided
- Use Viewer access only (never Editor or Owner)
- Keep your API keys and configuration secure
- The service account cannot modify your data (read-only access) 