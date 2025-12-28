'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getUserSettings, type UserSettings, defaultSettings } from '@/lib/settings'

interface SettingsContextType {
  settings: UserSettings
  isLoading: boolean
  refreshSettings: () => Promise<void>
  language: string
  timezone: string
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const loadSettings = async () => {
    try {
      const user = await getCurrentUser()
      let loadedSettings: UserSettings
      
      if (user) {
        const userSettings = await getUserSettings(user.id)
        if (userSettings) {
          loadedSettings = { ...defaultSettings, ...userSettings }
        } else {
          loadedSettings = { ...defaultSettings, user_id: user.id }
        }
      } else {
        loadedSettings = defaultSettings
      }
      
      setSettings(loadedSettings)
      applySettings(loadedSettings)
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to load settings:', error)
      applySettings(defaultSettings)
      setIsInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }

  const applySettings = (userSettings: UserSettings) => {
    const root = document.documentElement

    // Apply theme
    root.classList.remove('light', 'dark')
    if (userSettings.theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark' // Always use dark for now
      root.classList.add(systemTheme)
    } else {
      root.classList.add(userSettings.theme) // Will be 'dark'
    }

    // Apply font size
    root.style.setProperty('--font-size-base', 
      userSettings.font_size === 'small' ? '14px' :
      userSettings.font_size === 'large' ? '18px' : '16px'
    )

    // Apply high contrast
    if (userSettings.high_contrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply reduce motion
    if (userSettings.reduce_motion) {
      root.classList.add('reduce-motion')
      root.style.setProperty('--motion-reduce', '1')
    } else {
      root.classList.remove('reduce-motion')
      root.style.setProperty('--motion-reduce', '0')
    }

    // Apply language - set HTML lang attribute
    root.lang = userSettings.language || 'en'
    
    // Set text direction for RTL languages (Arabic)
    if (userSettings.language === 'ar') {
      root.dir = 'rtl'
    } else {
      root.dir = 'ltr'
    }
    
    // Store timezone in data attribute for easy access
    root.setAttribute('data-timezone', userSettings.timezone || 'UTC')
  }

  useEffect(() => {
    loadSettings()
  }, [])

  // Watch for settings changes
  useEffect(() => {
    if (isInitialized && !isLoading) {
      applySettings(settings)
      
      // Listen for system theme changes if auto theme is selected
      if (settings.theme === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
          const root = document.documentElement
          root.classList.remove('light', 'dark')
          root.classList.add(mediaQuery.matches ? 'dark' : 'dark') // Always dark for now
        }
        handleChange() // Apply immediately
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [settings.theme, settings.font_size, settings.high_contrast, settings.reduce_motion, settings.language, settings.timezone, isLoading, isInitialized])
  
  // Force re-render when language or timezone changes (for components using translations)
  useEffect(() => {
    if (isInitialized && !isLoading) {
      // Trigger a small state update to force re-render of components using translations
      // This ensures all translated text updates immediately
      const event = new CustomEvent('settingsChanged', { 
        detail: { language: settings.language, timezone: settings.timezone } 
      })
      window.dispatchEvent(event)
    }
  }, [settings.language, settings.timezone, isLoading, isInitialized])

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      isLoading, 
      refreshSettings: loadSettings,
      language: settings.language || 'en',
      timezone: settings.timezone || 'UTC',
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

