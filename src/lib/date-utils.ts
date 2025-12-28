// Date and time formatting utilities with timezone support

export function formatDate(date: string | Date, timezone: string = 'UTC', language: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  try {
    return new Intl.DateTimeFormat(language, {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj)
  } catch (error) {
    // Fallback to simple format if timezone is invalid
    return dateObj.toLocaleDateString(language)
  }
}

export function formatDateTime(date: string | Date, timezone: string = 'UTC', language: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  try {
    return new Intl.DateTimeFormat(language, {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  } catch (error) {
    // Fallback to simple format if timezone is invalid
    return dateObj.toLocaleString(language)
  }
}

export function formatTime(date: string | Date, timezone: string = 'UTC', language: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  try {
    return new Intl.DateTimeFormat(language, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(dateObj)
  } catch (error) {
    // Fallback to simple format if timezone is invalid
    return dateObj.toLocaleTimeString(language)
  }
}

export function formatRelativeTime(date: string | Date, timezone: string = 'UTC', language: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  // Convert both to the target timezone for comparison
  const dateInTz = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }))
  const nowInTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  
  const diffMs = nowInTz.getTime() - dateInTz.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
  
  if (Math.abs(diffDays) > 7) {
    return formatDate(dateObj, timezone, language)
  } else if (Math.abs(diffDays) > 0) {
    return rtf.format(-diffDays, 'day')
  } else if (Math.abs(diffHours) > 0) {
    return rtf.format(-diffHours, 'hour')
  } else if (Math.abs(diffMinutes) > 0) {
    return rtf.format(-diffMinutes, 'minute')
  } else {
    return rtf.format(-diffSeconds, 'second')
  }
}

export function getCurrentTimeInTimezone(timezone: string = 'UTC'): Date {
  const now = new Date()
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const targetTime = new Date(utc + (getTimezoneOffset(timezone) * 60000))
  return targetTime
}

function getTimezoneOffset(timezone: string): number {
  // Get timezone offset in minutes
  const now = new Date()
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
  const target = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  return (target.getTime() - utc.getTime()) / 60000
}

