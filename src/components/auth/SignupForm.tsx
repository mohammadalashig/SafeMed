'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp, signupSchema, type SignupFormData } from '@/lib/auth'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    fullName: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validated = signupSchema.parse(formData)
      setIsLoading(true)

      await signUp(validated.email, validated.password, validated.fullName)
      toast.success('Account created! Please check your email for the verification code.')
      router.push(`/auth/verify-email?email=${encodeURIComponent(validated.email)}`)
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {}
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0] as keyof SignupFormData] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        toast.error(error.message || 'Failed to create account')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-200 mb-2">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 placeholder:text-slate-500 transition-all"
          placeholder="John Doe"
        />
        {errors.fullName && <p className="mt-1 text-sm text-safety-400">{errors.fullName}</p>}
      </div>

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
        <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
          Password
        </label>
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
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  )
}

