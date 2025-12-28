'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Clock, Pill } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAIScheduleSuggestion, updateUserMedicationDosage, createMedicationReminder } from '@/lib/schedule-api'
import { getDosageSuggestion } from '@/lib/medication-schedule'
import type { UserMedication } from '@/lib/medications'

interface AddScheduleModalProps {
  medication: UserMedication
  onClose: () => void
  onSuccess: () => void
}

const daysOfWeek = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
]

export default function AddScheduleModal({ medication, onClose, onSuccess }: AddScheduleModalProps) {
  const [dosage, setDosage] = useState(medication.dosage || '')
  const [frequency, setFrequency] = useState(medication.frequency || '')
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['09:00'])
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [aiSuggestion, setAiSuggestion] = useState<any>(null)
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newTime, setNewTime] = useState('09:00')

  const medicationName = medication.medication?.name || 'Unknown'

  useEffect(() => {
    // Load AI suggestion automatically
    loadAISuggestion()
  }, [])

  const loadAISuggestion = async () => {
    setLoadingSuggestion(true)
    try {
      const suggestion = await getAIScheduleSuggestion(medicationName)
      setAiSuggestion(suggestion)
      
      // Pre-fill form with AI suggestions
      if (!dosage) setDosage(suggestion.dosage)
      if (!frequency) setFrequency(suggestion.frequency)
      if (selectedTimes.length === 1 && selectedTimes[0] === '09:00') {
        setSelectedTimes(suggestion.times)
      }
    } catch (error: any) {
      console.error('Error loading AI suggestion:', error)
      toast.error('Could not load AI suggestions')
    } finally {
      setLoadingSuggestion(false)
    }
  }

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setDosage(aiSuggestion.dosage)
      setFrequency(aiSuggestion.frequency)
      setSelectedTimes(aiSuggestion.times)
      setSelectedDays(aiSuggestion.days)
      toast.success('AI suggestion applied!')
    }
  }

  const addTime = () => {
    if (newTime && !selectedTimes.includes(newTime)) {
      setSelectedTimes([...selectedTimes, newTime].sort())
      setNewTime('09:00')
    }
  }

  const removeTime = (time: string) => {
    if (selectedTimes.length > 1) {
      setSelectedTimes(selectedTimes.filter(t => t !== time))
    } else {
      toast.error('At least one time is required')
    }
  }

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDays([...selectedDays, day].sort())
    }
  }

  const handleSave = async () => {
    if (!dosage || !frequency) {
      toast.error('Please enter dosage and frequency')
      return
    }
    
    if (selectedTimes.length === 0) {
      toast.error('Please add at least one reminder time')
      return
    }
    
    if (selectedDays.length === 0) {
      toast.error('Please select at least one day')
      return
    }

    setIsSaving(true)
    try {
      // Update medication dosage/frequency
      await updateUserMedicationDosage(medication.id, dosage, frequency)
      
      // Create reminders for each time
      for (const time of selectedTimes) {
        await createMedicationReminder(
          medication.user_id,
          medication.id,
          time,
          selectedDays,
          true
        )
      }
      
      toast.success('Schedule created successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create schedule')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <Pill className="w-6 h-6 text-medical-400" />
            <h2 className="text-2xl font-display font-bold text-slate-100">
              Add Schedule: {medicationName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Suggestion Banner */}
          {aiSuggestion && (
            <div className="bg-medical-900/20 border border-medical-600/30 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-medical-400" />
                  <h3 className="font-semibold text-medical-300">AI Suggestion</h3>
                </div>
                <button
                  onClick={applyAISuggestion}
                  className="text-xs bg-medical-600 hover:bg-medical-500 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
              <p className="text-sm text-slate-300 mb-2">
                <strong>Dosage:</strong> {aiSuggestion.dosage} | <strong>Frequency:</strong> {aiSuggestion.frequency}
              </p>
              <p className="text-sm text-slate-300 mb-1">
                <strong>Suggested Times:</strong> {aiSuggestion.times.join(', ')}
              </p>
              {aiSuggestion.notes && (
                <p className="text-xs text-slate-400 mt-2 italic">{aiSuggestion.notes}</p>
              )}
            </div>
          )}

          {/* Dosage & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Dosage <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g., 500mg"
                className="w-full bg-dark-700/50 border border-dark-600 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Frequency <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g., Twice daily"
                className="w-full bg-dark-700/50 border border-dark-600 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20"
              />
            </div>
          </div>

          {/* Reminder Times */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Reminder Times <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                {selectedTimes.map((time) => (
                  <div
                    key={time}
                    className="bg-medical-600/20 border border-medical-600/50 rounded-lg px-3 py-2 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-medical-400" />
                    <span className="text-slate-100 font-medium">{time}</span>
                    {selectedTimes.length > 1 && (
                      <button
                        onClick={() => removeTime(time)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="bg-dark-700/50 border border-dark-600 text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:border-medical-500"
                />
                <button
                  onClick={addTime}
                  className="bg-dark-700 hover:bg-dark-600 text-slate-100 px-4 py-2 rounded-lg transition-colors"
                >
                  Add Time
                </button>
              </div>
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Days of Week <span className="text-red-400">*</span>
            </label>
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-600">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !dosage || !frequency || selectedTimes.length === 0 || selectedDays.length === 0}
            className="bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-6 py-2 rounded-lg hover:shadow-neon-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

