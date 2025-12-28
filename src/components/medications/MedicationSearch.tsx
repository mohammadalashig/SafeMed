'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Loader2, Pill } from 'lucide-react'
import { searchMedicationsByName, type Medication } from '@/lib/medications'
import { useDebounce } from '@/hooks/useDebounce'
import MedicationCard from './MedicationCard'

interface MedicationSearchProps {
  onSelectMedication?: (medication: Medication) => void
  onSearchResult?: (results: Medication[]) => void
}

export default function MedicationSearch({ onSelectMedication, onSearchResult }: MedicationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Medication[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setHasSearched(false)
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    
    try {
      const searchResults = await searchMedicationsByName(query, 10)
      setResults(searchResults)
      setShowResults(true)
      
      if (onSearchResult) {
        onSearchResult(searchResults)
      }
    } catch (error: any) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [onSearchResult])

  // Trigger search when debounced query changes
  useEffect(() => {
    performSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, performSearch])

  const handleSelect = (medication: Medication) => {
    if (onSelectMedication) {
      onSelectMedication(medication)
    }
    setSearchQuery('')
    setShowResults(false)
  }

  const handleClear = () => {
    setSearchQuery('')
    setResults([])
    setHasSearched(false)
    setShowResults(false)
  }

  return (
    <div className="w-full relative" style={{ zIndex: 1000 }}>
      <div className="relative" style={{ zIndex: 1000 }}>
        <div className="relative" style={{ zIndex: 1000 }}>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications by name (e.g., Aspirin, Paracetamol)..."
            className="w-full bg-dark-700/50 border border-dark-600 rounded-xl pl-12 pr-12 py-4 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all"
            onFocus={() => {
              if (results.length > 0) {
                setShowResults(true)
              }
            }}
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-medical-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results - Highest z-index to appear above all content including history cards */}
        {showResults && (
          <div className="absolute w-full mt-2 bg-dark-800/98 backdrop-blur-xl border border-dark-600 rounded-xl shadow-2xl max-h-96 overflow-y-auto" style={{ zIndex: 99999, position: 'absolute', top: '100%', left: 0, right: 0 }}>
            {isSearching ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-medical-400 animate-spin mx-auto mb-2" />
                <p className="text-slate-400">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Found {results.length} medication{results.length !== 1 ? 's' : ''}
                </div>
                <div className="space-y-1">
                  {results.map((medication) => (
                    <button
                      key={medication.id}
                      onClick={() => handleSelect(medication)}
                      className="w-full text-left p-3 rounded-lg hover:bg-dark-700/50 transition-colors border border-transparent hover:border-medical-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-medical-500/10 rounded-lg">
                          <Pill className="w-5 h-5 text-medical-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-100 truncate">{medication.name}</h4>
                          {medication.manufacturer && (
                            <p className="text-sm text-slate-400 truncate">{medication.manufacturer}</p>
                          )}
                          {medication.strength && (
                            <p className="text-xs text-slate-500 mt-1">Strength: {medication.strength}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : hasSearched ? (
              <div className="p-8 text-center">
                <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-1">No medications found</p>
                <p className="text-xs text-slate-500">
                  Try searching with a different name or use AI analysis
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

