/**
 * API Route Helpers
 * Utilities for Next.js API routes
 */

import { NextRequest } from 'next/server'
import { createClient } from './supabase-server'

/**
 * Get authenticated user from API request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

