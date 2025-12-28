'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClientComponentClient } from '@/lib/supabase'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Handle token verification from URL hash or query params
    const handleTokenVerification = async () => {
      // Check for token_hash in query params (manual verification)
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      
      // Check URL hash for tokens (Supabase PKCE flow sends tokens in hash fragments)
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      const hashAccessToken = hashParams.get('access_token')
      const hashRefreshToken = hashParams.get('refresh_token')
      const hashType = hashParams.get('type')
      
      // If we have token_hash in query params, verify it manually
      if (tokenHash && type === 'recovery') {
        try {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          })
    
          if (verifyError) {
            throw verifyError
          }
          
          // Clean up URL by removing query params
          window.history.replaceState({}, '', '/auth/reset-password')
        } catch (error: any) {
          console.error('Token verification error:', error)
          toast.error('Invalid or expired reset link. Please request a new one.')
          router.push('/auth/forgot-password')
          return
        }
      } 
      // If we have tokens in hash (from Supabase redirect), let Supabase handle them
      else if (hashAccessToken && hashRefreshToken) {
        // Supabase client should automatically process tokens from hash
        // Wait a bit for session to be established, then check
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Clean up URL hash
        window.history.replaceState({}, '', '/auth/reset-password')
      }
      
      // Check if user is now authenticated (retry a few times if needed)
      let user = null
      let attempts = 0
      while (!user && attempts < 3) {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (!error && currentUser) {
          user = currentUser
          break
        }
        
        if (attempts < 2) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        attempts++
      }
      
      if (!user) {
        toast.error('Invalid or expired reset link. Please request a new one.')
      router.push('/auth/forgot-password')
        return
      }
      
      setIsCheckingAuth(false)
    }
    
    handleTokenVerification()
  }, [supabase, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      // Verify user is still authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Session expired. Please request a new reset link.')
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        throw new Error(error.message)
      }

      setIsSuccess(true)
      toast.success('Password updated successfully!')
      
      // Sign out to clear the recovery session and redirect to login
      await supabase.auth.signOut()
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-medical-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-8 shadow-glass">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-medical-500/20 mb-4">
              <CheckCircle className="w-8 h-8 text-medical-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-100 mb-2">
              Password Updated!
            </h1>
            <p className="text-slate-400 mb-6">
              Your password has been successfully updated. Redirecting to login...
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-gradient-to-r from-medical-500 to-medical-600 text-white font-semibold px-6 py-2 rounded-lg hover:shadow-neon-lg transition-all"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-8 shadow-glass">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-medical-500/20 mb-4">
              <Lock className="w-8 h-8 text-medical-400" />
            </div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-medical-400 to-safety-400 bg-clip-text text-transparent mb-2">
              Set New Password
            </h1>
            <p className="text-slate-400">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-medical-500/50 focus:border-medical-500 transition-all"
                placeholder="Enter new password"
                required
                minLength={6}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-medical-500/50 focus:border-medical-500 transition-all"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full py-3 bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-600 hover:to-medical-700 text-white font-semibold rounded-lg shadow-lg shadow-medical-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-medical-400 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

