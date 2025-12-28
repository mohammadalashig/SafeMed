'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => {
        if (theme === 'dark') {
          setTheme('light')
        } else if (theme === 'light') {
          setTheme('auto')
        } else {
          setTheme('dark')
        }
      }}
      className="p-2 text-slate-300 hover:text-medical-400 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}

