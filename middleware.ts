import { NextRequest, NextResponse } from 'next/server'
import { getSessionByToken } from '@/lib/db'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/session',
  '/auth/login',
  '/login',
]

// Routes that require API authentication
const PROTECTED_API_ROUTES = /^\/api\//

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is public
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if it's a protected API route
  if (PROTECTED_API_ROUTES.test(pathname)) {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[v0] Middleware: Missing or invalid Authorization header for', pathname)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7) // Remove 'Bearer ' prefix

    try {
      // Validate token against sessions table
      const session = await getSessionByToken(token)
      
      if (!session || !session.rows[0]) {
        console.log('[v0] Middleware: Invalid token for', pathname)
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Token is valid, continue to next middleware/route
      console.log('[v0] Middleware: Valid session for user', session.rows[0].user_id)
      return NextResponse.next()
    } catch (error) {
      console.error('[v0] Middleware: Error validating token:', error)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // Allow other routes to pass through
  return NextResponse.next()
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Protect all API routes
    '/api/:path*',
    // Protect app routes that might need auth (optional)
    // '/dashboard/:path*',
    // '/ordenes/:path*',
  ],
}
