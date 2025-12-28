'use client'

import Link from 'next/link'
import SignupForm from '@/components/auth/SignupForm'
import { motion } from 'framer-motion'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-8 shadow-glass">
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-medical-400 to-safety-400 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-slate-400 mb-6">Start your medication safety journey</p>
          
          <SignupForm />

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-medical-400 hover:text-medical-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

