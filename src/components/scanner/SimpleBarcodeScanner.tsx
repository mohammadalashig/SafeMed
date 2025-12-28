'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, X, AlertCircle, RotateCcw, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettings } from '@/contexts/SettingsContext'

// Types for Html5Qrcode
type Html5QrcodeType = {
  new (elementId: string): {
    start: (
      cameraId: string,
      config: any,
      onScanSuccess: (decodedText: string) => void,
      onScanFailure?: (errorMessage: string) => void
    ) => Promise<void>
    stop: () => Promise<void>
    clear: () => Promise<void>
    getState: () => number
  }
  getCameras: () => Promise<Array<{ id: string; label: string }>>
}

interface SimpleBarcodeScannerProps {
  onScanSuccess: (barcode: string) => void
  onScanError?: (error: string) => void
  isActive: boolean
  onClose?: () => void
}

export default function SimpleBarcodeScanner({ 
  onScanSuccess, 
  onScanError,
  isActive,
  onClose
}: SimpleBarcodeScannerProps) {
  const { settings, isLoading: settingsLoading } = useSettings()
  // Use default settings if still loading
  const scannerSettings = settingsLoading ? {
    camera_preference: 'environment' as const,
    scan_sound: true,
    scan_vibration: true,
    auto_scan: false,
  } : settings

  const html5QrcodeRef = useRef<any>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [scanCount, setScanCount] = useState(0)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>(
    scannerSettings.camera_preference === 'user' ? 'user' : 'environment'
  )
  const [mounted, setMounted] = useState(false)
  const [crashCount, setCrashCount] = useState(0)
  const [Html5Qrcode, setHtml5Qrcode] = useState<Html5QrcodeType | null>(null)

  // Load Html5Qrcode library
  useEffect(() => {
    import('html5-qrcode').then((module) => {
      setHtml5Qrcode(() => module.Html5Qrcode as unknown as Html5QrcodeType)
    }).catch(err => {
      console.error('Failed to load html5-qrcode:', err)
      setError('Scanner library not loaded. Please refresh the page.')
      toast.error('Scanner library not available')
    })
  }, [])

  // Mount effect
  useEffect(() => {
    setMounted(true)
    checkCameraPermission()
    return () => {
      setMounted(false)
      cleanupScanner()
    }
  }, [])

  // Active state effect
  useEffect(() => {
    if (isActive && hasPermission === true && mounted && Html5Qrcode) {
      // Set isScanning to true first so the element renders
      setIsScanning(true)
      
      const timer = setTimeout(async () => {
        if (!Html5Qrcode || !mounted) return
        
        let camId = selectedCameraId
        if (!camId) {
          try {
            const devices = await Html5Qrcode.getCameras()
            if (devices && devices.length) {
              setAvailableCameras(devices)
              const rearCamera = devices.find(device => 
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('rear') ||
                device.label.toLowerCase().includes('environment')
              ) || devices[0]
              camId = rearCamera.id
              setSelectedCameraId(camId)
            }
          } catch (err) {
            setError('Failed to access cameras')
            setIsScanning(false)
            return
          }
        }
        
        if (camId && mounted) {
          // Wait a bit more for DOM to be ready
          await new Promise(resolve => setTimeout(resolve, 100))
          startScanning(camId)
        }
      }, 500) // Reduced delay since we're setting isScanning immediately
      return () => clearTimeout(timer)
    } else if (!isActive || hasPermission === false) {
      cleanupScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, hasPermission, mounted, Html5Qrcode])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
    } catch (err: any) {
      setHasPermission(false)
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please enable camera access in your browser settings.'
        : err.name === 'NotFoundError'
        ? 'No camera found. Please connect a camera device.'
        : 'Camera access error. Please check your camera settings.'
      setError(errorMsg)
    }
  }

  const cleanupScanner = useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        // Get state before stopping (might throw if already cleaned up)
        let state = 0
        try {
          state = html5QrcodeRef.current.getState()
        } catch (e) {
          // Already cleaned up, just clear the ref
          html5QrcodeRef.current = null
          setIsScanning(false)
          setScanCount(0)
          return
        }

        // Stop scanner if it's scanning
        if (state === 2) { // SCANNING state
          try {
            await html5QrcodeRef.current.stop()
          } catch (stopErr: any) {
            // Ignore stop errors - scanner might already be stopped
            console.debug('Stop error (ignored):', stopErr)
          }
        }

        // Clear the scanner (this might throw if DOM nodes are already removed)
        try {
          html5QrcodeRef.current.clear()
        } catch (clearErr: any) {
          // Ignore clear errors - DOM might already be cleaned up
          // This is the "removeChild" error we're catching
          console.debug('Clear error (ignored):', clearErr)
        }
      } catch (err: any) {
        // Catch any other errors
        console.debug('Cleanup error (ignored):', err)
      } finally {
        // Always clear the DOM element manually as fallback
        try {
          const element = elementRef.current || document.getElementById('barcode-scanner')
          if (element) {
            // Remove all child nodes safely
            while (element.firstChild) {
              element.removeChild(element.firstChild)
            }
          }
        } catch (domErr) {
          // Ignore DOM errors
          console.debug('DOM cleanup error (ignored):', domErr)
        }
      }
    }
    html5QrcodeRef.current = null
    setIsScanning(false)
    setScanCount(0)
  }, [])

  const getCameras = useCallback(async (): Promise<string | null> => {
    if (!Html5Qrcode) return null
    
    try {
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length) {
        setAvailableCameras(devices)
        // Prefer 'environment' (back) camera
        const rearCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        ) || devices[0]
        setSelectedCameraId(rearCamera.id)
        return rearCamera.id
      }
      return null
    } catch (err) {
      setError('Failed to access cameras')
      return null
    }
  }, [Html5Qrcode])

  const startScanning = useCallback(async (cameraId: string) => {
    if (!Html5Qrcode || !mounted) return

    // Wait for element to be in DOM with retries
    let element = elementRef.current || document.getElementById('barcode-scanner')
    let attempts = 0
    while (!element && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 50))
      element = elementRef.current || document.getElementById('barcode-scanner')
      attempts++
    }

    if (!element) {
      setError('Scanner container element not found. Please try again.')
      setIsScanning(false)
      return
    }

    try {
      setError(null)
      setIsScanning(true)

      // Cleanup existing scanner
      if (html5QrcodeRef.current) {
        try {
          let state = 0
          try {
            state = html5QrcodeRef.current.getState()
          } catch (e) {
            // Already cleaned up
          }

          if (state === 2) {
            try {
              await html5QrcodeRef.current.stop()
            } catch (stopErr) {
              // Ignore stop errors
              console.debug('Stop error during restart (ignored):', stopErr)
            }
          }

          try {
            html5QrcodeRef.current.clear()
          } catch (clearErr) {
            // Ignore clear errors (removeChild errors)
            console.debug('Clear error during restart (ignored):', clearErr)
          }
        } catch (err) {
          // Ignore all cleanup errors
          console.debug('Cleanup error during restart (ignored):', err)
        } finally {
          // Always manually clear the element
          try {
            if (elementRef.current) {
              while (elementRef.current.firstChild) {
                elementRef.current.removeChild(elementRef.current.firstChild)
              }
            }
          } catch (domErr) {
            // Ignore DOM errors
            console.debug('DOM cleanup error (ignored):', domErr)
          }
        }
      }
      html5QrcodeRef.current = null

      // Clear element safely
      try {
        while (element.firstChild) {
          element.removeChild(element.firstChild)
        }
      } catch (domErr) {
        // Fallback to innerHTML if removeChild fails
        try {
          element.innerHTML = ''
        } catch (innerErr) {
          // Last resort - just log
          console.debug('Element clear error (ignored):', innerErr)
        }
      }

      // Create new Html5Qrcode instance
      const scanner = new Html5Qrcode('barcode-scanner')
      html5QrcodeRef.current = scanner

      const config: any = {
        fps: 10,
        qrbox: (width: number, height: number) => {
          const minDimension = Math.min(width, height)
          const size = Math.floor(minDimension * 0.7)
          return { width: Math.min(size, 300), height: Math.min(size / 2, 150) }
        },
        aspectRatio: 1.777778,
        disableFlip: false,
        videoConstraints: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      }

      await scanner.start(
        cameraId,
        config,
        (decodedText: string) => {
          // Success callback - scanner continues (doesn't stop)
          setScanCount(prev => prev + 1)
          
          // Haptic feedback
          if (scannerSettings.scan_vibration && 'vibrate' in navigator) {
            navigator.vibrate(200)
          }

          // Play sound if enabled
          if (scannerSettings.scan_sound) {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTQ8OUKjj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUqgc7y2Yk2CBtpvfDknU0PDlCo4/C2YxwGOJHX8sx5LAUkd8fw3ZBACg==')
            audio.play().catch(() => {})
          }

          toast.success('Barcode scanned successfully!')
          onScanSuccess(decodedText)
        },
        (errorMessage: string) => {
          // Error callback - filters non-critical errors
          if (errorMessage && 
              !errorMessage.includes('NotFoundException') && 
              !errorMessage.includes('No MultiFormat Readers')) {
            console.warn('Scan error:', errorMessage)
          }
        }
      )
    } catch (err: any) {
      console.error('Scanner initialization error:', err)
      setCrashCount(prev => prev + 1)
      const errorMsg = err.message || 'Failed to start scanner. Please try again.'
      setError(errorMsg)
      setIsScanning(false)
      
      if (crashCount >= 3) {
        toast.error('Scanner repeatedly failed. Please refresh the page.')
      } else {
        toast.error(errorMsg)
      }
      
      if (onScanError) {
        onScanError(errorMsg)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Html5Qrcode, mounted, cameraFacing, scannerSettings, onScanSuccess, onScanError])

  const switchCamera = useCallback(async () => {
    if (!mounted || !Html5Qrcode) return

    try {
      await cleanupScanner()
      setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment')
      
      if (Html5Qrcode) {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length) {
          setAvailableCameras(devices)
          const rearCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          ) || devices[0]
          const camId = rearCamera.id
          setSelectedCameraId(camId)
          
          if (camId && mounted) {
            await startScanning(camId)
            toast.success('Camera switched')
          }
        }
      }
    } catch (err: any) {
      console.error('Error switching camera:', err)
      toast.error('Failed to switch camera')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, Html5Qrcode, cleanupScanner])

  const restartScanner = useCallback(async () => {
    if (!mounted || !Html5Qrcode) return

    try {
      await cleanupScanner()
      setError(null)
      setCrashCount(0)
      
      if (Html5Qrcode) {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length) {
          setAvailableCameras(devices)
          const rearCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          ) || devices[0]
          const camId = rearCamera.id
          setSelectedCameraId(camId)
          
          if (camId && mounted) {
            await startScanning(camId)
          }
        }
      }
    } catch (err: any) {
      console.error('Error restarting scanner:', err)
      toast.error('Failed to restart scanner')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, Html5Qrcode, cleanupScanner])

  if (hasPermission === false) {
    return (
      <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-safety-400 mx-auto" />
          <h3 className="text-xl font-display font-bold text-slate-100">
            Camera Permission Required
          </h3>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={checkCameraPermission}
            className="bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
      <div className="mb-4 p-3 bg-safety-900/20 border border-safety-600/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-safety-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-safety-400 text-sm font-semibold">Limited Accuracy</p>
            <p className="text-slate-400 text-xs mt-1">
              Barcode scanning may not recognize all medications. For better results, use the medication name search instead.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold text-slate-100">Scan Barcode</h3>
        <div className="flex items-center gap-4">
          {scanCount > 0 && (
            <span className="text-sm text-slate-400">Scans: {scanCount}</span>
          )}
          {onClose && (
            <button
              onClick={async () => {
                try {
                  await cleanupScanner()
                  onClose()
                } catch (err) {
                  console.error('Error closing scanner:', err)
                  onClose() // Close anyway
                }
              }}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2"
              title="Close scanner"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Always render container when active, even if not scanning yet */}
      {(isActive || isScanning) ? (
        <div className="space-y-4">
          <div 
            id="barcode-scanner" 
            ref={elementRef}
            className="w-full min-h-[300px] flex items-center justify-center bg-dark-900/50 rounded-lg"
          >
            {!isScanning && (
              <div className="text-center space-y-4">
                <Camera className="w-16 h-16 text-medical-400 mx-auto animate-pulse" />
                <p className="text-slate-400">Initializing scanner...</p>
              </div>
            )}
          </div>
          
          {isScanning && (
            <div className="flex gap-2">
              <button
                onClick={switchCamera}
                className="flex-1 bg-dark-700 text-slate-100 border border-dark-600 font-semibold px-4 py-2 rounded-xl hover:bg-dark-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Switch Camera
              </button>
              <button
                onClick={async () => {
                  try {
                    await cleanupScanner()
                    if (onClose) {
                      onClose()
                    }
                  } catch (err) {
                    console.error('Error stopping scanner:', err)
                    if (onClose) {
                      onClose() // Close anyway even if cleanup fails
                    }
                  }
                }}
                className="flex-1 bg-dark-700 text-slate-100 border border-dark-600 font-semibold px-4 py-2 rounded-xl hover:bg-dark-600 transition-all duration-300"
              >
                Stop Scanner
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <Camera className="w-16 h-16 text-medical-400 mx-auto" />
          <p className="text-slate-400">Scanner is inactive</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-dark-700/50 border border-safety-600/50 rounded-lg">
          <p className="text-safety-400 text-sm mb-2">{error}</p>
          <p className="text-slate-400 text-xs">
            If the scanner doesn't work, close it and use the medication name search instead.
          </p>
        </div>
      )}
    </div>
  )
}
