import { SMARTBILL_CONFIG } from './config';

interface InvoiceClient {
  name: string;
  email: string;
  phone: string;
  city: string;
  county: string;
  address: string;
}

interface InvoiceProduct {
  name: string;
  code: string;
  quantity: number;
  price: number;       // Preț unitar FĂRĂ TVA
  measuringUnitName: string;
  isTaxIncluded: boolean;
  taxPercentage: number;
}

interface CreateInvoiceParams {
  client: InvoiceClient;
  products: InvoiceProduct[];
  orderId: string;
}

export async function createInvoice({ client, products, orderId }: CreateInvoiceParams) {
  const invoicePayload = {
    companyVatCode: SMARTBILL_CONFIG.companyCif,
    seriesName: SMARTBILL_CONFIG.invoiceSeries,
    isDraft: false,
    useStock: false,
    currency: 'RON',
    language: 'RO',
    precision: 2,
    issueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    mentions: `Comandă online numeredecasa.ro | ID: ${orderId.slice(0, 8).toUpperCase()}`,
    client: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      city: client.city,
      county: client.county,
      address: client.address,
      country: 'Romania',
      saveToDb: true,
    },
    products: products.map(p => ({
      name: p.name,
      code: p.code,
      quantity: p.quantity,
      price: p.price,
      measuringUnitName: p.measuringUnitName || 'buc',
      currency: 'RON',
      isTaxIncluded: p.isTaxIncluded,
      taxPercentage: p.taxPercentage,
      saveToDb: false,
    })),
  };

  try {
    const response = await fetch(`${SMARTBILL_CONFIG.apiUrl}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': SMARTBILL_CONFIG.authHeader,
      },
      body: JSON.stringify(invoicePayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Smartbill] Invoice creation failed:', data);
      return { success: false, error: data };
    }

    console.log(`[Smartbill] Invoice created: Series ${data.series}, Number ${data.number}`);
    return {
      success: true,
      series: data.series,
      number: data.number,
      url: data.url,
    };
  } catch (error: any) {
    console.error('[Smartbill] API error:', error.message);
    return { success: false, error: error.message };
  }
}
