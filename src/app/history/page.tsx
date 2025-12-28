'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import MedicationCard from '@/components/medications/MedicationCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCurrentUser } from '@/lib/auth'
import { getUserMedications, removeUserMedication, type UserMedication } from '@/lib/medications'
import { Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'
import { useSettings } from '@/contexts/SettingsContext'
import { formatDate } from '@/lib/date-utils'

export default function HistoryPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { timezone, language } = useSettings()
  const [user, setUser] = useState<any>(null)
  const [medications, setMedications] = useState<UserMedication[]>([])
  const [filteredMedications, setFilteredMedications] = useState<UserMedication[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadMedications()
    }
  }, [user])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = medications.filter((med) =>
        med.medication?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.medication?.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredMedications(filtered)
    } else {
      setFilteredMedications(medications)
    }
  }, [searchQuery, medications])

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
      setMedications(userMeds)
      setFilteredMedications(userMeds)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load medication history')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (medicationId: number) => {
    if (!confirm('Are you sure you want to remove this medication from your history?')) {
      return
    }

    try {
      await removeUserMedication(medicationId)
      toast.success('Medication removed')
      loadMedications()
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove medication')
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
            {t('nav.history')}
          </h1>
          <p className="text-slate-400">View and manage your medication history</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medications..."
              className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 placeholder:text-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Medications List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-12 shadow-glass text-center">
            <p className="text-slate-400">
              {searchQuery ? 'No medications found matching your search.' : 'No medications in your history yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedications.map((userMed) => (
              <MedicationCard
                key={userMed.id}
                medication={userMed.medication || {
                  id: userMed.medication_id,
                  name: 'Unknown Medication',
                  barcode: null,
                  description: null,
                  active_ingredients: null,
                  dosage_form: null,
                  strength: null,
                  manufacturer: null,
                  image_url: null,
                  created_at: userMed.created_at,
                }}
                onRemove={() => handleRemove(userMed.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

