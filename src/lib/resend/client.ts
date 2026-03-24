import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('[Resend] RESEND_API_KEY nu este configurat');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Adresa de la care se trimit emailurile
// Trebuie să fie pe un domeniu verificat în Resend (ex: numarul.ro)
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'comenzi@numarul.ro';
export const FROM_NAME = 'numarul.ro';
