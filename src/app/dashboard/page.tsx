'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import MedicationSearch from '@/components/medications/MedicationSearch'
import AIAnalysisResult from '@/components/medications/AIAnalysisResult'
import MedicationCard from '@/components/medications/MedicationCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCurrentUser } from '@/lib/auth'
import { addUserMedication, getUserMedications, type UserMedication } from '@/lib/medications'
import { createClientComponentClient } from '@/lib/supabase'
import { analyzeMedication, type MedicationAnalysis } from '@/lib/ai-medication-analyzer'
import { X, Search, ScanLine, Pill, Sparkles, TrendingUp, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'
import dynamic from 'next/dynamic'

const SimpleBarcodeScanner = dynamic(
  () => import('@/components/scanner/SimpleBarcodeScanner'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-slate-400 mt-4">Loading scanner...</p>
        </div>
      </div>
    )
  }
)

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [userMedications, setUserMedications] = useState<UserMedication[]>([])
  const [analysisResult, setAnalysisResult] = useState<MedicationAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMedications, setIsLoadingMedications] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScanner, setShowScanner] = useState(false)

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
      setIsLoadingMedications(true)
      const medications = await getUserMedications(user.id)
      setUserMedications(medications)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load medications')
    } finally {
      setIsLoadingMedications(false)
    }
  }

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false)
    setIsLoading(true)
    setAnalysisResult(null)
    
    const normalizedBarcode = barcode.trim()
    console.log('Scanned barcode:', normalizedBarcode)
    
    try {
      // Go directly to AI analysis - no database lookup
      toast.loading(`Analyzing barcode ${normalizedBarcode} with AI...`)
      const analysis = await analyzeMedication(normalizedBarcode, '')
      setAnalysisResult(analysis)
      toast.dismiss()
      toast.success('Analysis complete!')
    } catch (aiError: any) {
      console.error('AI analysis error:', aiError)
      toast.dismiss()
      
      if (aiError.message?.includes('No AI provider') || aiError.message?.includes('Failed to analyze')) {
        toast.error('AI analysis unavailable. Please configure an AI API key.')
      } else {
        toast.error(aiError.message || 'Failed to analyze barcode. The barcode might not be recognized by AI.')
        toast(`Scanned barcode: ${normalizedBarcode}. Try searching by medication name instead.`, {
          duration: 5000,
          icon: 'ℹ️',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchMedication = async (query: string) => {
    if (!query || query.trim().length < 2) return

    setIsLoading(true)
    setAnalysisResult(null)
    const normalizedQuery = query.trim()

    try {
      toast.loading(`Analyzing medication: ${normalizedQuery}...`)
      const analysis = await analyzeMedication('', normalizedQuery)
      setAnalysisResult(analysis)
      toast.dismiss()
      toast.success('Analysis complete!')
    } catch (aiError: any) {
      console.error('AI analysis error:', aiError)
      toast.dismiss()
      
      if (aiError.message?.includes('No AI provider') || aiError.message?.includes('Failed to analyze')) {
        toast.error('AI analysis unavailable. Please configure an AI API key.')
      } else {
        toast.error(aiError.message || 'Failed to analyze medication. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectMedication = async (medication: any) => {
    try {
      setIsLoading(true)
      setAnalysisResult(null)
      
      // Try AI analysis to get Turkish equivalents and more info
      toast.loading(`Analyzing ${medication.name}...`)
      try {
        const analysis = await analyzeMedication('', medication.name)
        setAnalysisResult(analysis)
        toast.dismiss()
        toast.success('Analysis complete!')
      } catch (aiError: any) {
        // If AI fails, still show what we found in database
        toast.dismiss()
        toast.success(`Found: ${medication.name}`)
        setAnalysisResult(null)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process medication')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToHistory = async (medication: any) => {
    if (!user) return
    
    try {
      // First, try to find or create medication in database
      const supabase = createClientComponentClient()
      let medicationId: number

      const medicationName = medication.ticari_adi || medication.name || 'Unknown Medication'
      
      // Check if medication exists (case-insensitive search)
      const { data: existingMeds, error: searchError } = await supabase
        .from('medications')
        .select('id')
        .ilike('name', `%${medicationName}%`)
        .limit(1)

      if (searchError) {
        console.error('Error searching for medication:', searchError)
        // Continue anyway - we'll try to create it
      }

      if (existingMeds && existingMeds.length > 0) {
        medicationId = existingMeds[0].id
      } else {
        // Try to create new medication
        const { data: newMed, error: insertError } = await supabase
          .from('medications')
          .insert({
            name: medicationName,
            barcode: null,
            description: medication.etken_madde ? `Active ingredient: ${medication.etken_madde}` : null,
            active_ingredients: medication.etken_madde ? [medication.etken_madde] : [],
            dosage_form: null,
            strength: null,
            manufacturer: medication.firma || null,
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('Error inserting medication:', insertError)
          
          // If RLS error, provide helpful message
          if (insertError.message?.includes('row-level security') || insertError.message?.includes('RLS')) {
            throw new Error(
              'RLS policy error: Please run the SQL fix in Supabase Dashboard. ' +
              'Go to SQL Editor and run: scripts/fix-medications-rls.sql'
            )
          }
          
          throw new Error(`Failed to create medication: ${insertError.message}`)
        }
        
        if (!newMed || !newMed.id) {
          throw new Error('Failed to create medication: No ID returned from database')
        }
        
        medicationId = newMed.id
      }

      // Add to user medications
      await addUserMedication(user.id, medicationId)
      toast.success('Medication added to history!')
      setAnalysisResult(null)
      loadMedications()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add medication')
      // Log error for tracking
      try {
        const { logError } = await import('@/lib/error-tracking')
        await logError(error, {
          component: 'Dashboard',
          action: 'add_medication_to_history',
          resourceType: 'medication',
          severity: 'medium',
        })
      } catch (loggingError) {
        console.error('Failed to log error:', loggingError)
      }
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ position: 'relative' }}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="p-2 bg-gradient-to-br from-medical-500/20 to-safety-500/20 rounded-lg border border-medical-500/30"
            >
              <Pill className="w-6 h-6 text-medical-400" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-medical-400 to-safety-400 bg-clip-text text-transparent mb-2">
                {t('dashboard.welcome')}, {user.email?.split('@')[0]}
              </h1>
              <p className="text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-medical-400" />
                Search for medications by name to check interactions and find Turkish equivalents
              </p>
            </div>
          </div>
        </div>

        {/* Medication Name Search - TOP PRIORITY - Moved to top */}
        <div className="mb-8 relative" style={{ zIndex: 1000 }}>
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass relative" style={{ zIndex: 1000, overflow: 'visible', position: 'relative' }}>
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="p-2 bg-medical-500/10 rounded-lg"
              >
                <Search className="w-6 h-6 text-medical-400" />
              </motion.div>
              <div>
                <h2 className="text-xl font-display font-bold text-slate-100">Search Medications</h2>
                <p className="text-slate-400 text-sm">Search by medication name or active ingredient (e.g., Aspirin, Paracetamol)</p>
              </div>
            </div>
            <MedicationSearch
              onSelectMedication={handleSelectMedication}
              onSearchResult={(results) => {
                if (results.length === 0 && searchQuery) {
                  // Allow direct AI analysis
                }
              }}
            />
            {/* Alternative: Direct AI search if not found in database */}
            <div className="mt-4 pt-4 border-t border-dark-600/50">
              <p className="text-xs text-slate-500 mb-2">Didn't find what you're looking for?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                      handleSearchMedication(searchQuery)
                    }
                  }}
                  placeholder="Enter medication name for AI analysis..."
                  className="flex-1 bg-dark-700/50 border border-dark-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent focus:shadow-neon transition-all duration-300"
                />
                <button
                  onClick={() => handleSearchMedication(searchQuery)}
                  disabled={!searchQuery || searchQuery.trim().length < 2 || isLoading}
                  className="px-6 py-2 bg-medical-600 text-white font-semibold rounded-lg hover:bg-medical-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:ring-offset-2 focus:ring-offset-dark-800"
                >
                  Analyze
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barcode Scanner - Optional Feature */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowScanner(!showScanner)
              setAnalysisResult(null)
            }}
            className="w-full bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-4 shadow-glass hover:border-medical-500/50 hover:scale-[1.01] hover:shadow-neon transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-medical-500 focus:ring-offset-2 focus:ring-offset-dark-900"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                className="p-2 bg-medical-500/10 rounded-lg"
              >
                <ScanLine className="w-6 h-6 text-medical-400" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-100 mb-1">Barcode Scanner</h3>
                <p className="text-slate-400 text-sm">Scan medication barcode for AI-powered analysis</p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                {showScanner ? 'Hide' : 'Show'}
              </div>
            </div>
          </button>
        </div>

        {/* Scanner Component */}
        {showScanner && (
          <div className="mb-8">
            <SimpleBarcodeScanner
              onScanSuccess={handleBarcodeScan}
              isActive={showScanner}
              onClose={() => {
                setShowScanner(false)
                setAnalysisResult(null)
              }}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-8 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* AI Analysis Result */}
        {analysisResult && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-2 bg-gradient-to-br from-medical-500/20 to-safety-500/20 rounded-lg border border-medical-500/30"
                >
                  <Sparkles className="w-5 h-5 text-medical-400" />
                </motion.div>
                <h2 className="text-2xl font-display font-bold text-slate-100">Analysis Results</h2>
              </div>
              <button
                onClick={() => setAnalysisResult(null)}
                className="text-slate-400 hover:text-slate-200 hover:rotate-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-dark-800 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AIAnalysisResult
              analysis={analysisResult}
              onAddToHistory={handleAddToHistory}
            />
          </div>
        )}

            {/* Recent Medications */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-2 bg-safety-500/10 rounded-lg border border-safety-500/30"
                >
                  <TrendingUp className="w-5 h-5 text-safety-400" />
                </motion.div>
                <h2 className="text-2xl font-display font-bold text-slate-100">{t('dashboard.yourMedications')}</h2>
              </div>
          {isLoadingMedications ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : userMedications.length === 0 ? (
            <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-12 shadow-glass text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="flex justify-center mb-4"
              >
                <div className="p-4 bg-medical-500/10 rounded-full border border-medical-500/30">
                  <Pill className="w-12 h-12 text-medical-400" />
                </div>
              </motion.div>
              <p className="text-slate-400 text-lg mb-2">{t('dashboard.noMedications')}</p>
              <p className="text-slate-500 text-sm">Search for medications above to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userMedications.map((userMed) => (
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
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
