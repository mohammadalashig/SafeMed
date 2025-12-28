'use client'

import { createContext, useContext, useState } from 'react'

type Language = 'en' | 'tr'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'welcome': 'Welcome',
    'dashboard': 'Dashboard',
    'history': 'History',
    'schedule': 'Schedule',
    'settings': 'Settings',
  },
  tr: {
    'welcome': 'Hoş Geldiniz',
    'dashboard': 'Kontrol Paneli',
    'history': 'Geçmiş',
    'schedule': 'Program',
    'settings': 'Ayarlar',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

