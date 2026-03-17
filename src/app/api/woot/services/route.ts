import { NextResponse } from 'next/server';
import { getServices } from '@/lib/woot/client';

export async function GET() {
  try {
    const data = await getServices();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Eroare la încărcarea serviciilor.' },
      { status: 500 }
    );
  }
}
