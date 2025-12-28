'use client'

import { MedicationAnalysis } from '@/lib/ai-medication-analyzer'
import { CheckCircle, AlertTriangle, Info, Pill, DollarSign, Building2, MapPin, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface AIAnalysisResultProps {
  analysis: MedicationAnalysis
  onAddToHistory?: (medication: any) => void
}

export default function AIAnalysisResult({ analysis, onAddToHistory }: AIAnalysisResultProps) {
  const getPrescriptionColor = (type: string) => {
    switch (type) {
      case 'Yeşil':
        return 'text-green-400'
      case 'Kırmızı':
        return 'text-red-400'
      case 'Mor':
        return 'text-purple-400'
      case 'Turuncu':
        return 'text-orange-400'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Scanned Medication Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass hover:border-medical-500/50 hover:shadow-neon transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="p-2 bg-medical-500/10 rounded-lg border border-medical-500/30"
          >
            <Pill className="w-5 h-5 text-medical-400" />
          </motion.div>
          <h3 className="text-xl font-display font-bold text-slate-100">
            Scanned Medication
          </h3>
        </div>
        <div className="space-y-2">
          <p className="text-slate-200">
            <span className="font-semibold">Name:</span> {analysis.scanned_medication.name}
          </p>
          <p className="text-slate-200">
            <span className="font-semibold">Barcode:</span> {analysis.scanned_medication.barcode}
          </p>
          {analysis.scanned_medication.active_ingredients.length > 0 && (
            <div>
              <p className="font-semibold text-slate-200 mb-1">Active Ingredients:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {analysis.scanned_medication.active_ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Exact Matches */}
      {analysis.turkish_equivalents.exact_matches.length > 0 && (
        <div className="bg-dark-800/40 backdrop-blur-xl border border-medical-500/50 rounded-xl p-6 shadow-glass">
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <CheckCircle className="w-5 h-5 text-medical-400" />
            </motion.div>
            <h3 className="text-xl font-display font-bold text-slate-100">
              Exact Matches ({analysis.turkish_equivalents.exact_matches.length})
            </h3>
          </div>
          <div className="space-y-4">
            {analysis.turkish_equivalents.exact_matches.map((match, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="bg-dark-700/50 rounded-lg p-4 border border-dark-600/50 hover:border-medical-500/50 hover:shadow-neon transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-100">
                      {match.medication.ticari_adi}
                    </h4>
                    <p className="text-slate-400 text-sm">{match.medication.etken_madde}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPrescriptionColor(match.medication.recete_tipi)} bg-dark-600/50`}>
                    {match.medication.recete_tipi}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-medical-400" />
                    <div>
                      <p className="text-slate-400 text-sm">SGK Price</p>
                      <p className="text-medical-400 font-semibold">
                        ₺{match.medication.fiyat_sgk.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-safety-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Pharmacy Price</p>
                      <p className="text-safety-400 font-semibold">
                        ₺{match.medication.fiyat_eczane.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Manufacturer</p>
                    <p className="text-slate-300">{match.medication.firma}</p>
                  </div>
                </div>
                {match.medication.bulunabilirlik.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-400 text-sm">Availability</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {match.medication.bulunabilirlik.map((pharmacy, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-1 bg-dark-600/50 rounded text-xs text-slate-300 flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          {pharmacy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-600/50">
                  <span className="text-sm text-slate-400">
                    Similarity: {(match.similarity_score * 100).toFixed(0)}%
                  </span>
                  {onAddToHistory && (
                    <button
                      onClick={() => onAddToHistory(match.medication)}
                      className="bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-4 py-2 rounded-lg hover:shadow-neon-lg hover:scale-105 active:scale-95 transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 focus:ring-offset-2 focus:ring-offset-dark-700 animate-pulse-once"
                    >
                      Add to History
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Formulations */}
      {analysis.turkish_equivalents.similar_formulations.length > 0 && (
        <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Info className="w-5 h-5 text-safety-400" />
            </motion.div>
            <h3 className="text-xl font-display font-bold text-slate-100">
              Similar Formulations ({analysis.turkish_equivalents.similar_formulations.length})
            </h3>
          </div>
          <div className="space-y-4">
            {analysis.turkish_equivalents.similar_formulations.map((match, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="bg-dark-700/50 rounded-lg p-4 border border-dark-600/50 hover:border-safety-500/50 hover:shadow-safety transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-100">
                      {match.medication.ticari_adi}
                    </h4>
                    <p className="text-slate-400 text-sm">{match.medication.etken_madde}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPrescriptionColor(match.medication.recete_tipi)} bg-dark-600/50`}>
                    {match.medication.recete_tipi}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-slate-400 text-sm">SGK Price</p>
                    <p className="text-medical-400 font-semibold">
                      ₺{match.medication.fiyat_sgk.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Pharmacy Price</p>
                    <p className="text-safety-400 font-semibold">
                      ₺{match.medication.fiyat_eczane.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-600/50">
                  <span className="text-sm text-slate-400">
                    Similarity: {(match.similarity_score * 100).toFixed(0)}%
                  </span>
                  {onAddToHistory && (
                    <button
                      onClick={() => onAddToHistory(match.medication)}
                      className="bg-dark-700 text-slate-100 border border-dark-600 font-semibold px-4 py-2 rounded-lg hover:bg-dark-600 hover:border-safety-500 hover:scale-105 active:scale-95 transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-safety-500 focus:ring-offset-2 focus:ring-offset-dark-700"
                    >
                      Add to History
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Matches */}
      {analysis.turkish_equivalents.exact_matches.length === 0 &&
        analysis.turkish_equivalents.similar_formulations.length === 0 && (
          <div className="bg-dark-800/40 backdrop-blur-xl border border-safety-500/50 rounded-xl p-6 shadow-glass text-center">
            <AlertTriangle className="w-12 h-12 text-safety-400 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-slate-100 mb-2">
              No Turkish Equivalents Found
            </h3>
            <p className="text-slate-400">
              We couldn't find any Turkish equivalents for this medication. Please consult with a healthcare professional.
            </p>
          </div>
        )}
    </div>
  )
}

