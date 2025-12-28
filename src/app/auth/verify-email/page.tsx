'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { verifyEmailCode, resendVerificationEmail } from '@/lib/auth'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [emailValue, setEmailValue] = useState(email || '')

  useEffect(() => {
    if (email) {
      setEmailValue(email)
    }
  }, [email])

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input, remove any non-numeric characters
    const value = e.target.value.replace(/\D/g, '')
    // Limit to 8 digits max
    setCode(value.slice(0, 8))
  }

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.error('Please enter the verification code')
      return
    }

    if (!emailValue) {
      toast.error('Email is required')
      return
    }

    setIsLoading(true)
    try {
      await verifyEmailCode(emailValue, code.trim())
      toast.success('Email verified successfully!')
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code')
      setCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!emailValue) {
      toast.error('Email is required')
      return
    }

    setIsResending(true)
    try {
      await resendVerificationEmail(emailValue)
      toast.success('Verification code sent! Check your email.')
      setCode('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification code')
    } finally {
      setIsResending(false)
    }
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
              <Mail className="w-8 h-8 text-medical-400" />
            </div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-medical-400 to-safety-400 bg-clip-text text-transparent mb-2">
              Verify Your Email
            </h1>
            <p className="text-slate-400">
              Enter the verification code sent to your email address
            </p>
          </div>

          {!email && (
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-medical-500/50 focus:border-medical-500 transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
          )}

          {email && (
            <div className="mb-6 text-center">
              <p className="text-slate-300 font-medium">{email}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="verification-code" className="block text-sm font-medium text-slate-200 mb-4 text-center">
              Verification Code
            </label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={code}
              onChange={handleCodeChange}
              className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-medical-500/50 focus:border-medical-500 transition-all text-center text-2xl font-mono tracking-widest"
              placeholder="Enter 8-digit code"
              autoComplete="off"
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              Paste or type the 8-digit code from your email
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading || !code.trim() || !emailValue}
            className="w-full py-3 bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-600 hover:to-medical-700 text-white font-semibold rounded-lg shadow-lg shadow-medical-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={isResending || !emailValue}
              className="text-medical-400 hover:text-medical-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-slate-400 hover:text-slate-300 transition-colors text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-medical-400 animate-spin" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}

