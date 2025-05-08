import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory store for rate limiting
// In production, use a distributed cache like Redis
const ipRequestMap = new Map<string, { count: number; timestamp: number }>();

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Get client IP address properly
  // Use X-Forwarded-For header or fall back to connection remote address
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Check if this is an API request
    const currentTime = Date.now()
    const windowMs = 60 * 1000 // 1 minute window
    const maxRequests = 20 // Max requests per minute
    
    const requestData = ipRequestMap.get(ip) || { count: 0, timestamp: currentTime }
    
    // Reset if outside window
    if (currentTime - requestData.timestamp > windowMs) {
      requestData.count = 0
      requestData.timestamp = currentTime
    }
    
    // Increment request count
    requestData.count++
    ipRequestMap.set(ip, requestData)
    
    // Set headers for rate limit info
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - requestData.count).toString())
    
    // If exceeded limit, return 429 Too Many Requests
    if (requestData.count > maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429, headers: response.headers }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}