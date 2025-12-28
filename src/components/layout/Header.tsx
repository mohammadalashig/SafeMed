'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, getCurrentUser } from '@/lib/auth'
import { getProfile, type Profile } from '@/lib/profiles'
import { LogOut, Menu, X, ScanLine, History, Calendar, Settings, Heart, Pill } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

export default function Header() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const currentUser = await getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      try {
        const userProfile = await getProfile(currentUser.id)
        setProfile(userProfile)
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    }
  }

  const navLinks = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: ScanLine },
    { href: '/history', label: t('nav.history'), icon: History },
    { href: '/schedule', label: t('nav.schedule'), icon: Calendar },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ]

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-medical-500/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300" />
              <div className="relative p-1.5 bg-gradient-to-br from-medical-500 to-safety-500 rounded-lg">
                <Pill className="w-5 h-5 text-white" />
              </div>
            </motion.div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-medical-400 to-safety-400 bg-clip-text text-transparent">
              SafeMed
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-slate-300 hover:text-medical-400 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-lg px-2 py-1"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-slate-300 text-sm">
              {profile?.full_name || user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-slate-300 hover:text-safety-400 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-safety-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-lg px-2 py-1"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-medical-400 hover:rotate-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-lg p-1"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-600/50">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-slate-300 hover:text-medical-400 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                )
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-slate-300 hover:text-safety-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

