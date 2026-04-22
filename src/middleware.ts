import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /admin routes and /api/admin routes
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Get the Authorization header
  const authHeader = request.headers.get('authorization');

  // Get admin password from environment
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('[Admin Auth] ADMIN_PASSWORD not set in environment');
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
  }

  // Check if auth header exists
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Dashboard"',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Decode Basic Auth credentials
  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // Verify credentials (username: "admin", password from env var)
  if (username !== 'admin' || password !== adminPassword) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid credentials' }),
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Dashboard"',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
