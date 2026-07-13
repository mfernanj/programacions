import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isProtectedPage = ['/dashboard', '/programacions', '/unitats', '/examens', '/usuaris', '/plantilles']
    .some((path) => req.nextUrl.pathname.startsWith(path))

  if (isProtectedPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
