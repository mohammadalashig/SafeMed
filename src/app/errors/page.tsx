'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCurrentUser } from '@/lib/auth'
import { getErrorLogs, getErrorStats, type ErrorLog, type ErrorDetails } from '@/lib/error-tracking'
import { AlertTriangle, Trash2, RefreshCw, Info, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ErrorsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadErrorLogs()
      loadStats()
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

  const loadErrorLogs = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const logs = await getErrorLogs(user.id, 50)
      setErrorLogs(logs)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load error logs')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    if (!user) return
    try {
      const errorStats = await getErrorStats(user.id)
      setStats(errorStats)
    } catch (error: any) {
      console.error('Failed to load error stats:', error)
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'high':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
            Error Logs
          </h1>
          <p className="text-slate-400">View and track errors that occurred in the application</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-safety-400" />
                <h3 className="text-sm font-semibold text-slate-400">Total Errors</h3>
              </div>
              <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
            </div>
            <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-semibold text-slate-400">Critical</h3>
              </div>
              <p className="text-2xl font-bold text-red-400">{stats.by_severity.critical}</p>
            </div>
            <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-semibold text-slate-400">High</h3>
              </div>
              <p className="text-2xl font-bold text-orange-400">{stats.by_severity.high}</p>
            </div>
            <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass">
              <div className="flex items-center gap-3 mb-2">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-400">Last 24h</h3>
              </div>
              <p className="text-2xl font-bold text-blue-400">{stats.recent_count}</p>
            </div>
          </div>
        )}

        {/* Error Logs */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : errorLogs.length === 0 ? (
          <div className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-12 shadow-glass text-center">
            <AlertTriangle className="w-16 h-16 text-medical-400 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-slate-100 mb-2">
              No Errors Found
            </h2>
            <p className="text-slate-400">
              Your application is running smoothly! No errors have been logged.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-slate-100">Recent Errors</h2>
              <button
                onClick={loadErrorLogs}
                className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {errorLogs.map((log) => {
              const details = log.details as ErrorDetails
              const severity = details.severity || 'medium'
              
              return (
                <div
                  key={log.id}
                  className="bg-dark-800/40 backdrop-blur-xl border border-dark-600/50 rounded-xl p-6 shadow-glass"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-5 h-5 text-safety-400`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-slate-100">
                            {details.message || 'Unknown Error'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded border ${getSeverityColor(severity)}`}>
                            {severity.toUpperCase()}
                          </span>
                        </div>
                        {details.component && (
                          <p className="text-sm text-slate-400">
                            Component: {details.component}
                          </p>
                        )}
                        {details.error_type && (
                          <p className="text-sm text-slate-400">
                            Type: {details.error_type}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDate(log.created_at)}
                    </span>
                  </div>

                  {details.stack && (
                    <details className="mt-4">
                      <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                        View Stack Trace
                      </summary>
                      <pre className="mt-2 p-4 bg-dark-900/50 rounded-lg text-xs text-slate-300 overflow-x-auto">
                        {details.stack}
                      </pre>
                    </details>
                  )}

                  {details.additional_info && Object.keys(details.additional_info).length > 0 && (
                    <details className="mt-4">
                      <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                        View Additional Info
                      </summary>
                      <pre className="mt-2 p-4 bg-dark-900/50 rounded-lg text-xs text-slate-300 overflow-x-auto">
                        {JSON.stringify(details.additional_info, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

