'use client'

import { Medication } from '@/lib/medications'
import { Trash2, Info, Pill, Package, FlaskConical } from 'lucide-react'
import { motion } from 'framer-motion'

interface MedicationCardProps {
  medication: Medication
  onViewDetails?: () => void
  onRemove?: () => void
}

export default function MedicationCard({ medication, onViewDetails, onRemove }: MedicationCardProps) {
  // Determine icon based on dosage form
  const getMedicationIcon = () => {
    if (medication.dosage_form) {
      const form = medication.dosage_form.toLowerCase()
      if (form.includes('tablet') || form.includes('pill')) return Pill
      if (form.includes('capsule')) return Package
      if (form.includes('syrup') || form.includes('liquid')) return FlaskConical
    }
    return Pill // Default icon
  }

  const IconComponent = getMedicationIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass hover:border-medical-500/50 hover:shadow-neon transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="p-2 bg-gradient-to-br from-medical-500/20 to-safety-500/20 rounded-lg border border-medical-500/30"
          >
            <IconComponent className="w-6 h-6 text-medical-400" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100 mb-1">
              {medication.name}
            </h3>
            {medication.manufacturer && (
              <p className="text-slate-400 text-sm">{medication.manufacturer}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="p-2 text-slate-400 hover:text-medical-400 transition-all duration-300 hover:rotate-12 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:ring-offset-2 focus:ring-offset-dark-800 rounded-lg"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-2 text-slate-400 hover:text-safety-400 transition-all duration-300 hover:rotate-12 focus:outline-none focus:ring-2 focus:ring-safety-500 focus:ring-offset-2 focus:ring-offset-dark-800 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {medication.strength && (
        <p className="text-slate-300 text-sm mb-2">
          <span className="font-semibold">Strength:</span> {medication.strength}
        </p>
      )}

      {medication.dosage_form && (
        <p className="text-slate-300 text-sm mb-2">
          <span className="font-semibold">Form:</span> {medication.dosage_form}
        </p>
      )}

      {medication.barcode && (
        <p className="text-slate-400 text-xs">
          Barcode: {medication.barcode}
        </p>
      )}
    </motion.div>
  )
}

