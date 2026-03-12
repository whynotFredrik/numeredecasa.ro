// Smartbill API Configuration
// API Docs: https://api.smartbill.ro/

export const SMARTBILL_CONFIG = {
  apiUrl: 'https://ws.smartbill.ro/SBORO/api',
  
  // Your Smartbill email (login email)
  email: process.env.SMARTBILL_EMAIL || '',
  
  // API Token from Smartbill Dashboard -> Contul Meu -> Integrări -> API
  token: process.env.SMARTBILL_TOKEN || '',
  
  // Your company CIF (without "RO" prefix for non-VAT payers)
  companyCif: process.env.SMARTBILL_COMPANY_CIF || '36704546',
  
  // Series name for invoices (configured in Smartbill)
  invoiceSeries: process.env.SMARTBILL_INVOICE_SERIES || 'NDC',
  
  get authHeader() {
    const credentials = Buffer.from(`${this.email}:${this.token}`).toString('base64');
    return `Basic ${credentials}`;
  },
};
