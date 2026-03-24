import { resend, FROM_EMAIL, FROM_NAME } from './client';
import { orderConfirmationEmail, paymentConfirmedEmail } from './templates';

interface OrderWithItems {
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
  items: Array<{
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
  }>;
}

export async function sendOrderConfirmation(order: OrderWithItems) {
  const { subject, html } = orderConfirmationEmail(order);

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      replyTo: 'ciobotaru.serban@gmail.com',
      to: order.customer_email,
      subject,
      html,
    });

    if (error) {
      console.error('[Email] Eroare la trimiterea confirmării comenzii:', error);
      return { success: false, error };
    }

    console.log(`[Email] Confirmare comandă trimisă la ${order.customer_email}, ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Email] Excepție la trimiterea emailului:', err);
    return { success: false, error: err };
  }
}

export async function sendPaymentConfirmation(order: OrderWithItems) {
  const { subject, html } = paymentConfirmedEmail(order);

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      replyTo: 'ciobotaru.serban@gmail.com',
      to: order.customer_email,
      subject,
      html,
    });

    if (error) {
      console.error('[Email] Eroare la trimiterea confirmării plății:', error);
      return { success: false, error };
    }

    console.log(`[Email] Confirmare plată trimisă la ${order.customer_email}, ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Email] Excepție la trimiterea emailului:', err);
    return { success: false, error: err };
  }
}
