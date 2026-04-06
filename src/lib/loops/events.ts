import { loops, LOOPS_EVENTS } from './client';

interface OrderEventData {
  email: string;
  firstName: string;
  lastName: string;
  orderId: string;
  totalAmount: number;
  productTypes: string; // "Număr de Casă, Plăcuță de Birou"
}

interface ReferralEventData {
  email: string;
  firstName: string;
  discountCode: string;
  discountPercent: number;
  expiresAt: string;
  maxUses: number;
}

interface ReviewRequestData {
  email: string;
  firstName: string;
  orderId: string;
  productType: string;
}

// ── Funcții pentru trimiterea evenimentelor către Loops ──

/**
 * Trimite eveniment când comanda este livrată.
 * Declanșează secvența de email-uri în Loops:
 *   1. Mulțumire + cod de reducere referral (imediat)
 *   2. Solicită recenzie (după 3 zile)
 *   3. Reminder cod de reducere (după 30 zile)
 *   4. Avertisment expirare cod (după 75 zile)
 */
export async function sendOrderDeliveredEvent(data: OrderEventData & ReferralEventData) {
  try {
    const response = await loops.sendEvent({
      email: data.email,
      eventName: LOOPS_EVENTS.ORDER_DELIVERED,
      contactProperties: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      eventProperties: {
        orderId: data.orderId,
        totalAmount: data.totalAmount,
        productTypes: data.productTypes,
        discountCode: data.discountCode,
        discountPercent: data.discountPercent,
        expiresAt: data.expiresAt,
        maxUses: data.maxUses,
      },
    });

    console.log(`[Loops] Eveniment ${LOOPS_EVENTS.ORDER_DELIVERED} trimis pentru ${data.email}`);
    return { success: true, response };
  } catch (err) {
    console.error('[Loops] Eroare la trimiterea evenimentului order_delivered:', err);
    return { success: false, error: err };
  }
}

/**
 * Trimite eveniment pentru solicitarea unei recenzii.
 */
export async function sendReviewRequestEvent(data: ReviewRequestData) {
  try {
    const response = await loops.sendEvent({
      email: data.email,
      eventName: LOOPS_EVENTS.REVIEW_REQUEST,
      contactProperties: {
        firstName: data.firstName,
      },
      eventProperties: {
        orderId: data.orderId,
        productType: data.productType,
        reviewUrl: 'https://numarul.ro/configurator',
      },
    });

    console.log(`[Loops] Eveniment ${LOOPS_EVENTS.REVIEW_REQUEST} trimis pentru ${data.email}`);
    return { success: true, response };
  } catch (err) {
    console.error('[Loops] Eroare la trimiterea evenimentului review_request:', err);
    return { success: false, error: err };
  }
}

/**
 * Trimite eveniment la prima comandă — adaugă contactul în Loops.
 */
export async function sendFirstOrderEvent(data: OrderEventData) {
  try {
    const response = await loops.sendEvent({
      email: data.email,
      eventName: LOOPS_EVENTS.FIRST_ORDER,
      contactProperties: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      eventProperties: {
        orderId: data.orderId,
        totalAmount: data.totalAmount,
        productTypes: data.productTypes,
      },
    });

    console.log(`[Loops] Eveniment ${LOOPS_EVENTS.FIRST_ORDER} trimis pentru ${data.email}`);
    return { success: true, response };
  } catch (err) {
    console.error('[Loops] Eroare la trimiterea evenimentului first_order:', err);
    return { success: false, error: err };
  }
}

/**
 * Creează sau actualizează un contact în Loops cu datele de la checkout.
 */
export async function upsertLoopsContact(data: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  county?: string;
}) {
  try {
    const response = await loops.updateContact({
      email: data.email,
      properties: {
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.phone && { phone: data.phone }),
        ...(data.city && { city: data.city }),
        ...(data.county && { county: data.county }),
        source: 'numarul.ro',
      },
    });

    console.log(`[Loops] Contact upsert pentru ${data.email}`);
    return { success: true, response };
  } catch (err) {
    // Dacă contactul nu există, creează-l
    try {
      const createResponse = await loops.createContact({
        email: data.email,
        properties: {
          firstName: data.firstName,
          lastName: data.lastName,
          ...(data.phone && { phone: data.phone }),
          ...(data.city && { city: data.city }),
          ...(data.county && { county: data.county }),
          source: 'numarul.ro',
        },
      });

      console.log(`[Loops] Contact creat pentru ${data.email}`);
      return { success: true, response: createResponse };
    } catch (createErr) {
      console.error('[Loops] Eroare la crearea contactului:', createErr);
      return { success: false, error: createErr };
    }
  }
}
