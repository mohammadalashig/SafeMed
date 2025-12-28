'use client'

import { Medication } from '@/lib/medications'
import { X, AlertTriangle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface MedicationResultProps {
  medication: Medication
  onClose: () => void
  onAddToHistory?: () => void
}

export default function MedicationResult({ medication, onClose, onAddToHistory }: MedicationResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-dark-800/95 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-100">
            {medication.name}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {medication.manufacturer && (
            <div>
              <p className="text-sm text-slate-400 mb-1">Manufacturer</p>
              <p className="text-slate-200">{medication.manufacturer}</p>
            </div>
          )}

          {medication.strength && (
            <div>
              <p className="text-sm text-slate-400 mb-1">Strength</p>
              <p className="text-slate-200">{medication.strength}</p>
            </div>
          )}

          {medication.dosage_form && (
            <div>
              <p className="text-sm text-slate-400 mb-1">Dosage Form</p>
              <p className="text-slate-200">{medication.dosage_form}</p>
            </div>
          )}

          {medication.description && (
            <div>
              <p className="text-sm text-slate-400 mb-1">Description</p>
              <p className="text-slate-200">{medication.description}</p>
            </div>
          )}

          {medication.active_ingredients && Array.isArray(medication.active_ingredients) && medication.active_ingredients.length > 0 && (
            <div>
              <p className="text-sm text-slate-400 mb-2">Active Ingredients</p>
              <ul className="list-disc list-inside text-slate-200 space-y-1">
                {medication.active_ingredients.map((ingredient: string, idx: number) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {medication.barcode && (
            <div>
              <p className="text-sm text-slate-400 mb-1">Barcode</p>
              <p className="text-slate-200 font-mono">{medication.barcode}</p>
            </div>
          )}
        </div>

        {onAddToHistory && (
          <div className="mt-6 pt-6 border-t border-dark-600/50">
            <button
              onClick={onAddToHistory}
              className="w-full bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-300"
            >
              Add to Medication History
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

