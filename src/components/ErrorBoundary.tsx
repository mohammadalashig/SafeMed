'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  async componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Log error to database for tracking
    try {
      const { logError } = await import('@/lib/error-tracking')
      await logError(error, {
        component: 'ErrorBoundary',
        action: 'error_boundary_caught',
        resourceType: 'react_component',
        severity: 'high',
        additionalInfo: {
          componentStack: errorInfo?.componentStack,
          errorInfo: errorInfo,
        },
      })
    } catch (loggingError) {
      // Don't break error boundary if logging fails
      console.error('Failed to log error:', loggingError)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-8 shadow-glass max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-safety-400 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-slate-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
              className="bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

