import { NextRequest, NextResponse } from 'next/server';

// Simple middleware stub for Next.js middleware routing
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Only apply to protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/courses')) {
    const onboarded = req.cookies.get('onboarding_complete')?.value === 'true';
    if (!onboarded) {
      // redirect to onboarding flow
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/courses/:path*'],
};
