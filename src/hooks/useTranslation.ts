'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { t, type Language } from '@/lib/i18n'

export function useTranslation() {
  const { language } = useSettings()
  
  const translate = (key: string): string => {
    return t(key, language as Language)
  }
  
  return { t: translate, language: language as Language }
}

