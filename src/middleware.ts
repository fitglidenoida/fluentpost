import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { securityHeaders, handleCORS } from '@/lib/securityHeaders'

export default function middleware(req: any) {
  // Apply security headers
  let response = securityHeaders(req)
  
  // Apply CORS headers
  response = handleCORS(req)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - api/topics (topics API - allow public access)
     * - api/blog-posts (blog posts API - allow public access)
     * - api/analytics (analytics API - allow public access)
     * - api/seo (SEO API routes - allow public access)
     * - api/websites (websites API - allow public access)
     * - auth (auth pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/topics|api/blog-posts|api/analytics|api/seo|api/websites|auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
