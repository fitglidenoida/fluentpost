import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { securityHeaders, handleCORS } from '@/lib/securityHeaders'

export default withAuth(
  function middleware(req) {
    // Apply security headers
    let response = securityHeaders(req)
    
    // Apply CORS headers
    response = handleCORS(req)
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - auth (auth pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
