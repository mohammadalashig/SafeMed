/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter. For production, consider upgrading to
 * Redis-based solution (Upstash, Vercel KV) for distributed systems.
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  identifier: string // Unique identifier (user ID, IP, etc.)
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
  error?: string
}

// In-memory store (clears on server restart)
// In production, use Redis or similar
const requestStore = new Map<string, { count: number; resetAt: number }>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requestStore.entries()) {
    if (value.resetAt < now) {
      requestStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Reset rate limit store (for testing purposes only)
 */
export function resetRateLimitStore() {
  requestStore.clear()
}

export async function rateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { windowMs, maxRequests, identifier } = config
  const now = Date.now()
  const key = identifier
  const resetAt = now + windowMs

  // Get current entry or create new one
  let entry = requestStore.get(key)

  // If entry doesn't exist or has expired, create new one
  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt }
    requestStore.set(key, entry)
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt,
    }
  }

  // Entry exists and is still valid
  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      error: `Rate limit exceeded. Try again after ${new Date(entry.resetAt).toISOString()}`,
    }
  }

  // Increment count
  entry.count++
  requestStore.set(key, entry)

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Get user identifier from request
 * Prioritizes authenticated user ID, falls back to IP address
 */
export function getUserIdentifier(request: Request): string {
  // Try to get user ID from headers (we'll set this in middleware)
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `ip:${ip}`
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // AI analysis is expensive, limit heavily
  AI_ANALYSIS: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour
  },
  // General API requests
  API_REQUEST: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  // Authentication attempts
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
} as const

