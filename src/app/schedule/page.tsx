'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCurrentUser } from '@/lib/auth'
import { getUserMedications, type UserMedication } from '@/lib/medications'
import { useTranslation } from '@/hooks/useTranslation'
import { useSettings } from '@/contexts/SettingsContext'
import { formatDate } from '@/lib/date-utils'
import { Clock, Plus, CheckCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import AddScheduleModal from '@/components/schedule/AddScheduleModal'
import { getMedicationReminders, type MedicationReminder } from '@/lib/schedule-api'

export default function SchedulePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { timezone, language } = useSettings()
  const [user, setUser] = useState<any>(null)
  const [medications, setMedications] = useState<UserMedication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMedication, setSelectedMedication] = useState<UserMedication | null>(null)
  const [reminders, setReminders] = useState<Map<number, MedicationReminder[]>>(new Map())

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadMedications()
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

  const loadMedications = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const userMeds = await getUserMedications(user.id)
      const activeMeds = userMeds.filter(med => med.is_active)
      setMedications(activeMeds)
      
      // Load reminders for each medication
      const remindersMap = new Map<number, MedicationReminder[]>()
      for (const med of activeMeds) {
        try {
          const medReminders = await getMedicationReminders(user.id, med.id)
          remindersMap.set(med.id, medReminders)
        } catch (error) {
          console.error(`Failed to load reminders for medication ${med.id}:`, error)
        }
      }
      setReminders(remindersMap)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load medication schedule')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-medical-400 to-safety-400 bg-clip-text text-transparent mb-2">
            {t('nav.schedule')}
          </h1>
          <p className="text-slate-400">Manage your medication reminders and schedule</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-12 shadow-glass text-center">
            <Clock className="w-16 h-16 text-medical-400 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-slate-100 mb-2">
              No Active Medications
            </h2>
            <p className="text-slate-400 mb-6">
              Add medications to your history to set up reminders
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-300"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {medications.map((userMed) => {
                const medReminders = reminders.get(userMed.id) || []
                return (
                  <div
                    key={userMed.id}
                    className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">
                          {userMed.medication?.name || 'Unknown Medication'}
                        </h3>
                        {userMed.dosage && (
                          <p className="text-slate-300 text-sm mb-1">
                            <span className="font-semibold">Dosage:</span> {userMed.dosage}
                          </p>
                        )}
                        {userMed.frequency && (
                          <p className="text-slate-300 text-sm mb-1">
                            <span className="font-semibold">Frequency:</span> {userMed.frequency}
                          </p>
                        )}
                        {userMed.start_date && (
                          <p className="text-slate-400 text-xs">
                            Started: {formatDate(userMed.start_date, timezone, language)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedMedication(userMed)}
                        className="flex items-center gap-2 bg-medical-600 hover:bg-medical-500 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        {medReminders.length > 0 ? 'Edit Schedule' : 'Add Schedule'}
                      </button>
                    </div>
                    
                    {/* Show existing reminders */}
                    {medReminders.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-dark-600/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-medical-400" />
                          <span className="text-sm font-semibold text-slate-200">Scheduled Reminders:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {medReminders.map((reminder) => (
                            <div
                              key={reminder.id}
                              className="bg-medical-600/20 border border-medical-600/50 rounded-lg px-3 py-1.5 flex items-center gap-2"
                            >
                              <Clock className="w-3 h-3 text-medical-400" />
                              <span className="text-sm text-slate-200">
                                {reminder.reminder_time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Add Schedule Modal */}
            {selectedMedication && (
              <AddScheduleModal
                medication={selectedMedication}
                onClose={() => setSelectedMedication(null)}
                onSuccess={() => {
                  loadMedications()
                  setSelectedMedication(null)
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

