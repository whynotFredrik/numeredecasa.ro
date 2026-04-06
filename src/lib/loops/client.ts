import { LoopsClient } from 'loops';

if (!process.env.LOOPS_API_KEY) {
  console.warn('[Loops] LOOPS_API_KEY nu este configurat — emailurile de marketing nu vor fi trimise');
}

export const loops = new LoopsClient(process.env.LOOPS_API_KEY || '');

// ── Nume de evenimente standard ──
// Aceste evenimente se definesc și în Loops Dashboard → Automations
export const LOOPS_EVENTS = {
  // Trimis când comanda este livrată — declanșează secvența de referral
  ORDER_DELIVERED: 'order_delivered',

  // Trimis câteva zile după livrare — solicită o recenzie
  REVIEW_REQUEST: 'review_request',

  // Trimis când un client nou plasează prima comandă
  FIRST_ORDER: 'first_order',

  // Trimis când un cod de reducere referral este pe cale să expire
  REFERRAL_EXPIRING: 'referral_expiring',
} as const;
