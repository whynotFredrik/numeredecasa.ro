import { NextRequest, NextResponse } from 'next/server';
import { getLocations } from '@/lib/woot/client';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const countyId = params.get('county_id') || undefined;
  const cityId = params.get('city_id') || undefined;

  console.log('[API /woot/lockers] Request params:', { countyId, cityId });

  try {
    const data = await getLocations({
      countyId,
      cityId,
      receiver: true, // Only delivery locations (lockers, easybox)
    });

    // Normalize response to array
    let list: any[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data?.list && Array.isArray(data.list)) {
      list = data.list;
    } else if (data?.data && Array.isArray(data.data)) {
      list = data.data;
    }

    console.log('[API /woot/lockers] Found', list.length, 'locations');
    if (list.length > 0) {
      console.log('[API /woot/lockers] Sample:', JSON.stringify(list[0]).slice(0, 400));
    }

    return NextResponse.json(list);
  } catch (error: any) {
    console.error('[API /woot/lockers] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Eroare la încărcarea lockerelor.' },
      { status: 500 }
    );
  }
}
