-- Financial Dashboard - User Configurations Setup
-- Run this script in Supabase SQL Editor to set up user-specific configurations

-- Create user_configurations table
CREATE TABLE IF NOT EXISTS user_configurations (
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

-- Enable Row Level Security
ALTER TABLE user_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
CREATE POLICY "Users can view own configurations" ON user_configurations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own configurations" ON user_configurations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configurations" ON user_configurations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own configurations" ON user_configurations
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_configurations_updated_at
    BEFORE UPDATE ON user_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_configurations_user_id ON user_configurations(user_id);

-- Test the setup (optional - you can comment this out)
-- INSERT INTO user_configurations (user_id, google_sheet_id) 
-- VALUES (auth.uid(), 'test_sheet_id') 
-- ON CONFLICT (user_id) DO NOTHING;

-- Verify the table was created successfully
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_configurations' 
ORDER BY ordinal_position; 