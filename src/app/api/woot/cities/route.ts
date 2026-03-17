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

  try {
    const data = await getCities(countyId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Eroare la încărcarea localităților.' },
      { status: 500 }
    );
  }
}
