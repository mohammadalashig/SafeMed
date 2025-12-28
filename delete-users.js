// Script to delete users using Supabase Admin API
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local')
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

async function deleteUsers(emails) {
  console.log('Fetching users...')
  
  // Get all users
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError.message)
    return
  }

  console.log(`Found ${users.users.length} total users`)
  
  // Find users to delete
  const usersToDelete = users.users.filter(u => emails.includes(u.email))
  
  if (usersToDelete.length === 0) {
    console.log('No users found with the specified emails')
    console.log('Available users:')
    users.users.forEach(u => console.log(`  - ${u.email}`))
    return
  }

  console.log(`\nDeleting ${usersToDelete.length} user(s)...`)
  
  for (const user of usersToDelete) {
    console.log(`Deleting: ${user.email} (${user.id})`)
    
    const { error } = await supabase.auth.admin.deleteUser(user.id)
    
    if (error) {
      console.error(`  ❌ Error deleting ${user.email}:`, error.message)
    } else {
      console.log(`  ✅ Deleted ${user.email}`)
    }
  }
  
  console.log('\n✅ Done!')
}

// Get emails from command line or use defaults
const emails = process.argv.slice(2)
const defaultEmails = ['ammaremran03@gmail.com', 'mohammadalashig@gmail.com']

const emailsToDelete = emails.length > 0 ? emails : defaultEmails

console.log('Deleting users:', emailsToDelete.join(', '))
deleteUsers(emailsToDelete)

