import { NextRequest, NextResponse } from 'next/server';
import { getLockerList } from '@/lib/woot/client';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  try {
    const data = await getLockerList({
      countyId: params.get('county_id') || undefined,
      cityId: params.get('city_id') || undefined,
      courierId: params.get('courier_id') || undefined,
      lockType: params.get('lockType') || undefined,
      hasDelivery: params.get('hasDelivery') || undefined,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Eroare la încărcarea lockerelor.' },
      { status: 500 }
    );
  }
}
