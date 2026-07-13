// Next.js standard middleware simulation for security and routing

export class NextResponse {
  headers = {
    set(name: string, value: string): void {}
  };
  static next(): NextResponse {
    return new NextResponse();
  }
  static redirect(url: any): NextResponse {
    return new NextResponse();
  }
}

export type NextRequest = any;

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. Retrieve session cookie (as is standard in Supabase ssr)
  const sessionToken = request.cookies.get('sb-access-token')?.value || '';
  const isProfileCompleteCookie = request.cookies.get('floussi-profile-complete')?.value === 'true';

  // 2. White-listed OAuth domains & public pages
  const isPublicPage = 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/webhook') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email' ||
    pathname === '/pricing';

  // 3. Security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;"
  );

  // 4. Rate-limiting for API Routes (mock implementation)
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    // Standard implementation: track timestamp/counts
    // We pass-through for the mock server but add rate-limiting logs
    console.log(`[Middleware RateLimit] Request to ${pathname} from IP ${ip}`);
  }

  // 5. App routing rules
  if (!sessionToken && !isPublicPage) {
    // Non-authenticated user accessing private route: redirect to login
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (sessionToken) {
    // Authenticated but accessing auth pages: redirect to dashboard
    if (pathname === '/login' || pathname === '/register') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Authenticated but profile is incomplete: redirect to onboarding (except if already on onboarding or api routes)
    if (!isProfileCompleteCookie && pathname !== '/onboarding' && !pathname.startsWith('/api/')) {
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    // Authenticated & completed profile: prevent going back to onboarding
    if (isProfileCompleteCookie && pathname === '/onboarding') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// Ensure middleware runs only on specified paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|assets|capacitor.config.ts).*)',
  ],
};
