import { createClientComponentClient } from './supabase'
import { z } from 'zod'
import toast from 'react-hot-toast'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>

export async function signIn(email: string, password: string) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  // Profile is automatically created by the database trigger (handle_new_user)
  // No need to manually create it here as RLS would block it before session is established

  return data
}

export async function signOut() {
  const supabase = createClientComponentClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentUser() {
  const supabase = createClientComponentClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    return null
  }

  return user
}

export async function resetPassword(email: string) {
  const supabase = createClientComponentClient()
  // Redirect directly to reset password page - it will handle token verification
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function verifyEmailCode(email: string, token: string) {
  const supabase = createClientComponentClient()
  
  // For signup confirmation, Supabase uses verifyOtp with type 'email'
  // The token can be 6 or 8 digits depending on Supabase configuration
  // Remove any whitespace and non-numeric characters
  const cleanToken = token.replace(/\D/g, '').trim()
  
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: cleanToken,
    type: 'email',
  })

  if (error) {
    // Provide more helpful error messages
    if (error.message.includes('token')) {
      throw new Error('Invalid verification code. Please check the code and try again.')
    }
    if (error.message.includes('expired')) {
      throw new Error('Verification code has expired. Please request a new one.')
    }
    throw new Error(error.message || 'Failed to verify email. Please try again.')
  }

  return data
}

export async function resendVerificationEmail(email: string) {
  const supabase = createClientComponentClient()
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = createClientComponentClient()
  
  // First verify current password by attempting to sign in
  const user = await getCurrentUser()
  if (!user || !user.email) {
    throw new Error('User not found')
  }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    throw new Error('Current password is incorrect')
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    throw new Error(updateError.message)
  }
}

