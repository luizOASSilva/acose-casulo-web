import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Accept: 'application/json',
        Cookie: request.headers.get('cookie') ?? '',
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
