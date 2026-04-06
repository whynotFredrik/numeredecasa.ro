// Template-uri HTML pentru emailurile tranzacționale

interface OrderItem {
  product_type: string;
  finish: string;
  main_number?: string;
  street_name?: string;
  office_name?: string;
  office_function?: string;
  office_orientation?: string;
  house_orientation?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderData {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  shipping_method: string;
  shipping_county?: string;
  shipping_city?: string;
  shipping_address?: string;
  easybox_id?: string;
  subtotal_amount: number;
  shipping_amount: number;
  total_amount: number;
  items: OrderItem[];
}

function getProductName(type: string): string {
  switch (type) {
    case 'house': return 'Număr de Casă';
    case 'apartment': return 'Număr de Apartament';
    case 'office': return 'Plăcuță de Birou';
    default: return type;
  }
}

function getFinishName(finish: string): string {
  switch (finish) {
    case 'black': return 'Negru Mat';
    case 'white': return 'Alb Satinat';
    case 'brown': return 'Maro Texturat';
    case 'lightgray': return 'Gri Deschis Satinat';
    default: return finish;
  }
}

function getOrientationName(orientation?: string): string {
  return orientation === 'centered' ? 'Centrat' : 'Lateral';
}

function formatItemDetails(item: OrderItem): string {
  const lines: string[] = [];

  if (item.product_type === 'house') {
    if (item.main_number) lines.push(`Număr: <strong>${item.main_number}</strong>`);
    if (item.street_name) lines.push(`Stradă: <strong>${item.street_name}</strong>`);
    lines.push(`Orientare: <strong>${getOrientationName(item.house_orientation)}</strong>`);
  } else if (item.product_type === 'apartment') {
    if (item.main_number) lines.push(`Număr: <strong>${item.main_number}</strong>`);
  } else if (item.product_type === 'office') {
    if (item.office_name) lines.push(`Nume: <strong>${item.office_name}</strong>`);
    if (item.office_function) lines.push(`Funcție: <strong>${item.office_function}</strong>`);
    lines.push(`Orientare: <strong>${getOrientationName(item.office_orientation)}</strong>`);
  }

  lines.push(`Culoare: <strong>${getFinishName(item.finish)}</strong>`);

  return lines.join('<br/>');
}

export function orderConfirmationEmail(order: OrderData): { subject: string; html: string } {
  const subject = `Confirmare comandă #${order.id.slice(0, 8).toUpperCase()} — numarul.ro`;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #eee;">
        <strong>${getProductName(item.product_type)}</strong><br/>
        <span style="font-size: 13px; color: #666;">${formatItemDetails(item)}</span>
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 16px; border-bottom: 1px solid #eee; text-align: right;">${item.total_price.toFixed(2)} RON</td>
    </tr>
  `).join('');

  const shippingInfo = order.shipping_method === 'easybox'
    ? `Livrare în Locker/EasyBox (ID: ${order.easybox_id || '-'})`
    : `Curier la adresă: ${order.shipping_address || ''}, ${order.shipping_city || ''}, ${order.shipping_county || ''}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F0EDE8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0EDE8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FDFCFA; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1A1A1A; padding: 32px; text-align: center;">
              <h1 style="color: #F0EDE8; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">NUMARUL.RO</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 16px;">
              <h2 style="margin: 0 0 8px; font-size: 20px; color: #1A1A1A;">Mulțumim pentru comandă!</h2>
              <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6;">
                Bună ${order.customer_first_name},<br/>
                Comanda ta <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> a fost înregistrată cu succes. Vom începe producția imediat ce plata este confirmată.
              </p>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #F0EDE8;">
                  <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: #888; font-weight: 600;">Produs</th>
                  <th style="padding: 12px 16px; text-align: center; font-size: 13px; color: #888; font-weight: 600;">Cant.</th>
                  <th style="padding: 12px 16px; text-align: right; font-size: 13px; color: #888; font-weight: 600;">Preț</th>
                </tr>
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 32px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px;">${order.subtotal_amount.toFixed(2)} RON</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Livrare</td>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px;">${order.shipping_amount > 0 ? order.shipping_amount.toFixed(2) + ' RON' : 'GRATUIT'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-top: 2px solid #A0926B; font-size: 16px; font-weight: 700;">Total</td>
                  <td style="padding: 12px 0; border-top: 2px solid #A0926B; text-align: right; font-size: 16px; font-weight: 700;">${order.total_amount.toFixed(2)} RON</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #F0EDE8; border-radius: 8px; padding: 16px;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #888; font-weight: 600;">LIVRARE</p>
                <p style="margin: 0; font-size: 14px; color: #333;">${shippingInfo}</p>
              </div>
            </td>
          </tr>

          <!-- Timeline -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <div style="background-color: #F0EDE8; border-radius: 8px; padding: 16px; border-left: 4px solid #A0926B;">
                <p style="margin: 0; font-size: 14px; color: #1A1A1A;">
                  Termen de livrare estimat: <strong>4-6 zile lucrătoare</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F0EDE8; padding: 24px 32px; text-align: center; border-top: 1px solid #e0dbd4;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #888;">
                Ai întrebări? Răspunde direct la acest email sau contactează-ne pe site.
              </p>
              <p style="margin: 0; font-size: 12px; color: #bbb;">
                &copy; ${new Date().getFullYear()} numarul.ro — Plăcuțe personalizate, fabricate în România
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

// ── Email Referral cu Cod de Reducere 15% ──

interface ReferralEmailData {
  customerFirstName: string;
  discountCode: string;
  discountPercent: number;
  expiresAt: string;
  maxUses: number;
}

export function referralDiscountEmail(data: ReferralEmailData): { subject: string; html: string } {
  const subject = `Un cadou special pentru familia și prietenii tăi — ${data.discountPercent}% reducere!`;

  const expiryDate = new Date(data.expiresAt).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F0EDE8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0EDE8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FDFCFA; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1A1A1A; padding: 32px; text-align: center;">
              <h1 style="color: #F0EDE8; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">NUMARUL.RO</h1>
            </td>
          </tr>

          <!-- Gift Icon -->
          <tr>
            <td style="padding: 40px 32px 16px; text-align: center;">
              <div style="display: inline-block; background-color: #F0EDE8; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px; color: #A0926B;">&#127873;</div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 16px 32px 24px; text-align: center;">
              <h2 style="margin: 0 0 16px; font-size: 24px; color: #1A1A1A; line-height: 1.3;">
                ${data.customerFirstName}, ai un cadou special<br/>pentru familia și prietenii tăi!
              </h2>
              <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6; max-width: 440px; display: inline-block;">
                Sperăm că ești mulțumit(ă) de plăcuța ta! Am pregătit un cod de reducere exclusiv pe care îl poți trimite familiei sau prietenilor care vor și ei o plăcuță personalizată.
              </p>
            </td>
          </tr>

          <!-- Discount Code Box -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #1A1A1A; border-radius: 16px; padding: 32px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #A0926B; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">COD DE REDUCERE</p>
                <p style="margin: 0 0 12px; font-size: 36px; font-weight: 800; color: #F0EDE8; letter-spacing: 4px; font-family: monospace;">${data.discountCode}</p>
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #A0926B;">${data.discountPercent}% REDUCERE</p>
              </div>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #F0EDE8; border-radius: 12px; padding: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="font-size: 13px; color: #888;">Poate fi folosit de</span>
                      <span style="float: right; font-size: 14px; font-weight: 600; color: #1A1A1A;">până la ${data.maxUses} persoane</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #e0dbd4;">
                      <span style="font-size: 13px; color: #888;">Valabil până la</span>
                      <span style="float: right; font-size: 14px; font-weight: 600; color: #1A1A1A;">${expiryDate}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #e0dbd4;">
                      <span style="font-size: 13px; color: #888;">Se aplică pe</span>
                      <span style="float: right; font-size: 14px; font-weight: 600; color: #1A1A1A;">toate produsele</span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <p style="margin: 0 0 16px; color: #555; font-size: 14px; line-height: 1.6;">
                Trimite acest cod familiei sau prietenilor tăi — ei trebuie doar să îl introducă la checkout pe site-ul nostru.
              </p>
              <a href="https://numarul.ro/configurator" style="display: inline-block; background-color: #A0926B; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px;">
                Vizitează numarul.ro
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F0EDE8; padding: 24px 32px; text-align: center; border-top: 1px solid #e0dbd4;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #888;">
                Ai întrebări? Răspunde direct la acest email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #bbb;">
                &copy; ${new Date().getFullYear()} numarul.ro — Plăcuțe personalizate, fabricate în România
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

export function paymentConfirmedEmail(order: OrderData): { subject: string; html: string } {
  const subject = `Plata confirmată — Comandă #${order.id.slice(0, 8).toUpperCase()}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F0EDE8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0EDE8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FDFCFA; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1A1A1A; padding: 32px; text-align: center;">
              <h1 style="color: #F0EDE8; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">NUMARUL.RO</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #F0EDE8; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px; color: #A0926B;">&#10003;</div>
              </div>
              <h2 style="margin: 0 0 16px; font-size: 20px; color: #1A1A1A; text-align: center;">Plata a fost confirmată!</h2>
              <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6; text-align: center;">
                Bună ${order.customer_first_name},<br/>
                Plata pentru comanda <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> în valoare de <strong>${order.total_amount.toFixed(2)} RON</strong> a fost procesată cu succes.
              </p>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <div style="background-color: #F0EDE8; border-radius: 8px; padding: 20px;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #A0926B; font-weight: 600;">CE URMEAZĂ</p>
                <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
                  Comanda ta a intrat în producție. Plăcuțele sunt fabricate manual cu atenție la detalii. Vei primi un email cu AWB-ul de la curier în momentul expedierii.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F0EDE8; padding: 24px 32px; text-align: center; border-top: 1px solid #e0dbd4;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #888;">
                Ai întrebări? Răspunde direct la acest email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #bbb;">
                &copy; ${new Date().getFullYear()} numarul.ro — Plăcuțe personalizate, fabricate în România
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
