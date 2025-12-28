'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, loginSchema, type LoginFormData } from '@/lib/auth'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validated = loginSchema.parse(formData)
      setIsLoading(true)

      await signIn(validated.email, validated.password)
      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {}
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0] as keyof LoginFormData] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        toast.error(error.message || 'Failed to sign in')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 placeholder:text-slate-500 transition-all"
          placeholder="you@example.com"
        />
        {errors.email && <p className="mt-1 text-sm text-safety-400">{errors.email}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-200">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-medical-400 hover:text-medical-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 placeholder:text-slate-500 transition-all"
          placeholder="••••••••"
        />
        {errors.password && <p className="mt-1 text-sm text-safety-400">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}

