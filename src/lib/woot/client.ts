/**
 * WOOT API Client — broker de expediții (woot.ro)
 * Documentație: https://ws.woot.ro/latest/
 */

const WOOT_API_BASE = 'https://ws.woot.ro/latest';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Authenticate and get a bearer token (cached for 24h)
 */
async function getToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  const publicKey = process.env.WOOT_PUBLIC_KEY;
  const secretKey = process.env.WOOT_SECRET_KEY;

  if (!publicKey || !secretKey) {
    throw new Error('WOOT_PUBLIC_KEY și WOOT_SECRET_KEY trebuie configurate în .env.local');
  }

  // Log the request for debugging
  console.log('[WOOT Auth] Attempting auth to:', `${WOOT_API_BASE}/account/authorize`);

  const res = await fetch(`${WOOT_API_BASE}/account/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      public_key: publicKey,
      secret_key: secretKey,
    }),
  });

  // Log full response for debugging
  const responseText = await res.text();
  console.log(`[WOOT Auth] Response status: ${res.status}, body: ${responseText.slice(0, 500)}`);

  if (res.status === 429) {
    throw new Error('Prea multe încercări de autentificare WOOT. Încearcă mai târziu.');
  }

  if (!res.ok) {
    throw new Error(`Autentificare WOOT eșuată (HTTP ${res.status}): ${responseText.slice(0, 200)}`);
  }

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Răspuns autentificare WOOT invalid (nu e JSON): ${responseText.slice(0, 200)}`);
  }

  console.log('[WOOT Auth] Parsed response keys:', Object.keys(data));

  // Flexible token extraction — handle various response shapes
  const token = data.token || data.access_token || data.data?.token;
  if (!token) {
    throw new Error(`Răspuns autentificare WOOT: nu conține token. Keys: ${Object.keys(data).join(', ')}`);
  }

  cachedToken = token;
  const expireSeconds = data.expire || data.expires_in || data.data?.expire || 86400;
  tokenExpiresAt = Date.now() + expireSeconds * 1000;

  console.log('[WOOT Auth] Token obtained, expires in', expireSeconds, 'seconds');
  return cachedToken!;
}

/**
 * Make an authenticated request to the WOOT API
 */
async function wootFetch(
  path: string,
  options: { method?: string; body?: any; params?: Record<string, string> } = {}
) {
  const token = await getToken();

  const url = new URL(`${WOOT_API_BASE}${path}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  console.log(`[WOOT Fetch] ${options.method || 'GET'} ${url.toString()}`);

  const res = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (res.status === 401) {
    // Token expired, clear cache and retry once
    cachedToken = null;
    tokenExpiresAt = 0;
    const newToken = await getToken();

    const retryRes = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });

    if (!retryRes.ok) {
      const body = await retryRes.text().catch(() => '');
      throw new Error(`WOOT API error: ${retryRes.status} — ${body.slice(0, 200)}`);
    }

    return retryRes.json();
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`[WOOT Fetch] Error ${res.status} for ${path}:`, body.slice(0, 300));
    throw new Error(`WOOT API error ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json();
}

// ─── General Endpoints ───

export async function getCounties(countryId?: string) {
  return wootFetch('/general/counties', {
    params: countryId ? { country_id: countryId } : {},
  });
}

export async function getLocalities(countyId: string) {
  return wootFetch('/general/localities', {
    params: { county_id: countyId },
  });
}

export async function getCities(countyId: string) {
  return wootFetch('/general/cities', {
    params: { county_id: countyId },
  });
}

/**
 * GET /general/locations — Returns pickup/delivery locations (lockers, easybox points, etc.)
 * Params: country_id, city_id, courier_id, county_id, sender (bool), receiver (bool)
 */
export async function getLocations(filters?: {
  countryId?: string;
  countyId?: string;
  cityId?: string;
  courierId?: string;
  sender?: boolean;
  receiver?: boolean;
}) {
  return wootFetch('/general/locations', {
    params: {
      ...(filters?.countryId ? { country_id: filters.countryId } : {}),
      ...(filters?.countyId ? { county_id: filters.countyId } : {}),
      ...(filters?.cityId ? { city_id: filters.cityId } : {}),
      ...(filters?.courierId ? { courier_id: filters.courierId } : {}),
      ...(filters?.sender !== undefined ? { sender: String(filters.sender) } : {}),
      ...(filters?.receiver !== undefined ? { receiver: String(filters.receiver) } : {}),
    } as Record<string, string>,
  });
}

export async function getCouriers() {
  return wootFetch('/general/couriers');
}

export async function getServices() {
  return wootFetch('/general/services');
}

// ─── Order Endpoints ───

export async function createOrder(orderData: Record<string, any>) {
  return wootFetch('/order/create', {
    method: 'POST',
    body: orderData,
  });
}

export async function validateOrder(orderData: Record<string, any>) {
  return wootFetch('/order/validate', {
    method: 'GET',
    params: orderData as Record<string, string>,
  });
}

export async function updateOrder(orderData: Record<string, any>) {
  return wootFetch('/order/update', {
    method: 'PUT',
    body: orderData,
  });
}

export async function cancelOrder(orderId: string) {
  return wootFetch('/order/cancel', {
    method: 'DELETE',
    body: { order_id: orderId },
  });
}

// ─── Repayments ───

export async function getRepayments(params?: Record<string, string>) {
  return wootFetch('/repayments', { params });
}

export async function getRepaymentReports(params?: Record<string, string>) {
  return wootFetch('/repayments/reports', { params });
}
