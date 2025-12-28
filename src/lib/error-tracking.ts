// Simple error tracking utility
// Perfect for graduation project - tracks errors and stores them in database

import { createClientComponentClient } from './supabase'

export interface ErrorLog {
  id: number
  user_id: string | null
  action_type: string
  resource_type: string | null
  resource_id: number | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorDetails {
  message: string
  error_type?: string
  severity?: ErrorSeverity
  stack?: string
  component?: string
  additional_info?: Record<string, any>
}

/**
 * Log an error to the database
 * Simple, straightforward error tracking
 */
export async function logError(
  error: Error | string,
  context?: {
    component?: string
    action?: string
    resourceType?: string
    resourceId?: number
    severity?: ErrorSeverity
    additionalInfo?: Record<string, any>
  }
): Promise<void> {
  try {
    const supabase = createClientComponentClient()
    
    // Get current user if available
    const { data: { user } } = await supabase.auth.getUser()
    
    // Prepare error details
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorType = typeof error === 'string' ? 'string' : error.constructor.name
    const stack = typeof error === 'string' ? undefined : error.stack
    
    const errorDetails: ErrorDetails = {
      message: errorMessage,
      error_type: errorType,
      severity: context?.severity || 'medium',
      stack: stack,
      component: context?.component,
      additional_info: context?.additionalInfo,
    }
    
    // Get user agent (simple, no external service needed)
    // Skip IP address to avoid external API calls on every error
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null
    
    // Insert error log
    const { error: insertError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user?.id || null,
        action_type: context?.action || 'error_occurred',
        resource_type: context?.resourceType || 'error',
        resource_id: context?.resourceId || null,
        details: errorDetails,
        ip_address: null, // Not tracked to keep it simple
        user_agent: userAgent,
      })
    
    if (insertError) {
      console.error('Failed to log error to database:', insertError)
    }
  } catch (loggingError) {
    // Don't throw - error logging should never break the app
    console.error('Failed to log error:', loggingError)
  }
}

/**
 * Get error logs for the current user
 */
export async function getErrorLogs(
  userId: string | null = null,
  limit: number = 50
): Promise<ErrorLog[]> {
  try {
    const supabase = createClientComponentClient()
    
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('action_type', 'error_occurred')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Failed to fetch error logs:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Failed to get error logs:', error)
    return []
  }
}

/**
 * Clear error logs (optional - for cleanup)
 */
export async function clearErrorLogs(userId: string): Promise<void> {
  try {
    const supabase = createClientComponentClient()
    
    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .eq('user_id', userId)
      .eq('action_type', 'error_occurred')
    
    if (error) {
      throw new Error(error.message)
    }
  } catch (error: any) {
    console.error('Failed to clear error logs:', error)
    throw error
  }
}

/**
 * Get error statistics
 */
export async function getErrorStats(userId?: string | null): Promise<{
  total: number
  by_severity: Record<ErrorSeverity, number>
  recent_count: number
}> {
  try {
    const logs = await getErrorLogs(userId || null, 1000)
    
    const stats = {
      total: logs.length,
      by_severity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      } as Record<ErrorSeverity, number>,
      recent_count: 0,
    }
    
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    
    logs.forEach((log) => {
      const details = log.details as ErrorDetails
      const severity = details.severity || 'medium'
      stats.by_severity[severity]++
      
      const logDate = new Date(log.created_at)
      if (logDate > oneDayAgo) {
        stats.recent_count++
      }
    })
    
    return stats
  } catch (error) {
    console.error('Failed to get error stats:', error)
    return {
      total: 0,
      by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
      recent_count: 0,
    }
  }
}

