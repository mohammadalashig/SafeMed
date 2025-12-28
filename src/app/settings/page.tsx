'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCurrentUser } from '@/lib/auth'
import { getUserSettings, updateUserSettings, defaultSettings, type UserSettings } from '@/lib/settings'
import { useSettings } from '@/contexts/SettingsContext'
import { changePassword } from '@/lib/auth'
import { Save, Lock, Eye, EyeOff, Trash2, Download, Globe, Clock, Bell, Camera, Shield, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'
import { formatDate, formatTime } from '@/lib/date-utils'

export default function SettingsPage() {
  const router = useRouter()
  const { refreshSettings, language, timezone } = useSettings()
  const { t } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
  }

  const loadSettings = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const userSettings = await getUserSettings(user.id)
      if (userSettings) {
        setSettings({ ...defaultSettings, ...userSettings })
      } else {
        setSettings({ ...defaultSettings, user_id: user.id })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    try {
      setIsSaving(true)
      await updateUserSettings(user.id, settings)
      await refreshSettings() // Refresh settings context to apply changes
      
      // Apply language and timezone immediately
      document.documentElement.lang = settings.language
      document.documentElement.setAttribute('data-timezone', settings.timezone)
      
      toast.success('Settings saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
      setShowPasswordChange(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-medical-400 to-safety-400 bg-clip-text text-transparent mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-slate-400">Manage your preferences and account settings</p>
        </div>

        <div className="space-y-6">
          {/* Account Security */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-medical-400" />
              <h2 className="text-xl font-display font-bold text-slate-100">{t('settings.accountSecurity')}</h2>
            </div>
            <div className="space-y-4">
              {!showPasswordChange ? (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-slate-200">Password</label>
                    <p className="text-slate-400 text-xs">Change your account password</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="bg-dark-700 text-slate-100 border border-dark-600 font-semibold px-4 py-2 rounded-lg hover:bg-dark-600 hover:border-medical-500 transition-all flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {t('settings.changePassword')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4 p-4 bg-dark-900/50 rounded-lg border border-dark-600">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">{t('settings.currentPassword')}</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">{t('settings.newPassword')}</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all"
                        placeholder="Enter new password (min 6 characters)"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">{t('settings.confirmPassword')}</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="flex-1 bg-gradient-to-r from-medical-500 to-medical-600 text-white font-semibold px-4 py-2 rounded-lg hover:shadow-neon-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? 'Changing...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                      className="bg-dark-700 text-slate-100 border border-dark-600 font-semibold px-4 py-2 rounded-lg hover:bg-dark-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              <div className="pt-2 border-t border-dark-600">
                <Link
                  href="/auth/forgot-password"
                  className="text-medical-400 hover:text-medical-300 text-sm transition-colors"
                >
                  {t('settings.forgotPassword')}
                </Link>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
            <h2 className="text-xl font-display font-bold text-slate-100 mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value as 'dark' | 'auto')}
                  className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all"
                >
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Light theme coming soon</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Font Size</label>
                <select
                  value={settings.font_size}
                  onChange={(e) => updateSetting('font_size', e.target.value as 'small' | 'medium' | 'large')}
                  className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">High Contrast</label>
                  <p className="text-slate-400 text-xs">Increase contrast for better visibility</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.high_contrast}
                  onChange={(e) => updateSetting('high_contrast', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Reduce Motion</label>
                  <p className="text-slate-400 text-xs">Minimize animations and transitions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reduce_motion}
                  onChange={(e) => updateSetting('reduce_motion', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-medical-400" />
              <h2 className="text-xl font-display font-bold text-slate-100">Language & Region</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => {
                    updateSetting('language', e.target.value)
                    // Apply language immediately
                    document.documentElement.lang = e.target.value
                    // Set text direction for Arabic
                    if (e.target.value === 'ar') {
                      document.documentElement.dir = 'rtl'
                    } else {
                      document.documentElement.dir = 'ltr'
                    }
                  }}
                  className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all"
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                  <option value="ar">العربية</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Current: {settings.language === 'en' ? 'English' : 
                           settings.language === 'tr' ? 'Türkçe' :
                           settings.language === 'ar' ? 'العربية' : 'English'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => {
                    updateSetting('timezone', e.target.value)
                    // Apply timezone immediately
                    document.documentElement.setAttribute('data-timezone', e.target.value)
                  }}
                  className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Europe/Istanbul">Istanbul, Turkey (GMT+3)</option>
                  <option value="Asia/Dubai">Dubai, UAE (GST)</option>
                  <option value="Asia/Riyadh">Riyadh, Saudi Arabia (AST)</option>
                  <option value="Africa/Cairo">Cairo, Egypt (EET)</option>
                  <option value="Asia/Beirut">Beirut, Lebanon (EET)</option>
                  <option value="America/New_York">New York, USA (EST/EDT)</option>
                  <option value="America/Los_Angeles">Los Angeles, USA (PST/PDT)</option>
                  <option value="Europe/London">London, UK (GMT/BST)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Current timezone: {settings.timezone} | Current time: {formatTime(new Date(), settings.timezone, settings.language)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Example date: {formatDate(new Date(), settings.timezone, settings.language)}
                </p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-medical-400" />
              <h2 className="text-xl font-display font-bold text-slate-100">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Email Notifications</label>
                  <p className="text-slate-400 text-xs">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => updateSetting('email_notifications', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Push Notifications</label>
                  <p className="text-slate-400 text-xs">Receive push notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.push_notifications}
                  onChange={(e) => updateSetting('push_notifications', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Medication Reminders</label>
                  <p className="text-slate-400 text-xs">Get reminders for your medications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.medication_reminders}
                  onChange={(e) => updateSetting('medication_reminders', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Interaction Alerts</label>
                  <p className="text-slate-400 text-xs">Alert about drug interactions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.interaction_alerts}
                  onChange={(e) => updateSetting('interaction_alerts', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
            </div>
          </div>

          {/* Scanner Settings */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-medical-400" />
              <h2 className="text-xl font-display font-bold text-slate-100">Scanner</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Camera Preference</label>
                <select
                  value={settings.camera_preference}
                  onChange={(e) => updateSetting('camera_preference', e.target.value as 'environment' | 'user')}
                  className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all"
                >
                  <option value="environment">Back Camera</option>
                  <option value="user">Front Camera</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Scan Sound</label>
                  <p className="text-slate-400 text-xs">Play sound when barcode is scanned</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.scan_sound}
                  onChange={(e) => updateSetting('scan_sound', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Scan Vibration</label>
                  <p className="text-slate-400 text-xs">Vibrate when barcode is scanned</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.scan_vibration}
                  onChange={(e) => updateSetting('scan_vibration', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Auto Scan</label>
                  <p className="text-slate-400 text-xs">Automatically scan when camera is ready</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.auto_scan}
                  onChange={(e) => updateSetting('auto_scan', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
            <h2 className="text-xl font-display font-bold text-slate-100 mb-4">Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Data Sharing</label>
                  <p className="text-slate-400 text-xs">Allow anonymous data sharing for research</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.data_sharing}
                  onChange={(e) => updateSetting('data_sharing', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Analytics Tracking</label>
                  <p className="text-slate-400 text-xs">Help improve the app with usage analytics</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.analytics_tracking}
                  onChange={(e) => updateSetting('analytics_tracking', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Crash Reporting</label>
                  <p className="text-slate-400 text-xs">Automatically report crashes</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.crash_reporting}
                  onChange={(e) => updateSetting('crash_reporting', e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-medical-500 focus:ring-medical-500"
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-medical-400" />
              <h2 className="text-xl font-display font-bold text-slate-100">Data Management</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => toast('Export feature coming soon!', { icon: 'ℹ️' })}
                className="w-full bg-dark-700 text-slate-100 border border-dark-600 font-semibold px-4 py-3 rounded-lg hover:bg-dark-600 hover:border-medical-500 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export My Data
              </button>
              <p className="text-xs text-slate-500">Download all your medication data in JSON format</p>
              
              <div className="pt-4 border-t border-dark-600/50">
                <Link
                  href="/errors"
                  className="w-full bg-dark-700 text-slate-100 border border-dark-600 font-semibold px-4 py-3 rounded-lg hover:bg-dark-600 hover:border-medical-500 transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  View Error Logs
                </Link>
                <p className="text-xs text-slate-500 mt-1">View and track application errors</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-dark-800/40 backdrop-blur-xl border border-safety-600/50 rounded-xl p-6 shadow-glass">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-safety-400" />
              <h2 className="text-xl font-display font-bold text-safety-400">Danger Zone</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => toast.error('Account deletion feature coming soon!')}
                className="w-full bg-safety-900/20 text-safety-400 border border-safety-600/50 font-semibold px-4 py-3 rounded-lg hover:bg-safety-900/30 hover:border-safety-500 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
              <p className="text-xs text-slate-500">Permanently delete your account and all associated data</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-8 py-3 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
