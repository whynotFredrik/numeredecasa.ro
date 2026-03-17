import { NextRequest, NextResponse } from 'next/server';
import { getCities } from '@/lib/woot/client';

export async function GET(request: NextRequest) {
  const countyId = request.nextUrl.searchParams.get('county_id');

  if (!countyId) {
    return NextResponse.json(
      { error: 'Parametrul county_id este obligatoriu.' },
      { status: 400 }
    );
  }

  console.log('[API /woot/cities] Request county_id:', countyId);

  try {
    const data = await getCities(countyId);

    console.log('[API /woot/cities] Raw response type:', typeof data, Array.isArray(data) ? `array(${data.length})` : '');
    if (Array.isArray(data) && data.length > 0) {
      console.log('[API /woot/cities] First item:', JSON.stringify(data[0]).slice(0, 300));
    } else if (data && typeof data === 'object') {
      const keys = Object.keys(data).slice(0, 5);
      console.log('[API /woot/cities] Object keys:', keys);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /woot/cities] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Eroare la încărcarea localităților.' },
      { status: 500 }
    );
  }
}
