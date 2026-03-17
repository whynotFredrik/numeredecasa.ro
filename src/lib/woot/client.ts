/**
 * WOOT API Client — broker de expediții (woot.ro)
 * Documentație: https://ws.woot.ro/latest/
 */

const WOOT_API_BASE = 'https://ws.woot.ro';

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

  const res = await fetch(`${WOOT_API_BASE}/account/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      public_key: publicKey,
      secret_key: secretKey,
    }),
  });

  if (res.status === 429) {
    throw new Error('Prea multe încercări de autentificare WOOT. Încearcă mai târziu.');
  }

  if (!res.ok) {
    throw new Error('Autentificare WOOT eșuată. Verifică cheile API.');
  }

  const data = await res.json();

  if (!data.success || !data.token) {
    throw new Error('Răspuns autentificare WOOT invalid.');
  }

  cachedToken = data.token;
  // Token expires in `data.expire` seconds (default 86400 = 24h)
  tokenExpiresAt = Date.now() + (data.expire || 86400) * 1000;

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
      throw new Error(`WOOT API error: ${retryRes.status}`);
    }

    return retryRes.json();
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error || `WOOT API error: ${res.status}`);
  }

  return res.json();
}

// ─── General Endpoints ───

export async function getCounties() {
  return wootFetch('/general/counties');
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

export async function getLockerList(filters?: {
  countyId?: string;
  cityId?: string;
  courierId?: string;
  lockType?: string;
  hasDelivery?: string;
}) {
  return wootFetch('/general/lockerList', {
    params: {
      ...(filters?.countyId ? { county_id: filters.countyId } : {}),
      ...(filters?.cityId ? { city_id: filters.cityId } : {}),
      ...(filters?.courierId ? { courier_id: filters.courierId } : {}),
      ...(filters?.lockType ? { lockType: filters.lockType } : {}),
      ...(filters?.hasDelivery ? { hasDelivery: filters.hasDelivery } : {}),
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
