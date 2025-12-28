'use client'

import { useState, useEffect } from 'react'
import { Camera, AlertCircle, CheckCircle } from 'lucide-react'

export default function CameraPermissionHelper() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking')

  useEffect(() => {
    checkPermission()
  }, [])

  const checkPermission = async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
        setPermission(result.state as 'granted' | 'denied' | 'prompt')
        
        result.onchange = () => {
          setPermission(result.state as 'granted' | 'denied' | 'prompt')
        }
      } else {
        // Fallback: try to access camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        setPermission('granted')
      }
    } catch (err) {
      setPermission('denied')
    }
  }

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setPermission('granted')
    } catch (err) {
      setPermission('denied')
    }
  }

  if (permission === 'checking') {
    return (
      <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
        <div className="flex items-center gap-3 text-slate-300">
          <Camera className="w-5 h-5 animate-pulse" />
          <span>Checking camera permission...</span>
        </div>
      </div>
    )
  }

  if (permission === 'granted') {
    return (
      <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
        <div className="flex items-center gap-3 text-medical-400">
          <CheckCircle className="w-5 h-5" />
          <span>Camera permission granted</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-safety-400 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="text-slate-200 font-medium">Camera permission required</p>
          <p className="text-slate-400 text-sm">
            Please enable camera access in your browser settings to scan barcodes.
          </p>
          <button
            onClick={requestPermission}
            className="mt-2 bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-4 py-2 rounded-lg hover:shadow-neon-lg hover:scale-105 transition-all duration-300 text-sm"
          >
            Request Permission
          </button>
        </div>
      </div>
    </div>
  )
}

