import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth desactivado temporalmente
export async function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
