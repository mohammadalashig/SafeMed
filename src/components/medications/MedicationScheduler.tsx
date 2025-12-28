'use client'

import { useState } from 'react'
import { Clock, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

interface MedicationSchedulerProps {
  medicationId: number
  onSave: (reminder: ReminderData) => Promise<void>
}

export interface ReminderData {
  reminder_time: string
  days_of_week: number[]
  is_active: boolean
}

export default function MedicationScheduler({ medicationId, onSave }: MedicationSchedulerProps) {
  const { t } = useTranslation()
  const [time, setTime] = useState('09:00')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const daysOfWeek = [
    { label: t('day.sun'), value: 0 },
    { label: t('day.mon'), value: 1 },
    { label: t('day.tue'), value: 2 },
    { label: t('day.wed'), value: 3 },
    { label: t('day.thu'), value: 4 },
    { label: t('day.fri'), value: 5 },
    { label: t('day.sat'), value: 6 },
  ]

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const handleSave = async () => {
    if (selectedDays.length === 0) {
      toast.error('Please select at least one day')
      return
    }

    try {
      setIsSaving(true)
      await onSave({
        reminder_time: time,
        days_of_week: selectedDays,
        is_active: true,
      })
      toast.success('Reminder added successfully!')
      setTime('09:00')
      setSelectedDays([])
    } catch (error: any) {
      toast.error(error.message || 'Failed to save reminder')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-medical-400" />
        <h3 className="text-xl font-display font-bold text-slate-100">Add Reminder</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Days of Week</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedDays.includes(day.value)
                    ? 'bg-medical-500 text-white'
                    : 'bg-dark-700 text-slate-300 hover:bg-dark-600'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || selectedDays.length === 0}
          className="w-full bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Add Reminder'}
        </button>
      </div>
    </div>
  )
}

