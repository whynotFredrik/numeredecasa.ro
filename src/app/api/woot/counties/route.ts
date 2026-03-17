import { NextResponse } from 'next/server';
import { getCounties } from '@/lib/woot/client';

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

    console.log('[API /woot/counties] Total counties from API:', list.length);
    if (list.length > 0) {
      console.log('[API /woot/counties] Sample item:', JSON.stringify(list[0]).slice(0, 300));
    }

    // Filter to Romanian counties only
    // Locations have country_id — counties likely do too
    // Romania country_id is typically 1 in WOOT
    if (list.length > 45) {
      // Try filtering by country_id field
      const roCounties = list.filter((item: any) => {
        const cid = item.country_id;
        // Keep if country_id is 1 (Romania) or if country_code is 'RO'
        if (cid === 1 || cid === '1') return true;
        if (item.country_code === 'RO' || item.country_code === 'ro') return true;
        return false;
      });

      if (roCounties.length >= 30 && roCounties.length < list.length) {
        console.log('[API /woot/counties] Filtered to', roCounties.length, 'Romanian counties (by country_id/country_code)');
        list = roCounties;
      } else {
        console.log('[API /woot/counties] country_id filter got', roCounties.length, '— checking country field');
        // Maybe the field is named differently, log available fields
        if (list[0]) {
          console.log('[API /woot/counties] Available fields:', Object.keys(list[0]));
        }
      }
    }

    // Sort alphabetically
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
