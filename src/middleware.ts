import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not set, skipping auth checks')
      return supabaseResponse
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // If there's an auth error, just continue without blocking
    if (authError) {
      console.warn('Auth error in middleware:', authError.message)
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/history') && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/schedule') && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/settings') && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Redirect authenticated users away from auth pages (except reset-password which needs auth)
    // Also exclude the confirm endpoint as it handles token exchange
    const authPath = request.nextUrl.pathname
    if (
      authPath.startsWith('/auth') && 
      user && 
      !authPath.startsWith('/auth/reset-password') &&
      !authPath.startsWith('/auth/confirm')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add user ID to headers for API routes (for rate limiting)
    if (request.nextUrl.pathname.startsWith('/api') && user) {
      supabaseResponse.headers.set('x-user-id', user.id)
    }
  } catch (error) {
    // If middleware fails, log error but don't block the request
    console.error('Middleware error:', error)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

