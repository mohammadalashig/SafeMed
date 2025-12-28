// Script to delete ALL users from Supabase for presentation cleanup
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found')
    process.exit(1)
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
  })
  
  return env
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'your-service-role-key-here') {
  console.error('Missing or invalid Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function deleteAllUsers() {
  console.log('🗑️  Fetching all users...')
  
  try {
    // Get all users
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      console.error('\nMake sure SUPABASE_SERVICE_ROLE_KEY is set correctly in .env.local')
      return
    }

    if (!users || !users.users || users.users.length === 0) {
      console.log('✅ No users found in database. Database is already clean!')
      return
    }

    console.log(`\n📊 Found ${users.users.length} user(s) in database:`)
    users.users.forEach((u, index) => {
      console.log(`   ${index + 1}. ${u.email} (${u.id})`)
    })

    console.log(`\n⚠️  WARNING: About to delete ALL ${users.users.length} user(s)`)
    console.log('   This will delete all user data including profiles, medications, schedules, etc.')
    console.log('\n   Proceeding in 2 seconds... (Press Ctrl+C to cancel)')
    
    // Small delay to allow cancellation
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('\n🗑️  Deleting users...\n')
    
    let successCount = 0
    let errorCount = 0
    
    for (const user of users.users) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        
        if (error) {
          console.error(`   ❌ Failed to delete ${user.email}:`, error.message)
          errorCount++
        } else {
          console.log(`   ✅ Deleted ${user.email}`)
          successCount++
        }
      } catch (err) {
        console.error(`   ❌ Error deleting ${user.email}:`, err.message)
        errorCount++
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log(`✅ Successfully deleted: ${successCount} user(s)`)
    if (errorCount > 0) {
      console.log(`❌ Failed to delete: ${errorCount} user(s)`)
    }
    console.log('='.repeat(50))
    console.log('\n✅ Database cleanup complete!')
    console.log('   You can now create new accounts with the same emails.\n')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

// Run the deletion
deleteAllUsers()

