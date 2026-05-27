import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/targets',
  '/scanning',
  '/vulnerability-report',
  '/risk-scoring',
  '/export',
  '/scan-management',
  '/users',
]

export function proxy(request: NextRequest) {
  const hasRefreshCookie = request.cookies.has('ojsdef_refresh')
  const isProtected = PROTECTED_ROUTES.some((r) =>
    request.nextUrl.pathname.startsWith(r)
  )
  if (isProtected && !hasRefreshCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/targets/:path*',
    '/scanning/:path*',
    '/vulnerability-report/:path*',
    '/risk-scoring/:path*',
    '/export/:path*',
    '/scan-management/:path*',
    '/users/:path*',
  ],
}
