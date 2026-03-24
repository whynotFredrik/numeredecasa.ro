import { NextResponse } from 'next/server';
import { getCounties } from '@/lib/woot/client';

// All 41 Romanian counties + Bucharest — normalized (no diacritics, lowercase)
const ROMANIAN_COUNTIES = new Set([
  'alba', 'arad', 'arges', 'bacau', 'bihor', 'bistrita-nasaud', 'botosani',
  'braila', 'brasov', 'bucuresti', 'buzau', 'calarasi', 'caras-severin',
  'cluj', 'constanta', 'covasna', 'dambovita', 'dolj', 'galati', 'giurgiu',
  'gorj', 'harghita', 'hunedoara', 'ialomita', 'iasi', 'ilfov', 'maramures',
  'mehedinti', 'mures', 'neamt', 'olt', 'prahova', 'salaj', 'satu mare',
  'sibiu', 'suceava', 'teleorman', 'timis', 'tulcea', 'valcea', 'vaslui',
  'vrancea',
  // Common alternate spellings
  'bistrita nasaud', 'caras severin', 'satu-mare',
]);

function stripDiacritics(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .trim();
}

export async function GET() {
  try {
    const data = await getCounties();

    // Normalize response to array
    let list: any[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data?.list && Array.isArray(data.list)) {
      list = data.list;
    } else if (data?.data && Array.isArray(data.data)) {
      list = data.data;
    } else if (typeof data === 'object' && data !== null && !data.error) {
      const values = Object.values(data);
      if (values.length > 0 && typeof values[0] === 'object') {
        list = values as any[];
      }
    }

    console.log('[API /woot/counties] Total from API:', list.length);
    if (list.length > 0) {
      console.log('[API /woot/counties] Sample:', JSON.stringify(list[0]).slice(0, 300));
    }

    // Always filter to Romanian counties — match by name
    if (list.length > 42) {
      const filtered = list.filter((item: any) => {
        const name = stripDiacritics(String(item.name ?? item.county_name ?? ''));
        return ROMANIAN_COUNTIES.has(name);
      });

      console.log('[API /woot/counties] Filtered:', filtered.length, 'Romanian counties');

      if (filtered.length >= 30) {
        list = filtered;
      }
    }

    // Sort alphabetically in Romanian
    list.sort((a: any, b: any) => {
      const nameA = String(a.name ?? a.county_name ?? '');
      const nameB = String(b.name ?? b.county_name ?? '');
      return nameA.localeCompare(nameB, 'ro');
    });

    return NextResponse.json(list);
  } catch (error: any) {
    console.error('[API /woot/counties] ERROR:', error.message);
    return NextResponse.json(
      { error: error.message || 'Eroare la încărcarea județelor.' },
      { status: 500 }
    );
  }
}
