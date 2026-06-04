import { NextRequest, NextResponse } from 'next/server'
import { canonicalUrl, siteConfig } from '@/lib/site'

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
const CANONICAL_HOST = new URL(siteConfig.url).host

const STATIC_SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

function buildContentSecurityPolicy(nonce: string) {
  const styleSrc = IS_DEVELOPMENT
    ? "style-src 'self' 'unsafe-inline'"
    : `style-src 'self' 'nonce-${nonce}'`

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${IS_DEVELOPMENT ? " 'unsafe-eval'" : ''}`,
    styleSrc,
    "img-src 'self' data:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self'${IS_DEVELOPMENT ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
  ]

  if (!IS_DEVELOPMENT) {
    directives.push("upgrade-insecure-requests")
  }

  return directives.join('; ')
}

export function proxy(request: NextRequest) {
  const requestHost = request.headers.get('host')?.toLowerCase()
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.toLowerCase()
  const shouldRedirectHost = requestHost === `www.${CANONICAL_HOST}`
  const shouldRedirectProtocol = requestHost === CANONICAL_HOST && forwardedProtocol === 'http'

  if (!IS_DEVELOPMENT && (shouldRedirectHost || shouldRedirectProtocol)) {
    return NextResponse.redirect(canonicalUrl(request.nextUrl.pathname, request.nextUrl.search), 308)
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce)
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set('Content-Security-Policy', contentSecurityPolicy)
  for (const [header, value] of Object.entries(STATIC_SECURITY_HEADERS)) {
    response.headers.set(header, value)
  }

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
