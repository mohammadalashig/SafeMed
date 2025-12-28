'use client'

import { useState } from 'react'
import { Keyboard } from 'lucide-react'

interface ManualBarcodeEntryProps {
  onEnter: (barcode: string) => void
  onClose?: () => void
}

export default function ManualBarcodeEntry({ onEnter, onClose }: ManualBarcodeEntryProps) {
  const [barcode, setBarcode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcode.trim()) {
      onEnter(barcode.trim())
      setBarcode('')
    }
  }

  return (
    <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-medical-400" />
          <h3 className="text-xl font-display font-bold text-slate-100">Manual Entry</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-slate-200 mb-2">
            Enter Barcode or Medication Name
          </label>
          <input
            id="barcode"
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="w-full bg-dark-800/50 border border-dark-600 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 placeholder:text-slate-500 transition-all"
            placeholder="Enter barcode (e.g., 6168686102549) or medication name (e.g., Panadol)"
            autoFocus
          />
          <p className="text-xs text-slate-500 mt-2">
            You can enter a barcode number or medication name for AI analysis
          </p>
        </div>

        <button
          type="submit"
          disabled={!barcode.trim()}
          className="w-full bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Look Up Medication
        </button>
      </form>
    </div>
  )
}

