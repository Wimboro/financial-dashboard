import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY as fallback)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('user_configurations')
      .select('count(*)')
      .limit(1)
    
    if (error && error.code === '42P01') {
      // Table doesn't exist
      return false
    }
    
    if (error) {
      console.error('❌ Error checking table:', error.message)
      return false
    }
    
    return true
  } catch (error) {
    console.error('❌ Error checking table:', error)
    return false
  }
}

async function createTable() {
  try {
    console.log('📋 Creating user_configurations table...')
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '001_create_user_configurations.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      return false
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Error executing migration:', error.message)
      return false
    }
    
    console.log('✅ Table created successfully!')
    return true
  } catch (error) {
    console.error('❌ Error creating table:', error)
    return false
  }
}

async function testUserConfigOperations() {
  try {
    console.log('🧪 Testing user configuration operations...')
    
    // Test basic select
    const { data, error } = await supabase
      .from('user_configurations')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error testing select:', error.message)
      return false
    }
    
    console.log('✅ Database operations working correctly!')
    console.log(`📊 Current configurations count: ${data?.length || 0}`)
    return true
  } catch (error) {
    console.error('❌ Error testing operations:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Setting up Financial Dashboard database...')
  console.log(`🔗 Supabase URL: ${supabaseUrl}`)
  
  // Check if table exists
  const tableExists = await checkTableExists()
  
  if (tableExists) {
    console.log('✅ user_configurations table already exists')
  } else {
    console.log('❌ user_configurations table does not exist')
    
    const created = await createTable()
    if (!created) {
      console.error('❌ Failed to create table. Exiting.')
      process.exit(1)
    }
  }
  
  // Test operations
  const testPassed = await testUserConfigOperations()
  if (!testPassed) {
    console.error('❌ Database test failed. Please check your setup.')
    process.exit(1)
  }
  
  console.log('🎉 Database setup completed successfully!')
  console.log('\n📝 Next steps:')
  console.log('1. Start your app: npm run dev')
  console.log('2. Login to your account')
  console.log('3. Go to Settings to configure your personal settings')
}

main().catch(console.error) 