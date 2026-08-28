import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function backendBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  // Prefer IPv4 so the proxy still works when localhost resolves to ::1.
  return raw.replace(/\/$/, '').replace('://localhost', '://127.0.0.1');
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join('/');
  const target = `${backendBase()}/${path}${req.nextUrl.search}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers: { Accept: req.headers.get('accept') || '*/*' },
      cache: 'no-store',
    });
  } catch {
    return Response.json(
      { detail: 'Backend unreachable. Start it with: cd backend && python main.py' },
      { status: 502 }
    );
  }

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  headers.set('Cache-Control', upstream.headers.get('cache-control') || 'no-cache');

  return new Response(upstream.body, { status: upstream.status, headers });
}
