import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    || req.nextUrl.pathname.startsWith('/programacions')
    || req.nextUrl.pathname.startsWith('/unitats')
    || req.nextUrl.pathname.startsWith('/examens')
    || req.nextUrl.pathname.startsWith('/usuaris')
    || req.nextUrl.pathname.startsWith('/plantilles')

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}