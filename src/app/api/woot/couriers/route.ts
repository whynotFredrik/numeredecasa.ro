import { NextResponse } from 'next/server';
import { getCouriers } from '@/lib/woot/client';

export async function GET() {
  try {
    const data = await getCouriers();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Eroare la încărcarea curierilor.' },
      { status: 500 }
    );
  }
}
