// Quick password reset script
// Run with: node reset-password.js

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

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetPassword(email, newPassword) {
  console.log(`Resetting password for: ${email}`)
  
  try {
    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError.message)
      console.error('\nMake sure SUPABASE_SERVICE_ROLE_KEY is set correctly in .env.local')
      console.error('Get it from: Supabase Dashboard → Settings → API → service_role key')
      return
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`User ${email} not found`)
      console.log('\nAvailable users:')
      users.users.forEach(u => console.log(`  - ${u.email}`))
      return
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`)
    console.log('Updating password...')

    // Update password
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    if (error) {
      console.error('Error resetting password:', error.message)
    } else {
      console.log(`\n✅ Password reset successfully!`)
      console.log(`Email: ${email}`)
      console.log(`New password: ${newPassword}`)
      console.log('\nYou can now login with these credentials.')
    }
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

// Get email and password from command line
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.log('Usage: node reset-password.js <email> <new-password>')
  console.log('\nExample:')
  console.log('  node reset-password.js ammaremran03@gmail.com MyNewPassword123')
  process.exit(1)
}

resetPassword(email, password)

