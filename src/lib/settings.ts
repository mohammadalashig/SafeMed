import { createClientComponentClient } from './supabase'

export interface UserSettings {
  id?: number
  user_id: string
  theme: 'dark' | 'auto'
  language: string
  timezone: string
  email_notifications: boolean
  push_notifications: boolean
  medication_reminders: boolean
  interaction_alerts: boolean
  weekly_reports: boolean
  camera_preference: 'environment' | 'user'
  scan_sound: boolean
  scan_vibration: boolean
  auto_scan: boolean
  data_sharing: boolean
  analytics_tracking: boolean
  crash_reporting: boolean
  default_units: 'metric' | 'imperial'
  show_generic_names: boolean
  show_brand_names: boolean
  show_prices: boolean
  font_size: 'small' | 'medium' | 'large'
  high_contrast: boolean
  reduce_motion: boolean
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found, return default
      return null
    }
    throw new Error(error.message)
  }

  return data
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
  const supabase = createClientComponentClient()
  
  // Check if settings exist
  const existing = await getUserSettings(userId)
  
  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  } else {
    // Create new
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ...settings,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }
}

export const defaultSettings: UserSettings = {
  user_id: '',
  theme: 'dark',
  language: 'en',
  timezone: 'UTC',
  email_notifications: true,
  push_notifications: true,
  medication_reminders: true,
  interaction_alerts: true,
  weekly_reports: false,
  camera_preference: 'environment',
  scan_sound: true,
  scan_vibration: true,
  auto_scan: true,
  data_sharing: false,
  analytics_tracking: true,
  crash_reporting: true,
  default_units: 'metric',
  show_generic_names: true,
  show_brand_names: true,
  show_prices: true,
  font_size: 'medium',
  high_contrast: false,
  reduce_motion: false,
}

