import { NextResponse } from 'next/server';
import { getCounties } from '@/lib/woot/client';

export async function GET() {
  try {
    const data = await getCounties();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Eroare la încărcarea județelor.' },
      { status: 500 }
    );
  }
}
